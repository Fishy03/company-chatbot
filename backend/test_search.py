from app.services.search import search_knowledge


query = "Who should I contact about leave?"

results = search_knowledge(query)


print("\nSearch results:\n")

for result in results:

    print("Score:", result.score)
    print("Document:", result.payload["document"])
    print("Text:", result.payload["text"])
    print("-" * 60)