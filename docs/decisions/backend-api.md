# Architectural Decision: Backend API for Leaderboard

**Date:** 2026-01-05
**Status:** Proposed
**Context:** Architecture & Backend Lead (FastAPI)

## Problem Statement

The current leaderboard implementation uses `localStorage` for persistence, which has limitations:
- Data is local to the user's browser
- No shared leaderboard across players
- Data can be cleared by the user
- No centralized score tracking

## Decision

Implement a FastAPI backend with the following characteristics:

### API Design
- **POST /scores**: Submit a new score
- **GET /leaderboard**: Retrieve top 10 scores
- RESTful design with proper HTTP status codes
- JSON request/response format

### Technology Choices

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Framework | FastAPI | Fast, modern, auto-generates OpenAPI docs |
| Database | SQLite | Zero-config, file-based, sufficient for MVP |
| ORM | SQLAlchemy | Mature, well-documented, works with SQLite |
| Validation | Pydantic v2 | Type-safe, integrates with FastAPI |
| Environment | uv | Fast, modern Python package manager |
| Dev Tooling | concurrently | Simple concurrent service startup |

### Architecture Principles

1. **API-First**: OpenAPI contract defined before implementation
2. **Decoupled**: Backend is independent of frontend implementation
3. **Minimal**: Only essential features for MVP
4. **Extensible**: Easy to add features later (pagination, auth, etc.)

### CORS Configuration

Allow requests from local development servers:
- `http://localhost:5173` (Vite dev)
- `http://localhost:4173` (Vite preview)

### Data Model

```sql
CREATE TABLE scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(10) NOT NULL,
    score INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Alternatives Considered

### Alternative 1: In-Memory Storage
- **Pros**: Simplest implementation
- **Cons**: Data lost on restart, not suitable for production
- **Decision**: Rejected in favor of SQLite

### Alternative 2: External API Service (e.g., Firebase)
- **Pros**: Managed service, scales well
- **Cons**: External dependency, requires account setup
- **Decision**: Rejected for MVP simplicity

### Alternative 3: Backendless (BaaS)
- **Pros**: Quick setup
- **Cons**: Vendor lock-in, less control
- **Decision**: Rejected for learning value and control

## Consequences

### Positive
- Shared leaderboard across players
- Persistent score storage
- Clear separation of concerns
- Well-documented API via Swagger UI
- Type-safe with Pydantic models

### Negative
- Additional service to run during development
- Requires Python environment setup
- Network latency for API calls

### Migration Path

Future enhancements:
1. Add authentication for admin operations
2. Add score editing/deletion endpoints
3. Implement pagination for larger leaderboards
4. Migrate to PostgreSQL for production scale
5. Add rate limiting to prevent abuse

## Implementation Notes

- Use `uv` for Python environment management
- Use `concurrently` for running backend and frontend together
- Frontend should implement fallback to localStorage if API is unavailable
- Database file will be created at `backend/circus_scores.db`

## References

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [uv Documentation](https://docs.astral.sh/uv/)
- [OpenAPI Specification](https://swagger.io/specification/)
