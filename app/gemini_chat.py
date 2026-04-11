"""Server-side proxy for Google Gemini (API key stays in environment, not in the browser)."""

from __future__ import annotations

import os
from typing import Any

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-2.0-flash:generateContent"
)

SYSTEM_INSTRUCTION = (
    "You are an AI assistant on Maleno Santander's portfolio website. "
    "He is a Machine Learning and Deep Learning Engineer. Be helpful, concise and professional. "
    "Answer questions about ML, AI, Deep Learning and software development. "
    "If asked about Maleno, describe him as an experienced ML/DL engineer passionate about "
    "building scalable models and recommendation systems."
)

router = APIRouter(prefix="/api", tags=["gemini"])


class _Part(BaseModel):
    text: str


class _Content(BaseModel):
    role: str = Field(..., description='Either "user" or "model"')
    parts: list[_Part]


class GeminiChatRequest(BaseModel):
    """Conversation turns in Gemini API shape (roles: user | model)."""

    contents: list[_Content]


def _missing_key() -> bool:
    key = os.getenv("GOOGLE_AI_API_KEY", "").strip()
    return not key or key == "your_api_key_here"


@router.post("/gemini/chat")
async def gemini_chat(body: GeminiChatRequest) -> dict[str, Any]:
    if not body.contents:
        raise HTTPException(
            status_code=400,
            detail={"code": "EMPTY", "message": "No messages provided"},
        )

    if _missing_key():
        raise HTTPException(
            status_code=503,
            detail={
                "code": "MISSING_API_KEY",
                "message": "API key not configured. Set GOOGLE_AI_API_KEY in the project root .env file.",
            },
        )

    for c in body.contents:
        if c.role not in ("user", "model"):
            raise HTTPException(status_code=400, detail={"code": "INVALID_ROLE", "message": "Invalid role"})

    api_key = os.getenv("GOOGLE_AI_API_KEY", "").strip()
    url = f"{GEMINI_URL}?key={api_key}"

    payload: dict[str, Any] = {
        "contents": [c.model_dump() for c in body.contents],
        "systemInstruction": {"parts": [{"text": SYSTEM_INSTRUCTION}]},
        "generationConfig": {"temperature": 0.7, "maxOutputTokens": 1000},
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            r = await client.post(url, json=payload, headers={"Content-Type": "application/json"})
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=502,
            detail={"code": "NETWORK", "message": str(e)},
        ) from e

    if r.status_code == 429:
        raise HTTPException(
            status_code=429,
            detail={"code": "RATE_LIMIT", "message": "Too many requests"},
        )

    if r.status_code >= 400:
        raise HTTPException(
            status_code=502,
            detail={"code": "GEMINI_ERROR", "message": r.text[:500]},
        )

    data = r.json()
    candidates = data.get("candidates") or []
    if not candidates:
        raise HTTPException(
            status_code=502,
            detail={"code": "NO_CANDIDATES", "message": "No response from Gemini"},
        )
    try:
        text = candidates[0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError, TypeError) as e:
        raise HTTPException(
            status_code=502,
            detail={"code": "BAD_RESPONSE", "message": "Unexpected response from Gemini"},
        ) from e

    return {"text": text}
