from pathlib import Path

from app.services.ingestion import ingest_document
from app.services.qdrant import create_collection


create_collection()


file_path = Path("data/company_intro.txt")

text = file_path.read_text(encoding="utf-8")


count = ingest_document(
    text=text,
    document_name=file_path.name
)


print(f"Ingested {count} chunks.")