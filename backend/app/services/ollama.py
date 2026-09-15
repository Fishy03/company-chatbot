# import requests


# OLLAMA_URL = "http://localhost:11434/api/generate"
# MODEL_NAME = "llama3.2"


# def generate_response(prompt: str) -> str:

#     response = requests.post(
#         OLLAMA_URL,
#         json={
#             "model": MODEL_NAME,
#             "prompt": prompt,
#             "stream": False
#         }
#     )

#     response.raise_for_status()

#     data = response.json()

#     return data["response"]

import os
import requests
from dotenv import load_dotenv

load_dotenv()

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL_NAME = "openai/gpt-oss-20b"


def generate_response(prompt: str) -> str:
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise RuntimeError("GROQ_API_KEY is not configured.")

    response = requests.post(
        GROQ_URL,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        },
        json={
            "model": MODEL_NAME,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "stream": False,
            "include_reasoning": False
        },
        timeout=60
    )

    response.raise_for_status()

    data = response.json()

    return data["choices"][0]["message"]["content"]