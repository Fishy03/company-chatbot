from app.services.embeddings import generate_embedding
from app.services.qdrant import client, COLLECTION_NAME


def search_knowledge(
    query: str,
    limit: int = 3,
    score_threshold: float = 0.45
):

    query_embedding = generate_embedding(query)

    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_embedding,
        limit=limit,
        score_threshold=score_threshold,
    )

    return results.points