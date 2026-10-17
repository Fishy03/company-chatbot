import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.chat import router as chat_router
from app.routes.documents import router as documents_router
from app.routes.auth import router as auth_router
from app.services.qdrant import create_collection


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Checking Qdrant collection...")
    create_collection()
    print("Qdrant is ready.")

    yield


app = FastAPI(lifespan=lifespan)


frontend_origins = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in frontend_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(chat_router)
app.include_router(documents_router)
app.include_router(auth_router)


@app.get("/")
def root():
    return {
        "message": "Company Chatbot API is running"
    }