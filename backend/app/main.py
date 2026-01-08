from fastapi import Depends, FastAPI, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import crud
from .database import get_db, init_db
from .models import LeaderboardEntry, LeaderboardResponse, ScoreCreate, ScoreResponse


def create_app() -> FastAPI:
    app = FastAPI(
        title="Circus Clowns Leaderboard API",
        description="Leaderboard backend for Circus Clowns game.",
        version="0.1.0",
    )

    origins = [
        "http://localhost:5173",
        "http://localhost:4173",
    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.on_event("startup")
    def _startup() -> None:
        init_db()

    @app.get("/", summary="Health check")
    def health_check():
        return {"status": "ok"}

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

    return app


app = create_app()
