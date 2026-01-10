import os
from pathlib import Path

from fastapi import Depends, FastAPI, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from . import crud
from .database import configure_engine, get_db, init_db
from .models import LeaderboardEntry, LeaderboardResponse, ScoreCreate, ScoreResponse

# Path to frontend build artifacts
FRONTEND_DIST_PATH = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"


def _get_cors_origins() -> list[str]:
    """Get CORS origins from environment or use development defaults."""
    cors_origins_str = os.getenv("CORS_ORIGINS", "")
    if cors_origins_str:
        # Split comma-separated origins
        return [origin.strip() for origin in cors_origins_str.split(",")]
    # Development defaults - when serving frontend from same origin, CORS not needed
    return [
        "http://localhost:5173",
        "http://localhost:4173",
    ]


def create_app() -> FastAPI:
    app = FastAPI(
        title="Circus Clowns Leaderboard API",
        description="Leaderboard backend for Circus Clowns game.",
        version="0.1.0",
    )

    origins = _get_cors_origins()

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.on_event("startup")
    def _startup() -> None:
        configure_engine()
        init_db()

    # Health check endpoint (moved from / to avoid conflicts with frontend)
    @app.get("/health", summary="Health check")
    def health_check():
        return {"status": "ok"}

    # API endpoints
    @app.post(
        "/scores",
        response_model=ScoreResponse,
        status_code=status.HTTP_201_CREATED,
        summary="Submit a new score",
    )
    def submit_score(payload: ScoreCreate, db: Session = Depends(get_db)) -> ScoreResponse:
        score = crud.create_score(db, payload)
        return ScoreResponse(
            id=score.id,
            name=score.name,
            score=score.score,
            date=score.created_at,
        )

    @app.get(
        "/leaderboard",
        response_model=LeaderboardResponse,
        summary="Get leaderboard",
    )
    def read_leaderboard(
        limit: int = Query(10, ge=1, le=100, description="Maximum number of entries"),
        db: Session = Depends(get_db),
    ) -> LeaderboardResponse:
        scores = crud.get_leaderboard(db, limit=limit)
        entries = [
            LeaderboardEntry(
                rank=index + 1,
                name=score.name,
                score=score.score,
                date=score.created_at,
            )
            for index, score in enumerate(scores)
        ]
        return LeaderboardResponse(entries=entries)

    # Serve frontend static files (if they exist)
    if FRONTEND_DIST_PATH.exists():
        # Mount static assets (js, css, images, etc.)
        app.mount("/assets", StaticFiles(directory=FRONTEND_DIST_PATH / "assets"), name="assets")
        
        # Serve index.html for root and any other paths (SPA routing fallback)
        @app.get("/{full_path:path}")
        async def serve_frontend(full_path: str):
            # Check if requesting a specific file
            file_path = FRONTEND_DIST_PATH / full_path
            if file_path.is_file():
                return FileResponse(file_path)
            # Default to index.html for SPA routing
            return FileResponse(FRONTEND_DIST_PATH / "index.html")

    return app


app = create_app()
