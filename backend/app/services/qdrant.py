from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    Filter,
    FieldCondition,
    MatchValue
)


QDRANT_URL = "http://localhost:6333"
COLLECTION_NAME = "company_knowledge"
VECTOR_SIZE = 768


client = QdrantClient(url=QDRANT_URL)


def create_collection():

    existing_collections = client.get_collections().collections

    collection_names = [
        collection.name for collection in existing_collections
    ]

    if COLLECTION_NAME not in collection_names:

        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(
                size=VECTOR_SIZE,
                distance=Distance.COSINE
            )
        )

        print(f"Created collection: {COLLECTION_NAME}")

    else:

        print(f"Collection already exists: {COLLECTION_NAME}")


def delete_document(document_name: str):

    client.delete(
        collection_name=COLLECTION_NAME,
        points_selector=Filter(
            must=[
                FieldCondition(
                    key="document",
                    match=MatchValue(value=document_name)
                )
            ]
        )
    )