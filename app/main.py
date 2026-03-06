"""FastAPI application entry and routes."""

from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import HTMLResponse

app = FastAPI(
    title="ML/DL",
    description="ML/DL application",
    version="0.1.0",
)

TEMPLATES_DIR = Path(__file__).resolve().parent / "templates"


@app.get("/", response_class=HTMLResponse)
def root() -> str:
    """Root route — tech-style landing page."""
    return (TEMPLATES_DIR / "index.html").read_text()
