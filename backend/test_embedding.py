from app.services.embeddings import generate_embedding


text = "Our company provides software development services."

embedding = generate_embedding(text)

print("Embedding generated!")
print("Vector length:", len(embedding))
print("First 5 values:", embedding[:5])