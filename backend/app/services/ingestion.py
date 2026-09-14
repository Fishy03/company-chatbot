import uuid

from app.services.document_processor import chunk_text
from app.services.embeddings import generate_embedding
from app.services.qdrant import client, COLLECTION_NAME


def ingest_document(
    text: str,
    document_name: str
):

    chunks = chunk_text(text)

    points = []

    for index, chunk in enumerate(chunks):

        embedding = generate_embedding(chunk)

        points.append(
            {
                "id": str(uuid.uuid4()),
                "vector": embedding,
                "payload": {
                    "text": chunk,
                    "document": document_name,
                    "chunk_index": index
                }
            }
        )

    client.upsert(
        collection_name=COLLECTION_NAME,
        points=points
    )

    return len(points)