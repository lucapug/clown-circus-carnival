# Circus Clowns Backend

FastAPI backend for the Circus Clowns leaderboard. Follows the API contract in `../docs/architecture/openapi-spec.md` and architectural guidance in `../docs/architecture/backend-design.md`.

## Requirements
- Python 3.11 (pinned via `.python-version`)
- [uv](https://docs.astral.sh/uv/)

## Setup
```bash
cd backend
uv sync
```

## Run (dev)
```bash
uv run uvicorn app.main:app --reload --port 8000
```

## Test
```bash
uv run pytest
```

## Notes
- SQLite database stored at `backend/circus_scores.db` by default
- CORS allows `http://localhost:5173` and `http://localhost:4173` for local frontend
- API docs at `http://localhost:8000/docs`
