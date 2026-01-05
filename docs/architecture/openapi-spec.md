# OpenAPI Specification

This document defines the API contract for the Circus Clowns leaderboard backend.

## Base URL

```
http://localhost:8000
```

## Endpoints

### Submit Score

**Endpoint:** `POST /scores`

**Description:** Submit a new score entry to the leaderboard.

**Request Body:**
```yaml
ScoreCreate:
  type: object
  required:
    - name
    - score
  properties:
    name:
      type: string
      minLength: 1
      maxLength: 10
      pattern: "^[a-zA-Z0-9 ]+$"
      description: Player name (alphanumeric and spaces only)
      example: "PLAYER1"
    score:
      type: integer
      minimum: 0
      description: Final score achieved
      example: 12500
```

**Response (201 Created):**
```yaml
ScoreResponse:
  type: object
  properties:
    id:
      type: integer
      description: Unique score entry ID
      example: 1
    name:
      type: string
      description: Player name
      example: "PLAYER1"
    score:
      type: integer
      description: Score value
      example: 12500
    date:
      type: string
      format: date-time
      description: ISO 8601 timestamp of score submission
      example: "2026-01-05T15:00:00Z"
```

**Error Responses:**
- `400 Bad Request`: Invalid request body (validation failed)
- `422 Unprocessable Entity`: Schema validation error

### Get Leaderboard

**Endpoint:** `GET /leaderboard`

**Description:** Retrieve the top 10 scores sorted by highest score.

**Query Parameters:**
```yaml
limit:
  type: integer
  default: 10
  minimum: 1
  maximum: 100
  description: Maximum number of entries to return
  example: 10
```

**Response (200 OK):**
```yaml
LeaderboardResponse:
  type: object
  properties:
    entries:
      type: array
      items:
        type: object
        properties:
          rank:
            type: integer
            description: Position on leaderboard (1-based)
            example: 1
          name:
            type: string
            description: Player name
            example: "PLAYER1"
          score:
            type: integer
            description: Score value
            example: 12500
          date:
            type: string
            format: date-time
            description: ISO 8601 timestamp
            example: "2026-01-05T15:00:00Z"
```

**Error Responses:**
- `422 Unprocessable Entity`: Invalid query parameters

## Schema Compatibility

The backend API is designed to be compatible with the frontend `LeaderboardEntry` interface:

```typescript
// Frontend type (src/types/game.ts)
interface LeaderboardEntry {
  name: string;
  score: number;
  date: string;
}
```

The API response includes additional fields (`id`, `rank`) that can be safely ignored by the frontend, while `name`, `score`, and `date` match exactly.
