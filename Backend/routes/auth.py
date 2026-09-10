import hashlib
import json
import secrets
from pathlib import Path

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, EmailStr

router = APIRouter()

USERS_FILE = Path(__file__).resolve().parent.parent / "users.json"


class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


def load_users():
    if not USERS_FILE.exists():
        return []

    with open(USERS_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


def save_users(users):
    with open(USERS_FILE, "w", encoding="utf-8") as file:
        json.dump(users, file, indent=2)


def hash_password(password: str):
    return hashlib.sha256(password.encode()).hexdigest()


# Temporary in-memory tokens for API testing
tokens = {}


@router.post("/signup")
def signup(request: SignupRequest):
    users = load_users()

    email = request.email.lower()

    for user in users:
        if user["email"] == email:
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )

    user = {
        "id": len(users) + 1,
        "name": request.name,
        "email": email,
        "password": hash_password(request.password),
    }

    users.append(user)
    save_users(users)

    return {
        "success": True,
        "message": "User registered successfully",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
        },
    }


@router.post("/login")
def login(request: LoginRequest):
    users = load_users()

    email = request.email.lower()
    password_hash = hash_password(request.password)

    user = next(
        (
            user
            for user in users
            if user["email"] == email
            and user["password"] == password_hash
        ),
        None,
    )

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = secrets.token_hex(32)
    tokens[token] = user["id"]

    return {
        "success": True,
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer",
    }


@router.get("/me")
def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authorization header is required"
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization format"
        )

    token = authorization.replace("Bearer ", "", 1).strip()

    user_id = tokens.get(token)

    if user_id is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    users = load_users()

    user = next(
        (user for user in users if user["id"] == user_id),
        None,
    )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "success": True,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
        },
    }
