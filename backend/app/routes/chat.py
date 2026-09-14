from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.services.rag import answer_question
from app.routes.auth import get_current_user


router = APIRouter()


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = Field(default_factory=list)


@router.post("/chat")
def chat(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user)
):

    history = [
        {
            "role": message.role,
            "content": message.content
        }
        for message in request.history
    ]

    response = answer_question(
        question=request.message,
        history=history
    )

    return {
        "response": response
    }