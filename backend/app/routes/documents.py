from collections import Counter
import io

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from pypdf import PdfReader
from docx import Document

from app.services.ingestion import ingest_document

from app.services.qdrant import (
    client,
    COLLECTION_NAME,
    delete_document as delete_qdrant_document
)
from app.routes.auth import get_current_user

router = APIRouter()


@router.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    current_user: dict =Depends(get_current_user)
):

    if current_user["role"] !="admin":

        raise HTTPException(
            status_code=403,
            detail="Only Administrators can upload documents."
        )

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file provided."
        )

    filename = file.filename.lower()

    # Check file type
    if not (
        filename.endswith(".txt")
        or filename.endswith(".pdf")
        or filename.endswith(".docx")
    ):
        raise HTTPException(
            status_code=400,
            detail="Only .txt, .pdf, and .docx files are supported."
        )

    # Read uploaded file
    content = await file.read()

    # -------------------------
    # TXT FILE
    # -------------------------
    if filename.endswith(".txt"):

        try:
            text = content.decode("utf-8")

        except UnicodeDecodeError:
            raise HTTPException(
                status_code=400,
                detail="The text file must be UTF-8 encoded."
            )

    # -------------------------
    # PDF FILE
    # -------------------------
    elif filename.endswith(".pdf"):

        try:
            pdf = PdfReader(io.BytesIO(content))

            pages = []

            for page in pdf.pages:

                page_text = page.extract_text()

                if page_text:
                    pages.append(page_text)

            text = "\n\n".join(pages)

        except Exception as error:

            raise HTTPException(
                status_code=400,
                detail=f"Could not read PDF: {error}"
            )

    # -------------------------
    # DOCX FILE
    # -------------------------
    else:

        try:
            document = Document(io.BytesIO(content))

            paragraphs = []

            for paragraph in document.paragraphs:

                if paragraph.text.strip():
                    paragraphs.append(paragraph.text)

            text = "\n\n".join(paragraphs)

        except Exception as error:

            raise HTTPException(
                status_code=400,
                detail=f"Could not read DOCX: {error}"
            )

    # Make sure we actually extracted something
    if not text.strip():

        raise HTTPException(
            status_code=400,
            detail="The uploaded document contains no readable text."
        )

    # Replace existing document if it already exists
    delete_qdrant_document(file.filename)

    # Send extracted text through our existing
    # chunking + embedding + Qdrant pipeline
    chunk_count = ingest_document(
        text=text,
        document_name=file.filename
    )

    return {
        "message": "Document uploaded successfully.",
        "filename": file.filename,
        "chunks_ingested": chunk_count
    }


@router.get("/documents")
def get_documents(
    current_user: dict = Depends(get_current_user)
):

    documents = Counter()

    offset = None

    while True:

        records, next_offset = client.scroll(
            collection_name=COLLECTION_NAME,
            limit=100,
            offset=offset,
            with_payload=True,
            with_vectors=False
        )

        for record in records:

            if record.payload:

                document_name = record.payload.get("document")

                if document_name:
                    documents[document_name] += 1

        if next_offset is None:
            break

        offset = next_offset

    return {
        "documents": [
            {
                "filename": name,
                "chunks": chunk_count
            }
            for name, chunk_count in documents.items()
        ]
    }


@router.delete("/documents/{filename}")
def delete_document_route(
    filename: str,
    current_user: dict = Depends(get_current_user)
    ):

    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only Administrators can delete documents."
        )

    delete_qdrant_document(filename)

    return {
        "message": "Document deleted successfully.",
        "filename": filename
    }