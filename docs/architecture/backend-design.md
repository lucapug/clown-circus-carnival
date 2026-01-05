# Backend Architecture Design

## Overview

This document outlines the architecture for the FastAPI backend serving the Circus Clowns game leaderboard functionality.

## Design Principles

1. **API-First Development**: OpenAPI contract defined before implementation
2. **Separation of Concerns**: Backend is decoupled from frontend logic
3. **Minimal & Extensible**: Start with essential features, easy to extend
4. **Type Safety**: Pydantic models for request/response validation
5. **Local-First**: SQLite database for persistence without external dependencies
6. **Isolated Environment**: Uses `uv` for reproducible Python environment and dependency management

## Technology Stack

- **Framework**: FastAPI 0.115+
- **Database**: SQLite (via SQLAlchemy)
- **Validation**: Pydantic v2
- **Environment Management**: uv
- **CORS**: FastAPI CORSMiddleware for local development
- **Documentation**: Auto-generated OpenAPI/Swagger UI at `/docs`

## API Endpoints

### POST /scores

Submit a new score entry.

**Request Body:**
```json
{
  "name": "PLAYER1",
  "score": 12500
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "name": "PLAYER1",
  "score": 12500,
  "date": "2026-01-05T15:00:00Z"
}
```

**Validation Rules:**
- `name`: 1-10 characters, alphanumeric + spaces
- `score`: Non-negative integer

### GET /leaderboard

Retrieve the top 10 scores sorted by highest score.

**Response (200 OK):**
```json
{
  "entries": [
    {
      "rank": 1,
      "name": "PLAYER1",
      "score": 12500,
      "date": "2026-01-05T15:00:00Z"
    }
  ]
}
```

## Folder Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── models.py            # Pydantic models (request/response)
│   ├── database.py          # SQLAlchemy database setup
│   ├── crud.py              # Database operations
│   └── schemas.py           # Database ORM models
├── pyproject.toml           # Project metadata and dependencies (uv-managed)
├── .python-version          # Python version pin (uv-managed)
└── README.md                # Backend setup instructions
```

## Environment Management

The backend uses `uv` for isolated Python environments and dependency management:

```bash
cd backend
uv sync                    # Install dependencies
uv run uvicorn app.main:app --reload --port 8000
```

### Adding Dependencies

```bash
uv add fastapi uvicorn sqlalchemy pydantic
```

### Python Version

```bash
uv python pin 3.11
```

## Database Schema

```sql
CREATE TABLE scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(10) NOT NULL,
    score INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_score_desc ON scores(score DESC);
```

## CORS Configuration

For local development, allow requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:4173` (Vite preview server)

## Frontend Integration Notes

The frontend should:
1. Replace `localStorage` calls with API calls
2. Handle network errors gracefully (fallback to localStorage)
3. Cache leaderboard data locally to reduce API calls
4. Use the same `LeaderboardEntry` interface (date format matches ISO 8601)

## Migration Path

Future enhancements could include:
- Add `PUT /scores/{id}` for score updates (if needed)
- Add `DELETE /scores/{id}` for moderation
- Add pagination for larger leaderboards
- Add authentication for admin operations
- Migrate to PostgreSQL for production scale
