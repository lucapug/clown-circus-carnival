# API Integration Guide

This guide explains how to integrate the frontend with the FastAPI backend for leaderboard functionality.

## Development Workflow

### Prerequisites

- Python 3.10+
- Node.js 18+
- [uv](https://docs.astral.sh/uv/) for Python environment and dependency management

### Quick Start

The project uses `uv` for isolated Python environments and `concurrently` for running both services together.

#### Start Both Services (Recommended)

From the project root:

```bash
npm run dev:full
```

This command starts:
- FastAPI backend (via `uv run uvicorn`)
- Vite frontend dev server

#### Start Backend Only

```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

#### Start Frontend Only

```bash
npm run dev
```

### Interactive Documentation

Visit `http://localhost:8000/docs` for Swagger UI or `http://localhost:8000/openapi.json` for the raw OpenAPI spec.

## API Endpoints Reference

### Submit a Score

```typescript
const submitScore = async (name: string, score: number) => {
  const response = await fetch('http://localhost:8000/scores', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, score }),
  });

  if (!response.ok) {
    throw new Error('Failed to submit score');
  }

  return response.json();
};
```

### Get Leaderboard

```typescript
const getLeaderboard = async () => {
  const response = await fetch('http://localhost:8000/leaderboard');

  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard');
  }

  const data = await response.json();
  return data.entries;
};
```

## Frontend Integration Strategy

### Option 1: Direct Replacement

Replace `localStorage` calls directly with API calls in [`CircusGame.tsx`](../src/components/game/CircusGame.tsx):

```typescript
// Before (localStorage)
const saveScore = useCallback((name: string, score: number) => {
  const newEntry: LeaderboardEntry = {
    name,
    score,
    date: new Date().toISOString(),
  };
  const newLeaderboard = [...leaderboard, newEntry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  setLeaderboard(newLeaderboard);
  localStorage.setItem('circus-leaderboard', JSON.stringify(newLeaderboard));
}, [leaderboard]);

// After (API)
const saveScore = useCallback(async (name: string, score: number) => {
  await fetch('http://localhost:8000/scores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, score }),
  });
  // Refresh leaderboard after submission
  fetchLeaderboard();
}, []);

const fetchLeaderboard = useCallback(async () => {
  const response = await fetch('http://localhost:8000/leaderboard');
  const data = await response.json();
  setLeaderboard(data.entries);
}, []);
```

### Option 2: Hybrid Approach (Recommended)

Keep `localStorage` as a fallback for offline/local development:

```typescript
const saveScore = useCallback(async (name: string, score: number) => {
  try {
    await fetch('http://localhost:8000/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, score }),
    });
    await fetchLeaderboard();
  } catch (error) {
    console.warn('API unavailable, using localStorage fallback');
    // Fallback to localStorage logic
  }
}, [fetchLeaderboard]);
```

## Environment Configuration

Create a `.env` file in the frontend root:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Then use it in your code:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
```

## Error Handling

Implement proper error handling for network issues:

```typescript
const handleApiError = (error: unknown) => {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    // Network error - backend likely not running
    console.error('Backend unavailable');
    return;
  }
  // Other errors
  console.error('API error:', error);
};
```

## Testing the Integration

### Manual Testing

1. Start both services: `npm run dev:full`
2. Play the game and submit a score
3. Check the leaderboard displays correctly
4. Verify the score persists after page refresh

### Using curl

```bash
# Submit a score
curl -X POST http://localhost:8000/scores \
  -H "Content-Type: application/json" \
  -d '{"name":"TEST","score":5000}'

# Get leaderboard
curl http://localhost:8000/leaderboard
```

## CORS Configuration

The backend is configured to allow requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:4173` (Vite preview server)

If you need to add additional origins, modify the `CORSMiddleware` configuration in [`backend/app/main.py`](../backend/app/main.py).

## Backend Development with uv

### Adding Dependencies

```bash
cd backend
uv add fastapi uvicorn sqlalchemy pydantic
```

### Running Commands in the Virtual Environment

```bash
cd backend
uv run <command>
```

### Python Version Management

```bash
# Use specific Python version
uv python pin 3.11
```

## Future Enhancements

For more advanced process management in the future, consider tools like:
- `mprocs` - Feature-rich process manager
- `overmind` - tmux-based process manager
- `just` - Command runner with recipe-based workflows

These can be added as needed without changing the core architecture.
