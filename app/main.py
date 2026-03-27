"""FastAPI application entry and routes."""

from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from starlette.types import Scope

app = FastAPI(
    title="ML/DL",
    description="ML/DL application",
    version="0.1.0",
)

APP_DIR = Path(__file__).resolve().parent
TEMPLATES_DIR = APP_DIR / "templates"
STATIC_DIR = APP_DIR / "static"

class NoCacheStaticFiles(StaticFiles):
    async def get_response(self, path: str, scope: Scope):  # type: ignore[override]
        response = await super().get_response(path, scope)
        # Dev-friendly: ensure updated JS/CSS is always fetched.
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
        return response


# CSS, JS, and future assets (no-cache for development)
app.mount("/static", NoCacheStaticFiles(directory=str(STATIC_DIR)), name="static")


@app.get("/", response_class=HTMLResponse)
def root() -> str:
    """Root route — tech-style landing page."""
    return (TEMPLATES_DIR / "index.html").read_text()


@app.get("/blog", response_class=HTMLResponse)
def blog() -> str:
    """Blog listing page."""
    return (TEMPLATES_DIR / "blog.html").read_text()
