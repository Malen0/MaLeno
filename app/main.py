"""FastAPI application entry and routes."""

from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI(
    title="ML/DL",
    description="ML/DL application",
    version="0.1.0",
)

APP_DIR = Path(__file__).resolve().parent
TEMPLATES_DIR = APP_DIR / "templates"
STATIC_DIR = APP_DIR / "static"

# CSS, JS, and future assets
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


@app.get("/", response_class=HTMLResponse)
def root() -> str:
    """Root route — tech-style landing page."""
    return (TEMPLATES_DIR / "index.html").read_text()


@app.get("/blog", response_class=HTMLResponse)
def blog() -> str:
    """Blog listing page."""
    return (TEMPLATES_DIR / "blog.html").read_text()
