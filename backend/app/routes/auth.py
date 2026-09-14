import secrets

from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel


router = APIRouter()


class LoginRequest(BaseModel):
    username: str
    password: str


USERS = {
    "admin": {
        "password": "admin123",
        "role": "admin"
    },
    "employee": {
        "password": "employee123",
        "role": "employee"
    }
}


# Stores active login sessions.
# This is fine for our current local development version.
active_sessions = {}


@router.post("/login")
def login(request: LoginRequest):

    user = USERS.get(request.username)

    if not user or user["password"] != request.password:

        raise HTTPException(
            status_code=401,
            detail="Invalid username or password."
        )


    token = secrets.token_urlsafe(32)


    active_sessions[token] = {
        "username": request.username,
        "role": user["role"]
    }


    return {
        "message": "Login successful.",
        "username": request.username,
        "role": user["role"],
        "token": token
    }


def get_current_user(
    authorization: str | None = Header(default=None)
):

    if not authorization:

        raise HTTPException(
            status_code=401,
            detail="Authentication required."
        )


    if not authorization.startswith("Bearer "):

        raise HTTPException(
            status_code=401,
            detail="Invalid authentication format."
        )


    token = authorization[7:]


    user = active_sessions.get(token)


    if not user:

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired session."
        )


    return user