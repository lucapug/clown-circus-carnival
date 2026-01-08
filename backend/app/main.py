from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


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

    @app.get("/", summary="Health check")
    def health_check():
        return {"status": "ok"}

    return app


app = create_app()
