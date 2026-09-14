from app.services.rag import answer_question


question = "Who should I contact about leave?"

answer = answer_question(question)


print("\nQuestion:")
print(question)

print("\nAnswer:")
print(answer)