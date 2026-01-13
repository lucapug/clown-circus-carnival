# Clown Circus Carnival

This project is a modern remake inspired by the classic arcade games *Circus* (Exidy, 1977) and *Clowns* (Midway, 1978).

The goal is to build a small but complete **end-to-end web application** that combines a playable arcade-style game with a leaderboard, while showcasing **professional, AI-assisted development workflows**.

---

## Table of Contents

- [Project goals](#project-goals)
- [AI-assisted development workflow](#ai-assisted-development-workflow)
- [Current status](#current-status)
- [System architecture](#system-architecture)
- [Technologies](#technologies)
- [Development](#development)
- [Testing](#testing)
- [Continuous Integration](#continuous-integration)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Repository structure](#repository-structure)
- [License](#license)

---

## Project goals

* Recreate the core mechanics of classic clown-and-balloons arcade games
* Deliver a functional web-based game with sound and visual effects
* Introduce a backend for score persistence and leaderboard management
* Demonstrate modern development practices:

  * API-driven development
  * AI-assisted coding with clearly separated roles
  * Reproducibility and CI-ready structure

---

## AI-assisted development workflow

This project intentionally uses multiple AI tools with **non-overlapping responsibilities**, simulating a small development team:

* **Lovable.dev**
  Used for rapid prototyping, UI styling, animations, and sound effects
  *(branch: `style`)*

* **Roo Code (GLM-4.7)**
  Used for architectural reasoning, backend design, API definition, and documentation
  *(branch: `logic`)*

* **GitHub Copilot**
  Used for code-level implementation, incremental changes, and tests
  *(branch: `logic`)*

### Branch Strategy

The repository uses a structured branching model:

* **`main`**: Reviewed and integrated state (documentation & governance)
* **`style`**: UI, graphics, and sound effects
* **`logic`**: Architecture, backend, and gameplay logic

### Merge Rules

To maintain separation of concerns, the following merge rules are enforced:

* `main` must not merge into feature branches (`style` or `logic`)
* `style` and `logic` must not merge into each other
* Guardrails workflow (`.github/workflows/guardrails.yml`) enforces these rules via GitHub Actions

Rules and constraints for AI assistants are documented in:

* `AGENTS.md`
* `src/AGENTS.md`
* `docs/ai-usage.md`

---

## Current status

* ✅ Frontend MVP implemented (graphics, sounds, basic gameplay)
* ✅ Backend implemented (FastAPI + SQLite)
* ✅ Backend–frontend integration complete
* ⏳ Gameplay refinement and logic improvements (in progress)

---

## System architecture

The system is designed with a **clear separation between frontend and backend**.

### Frontend

* React + TypeScript (Vite)
* Tailwind CSS + shadcn/ui
* Handles rendering, input, game loop, and sound effects
* Communicates with the backend via HTTP APIs (see `frontend/src/lib/api.ts`)
* Lives in `/frontend`

### Backend

* Python + FastAPI
* API-first design using OpenAPI as the contract
* Endpoints for:
  * score submission
  * leaderboard retrieval
  * health checks
* Lives in `/backend`

### Database

The backend supports two database configurations:

* **SQLite** (default for local development): File-based, zero configuration
* **PostgreSQL** (Docker/Render): Used when `DATABASE_URL` environment variable is set

**Schema:**

The database contains a single `scores` table:

```sql
CREATE TABLE scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(10) NOT NULL,
    score INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_score_desc ON scores(score DESC);
```

### Production Deployment Architecture

In containerized deployments (Docker/Render), the backend serves both:

* API endpoints at `/scores`, `/leaderboard`, `/health`
* Frontend static files from `frontend/dist` (SPA routing fallback)

This enables single-container deployment with unified origin.

Architecture details and decisions are documented in:

* `docs/architecture/`

---

## Technologies

**Frontend**

* Vite
* TypeScript
* React
* shadcn-ui
* Tailwind CSS

**Backend**

* Python 3.11
* FastAPI
* OpenAPI
* SQLite
* uv (environment & dependency management)

**Tooling**

* GitHub Actions (CI-ready)
* GitHub Codespaces
* Docker
* Render (cloud deployment via blueprint)

---

## Development

### Prerequisites

The following tools are required for local development:

* **Node.js** (v18+) and **npm**
* **Python 3.11+**
* **[uv](https://docs.astral.sh/uv/)** (Python environment & dependency manager)
* **Docker** (for containerized builds and deployment)

Note: GitHub Codespaces includes Node.js, Python, and Docker pre-installed in the standard VM. You'll need to install `uv` separately (see below).

### GitHub Codespaces

This repository is configured for GitHub Codespaces, providing a complete cloud-based development environment.

Codespaces will automatically:
- Provision a VM with Node.js, Python, and Docker pre-installed
- Clone the repository
- Set up your development environment

Once the Codespace is ready, install `uv`:

```sh
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.cargo/env
```

Then run the combined dev workflow:

```sh
npm run dev
```

The frontend will be accessible via the forwarded port 5173, and the backend API at port 8000.

### Root-level Scripts

From the repository root, these scripts are available:

* `npm run dev` - Start both frontend and backend concurrently
* `npm run dev:frontend` - Start frontend only
* `npm run dev:backend` - Start backend only
* `npm run build` - Build frontend for production
* `npm run docker:up` - Start all services via Docker Compose
* `npm run docker:down` - Stop Docker Compose services
* `npm run docker:build` - Rebuild and start Docker Compose services

### Combined development (frontend + backend)

Start both services together from the repository root using the `concurrently`-powered script defined in [package.json](package.json):

```sh
npm run dev
```

### Local development (frontend)

```sh
git clone <REPOSITORY_URL>
cd clown-circus-carnival
cd frontend
npm install
npm run dev
```

The game will be available at:

```
http://localhost:5173
```

#### Environment configuration (frontend)

Copy the example env file and set the API base URL for local development:

```sh
cd frontend
cp .env.example .env
# Edit .env and set:
# VITE_API_BASE_URL=http://localhost:8000
```

### Environment Configuration

Create environment files for local development:

**Frontend (`.env`):**

```bash
VITE_API_BASE_URL=http://localhost:8000
```

**Backend (optional):**

```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/db  # For PostgreSQL
CIRCUS_DB_PATH=/path/to/circus_scores.db  # For SQLite (default)
CORS_ORIGINS=http://localhost:5173,http://localhost:4173
```

### Local development (backend)

```sh
cd backend
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

The API will be available at:

```
http://localhost:8000
```

Interactive API documentation:

```
http://localhost:8000/docs
```

For architecture details, see:

* [`docs/architecture/backend-design.md`](docs/architecture/backend-design.md)
* [`docs/architecture/openapi-spec.md`](docs/architecture/openapi-spec.md)

### Build & preview (frontend)

Create a production build and preview it locally:

```sh
cd frontend
npm run build
npm run preview
```

### Docker

You can run the project either directly with Docker or via npm scripts using Docker Compose.

#### Option 1 – Docker only

From the repository root:

```sh
docker build -t circus-app .
docker run -p 8000:8000 circus-app
```

* Builds the backend (including frontend production build if defined in Dockerfile)
* Runs the backend container on port 8000
* Requires a separate Postgres container if not included in the Dockerfile setup

#### Option 2 – Docker Compose via npm scripts

Using the `docker-compose.yml` already included:

```sh
npm run docker:up
```

* Launches frontend, backend, and Postgres in connected containers
* Database persists in the `postgres_data` volume
* Backend automatically connects to the database

To stop the containers:

```sh
npm run docker:down
```

* Stops and removes all containers while keeping volumes and images intact

### Render

This repository includes a Render setup for one-click deployment:

* Config: [`render.yaml`](render.yaml)
* Backend: Docker-based web service (`circus-backend`) using the root `Dockerfile`
  * Environment: `DATABASE_URL` injected from the managed PostgreSQL instance `circus_db`
  * CORS: `CORS_ORIGINS` set to the Render-hosted frontend
  * Port: 8000 (default)
* Frontend: static site (`circus-frontend`) built from `/frontend` and published from `frontend/dist`
  * Build: `cd frontend && npm ci && npm run build`
  * Environment: `VITE_API_BASE_URL` points to the Render backend (`https://circus-backend.onrender.com`)
* Database: managed PostgreSQL instance `circus_db` (starter plan)

To deploy, create a Render blueprint from `render.yaml` in this repo; Render will provision the backend, frontend, and database automatically.

**Verification:**

After deployment, verify:

* Health check: `https://circus-app.onrender.com/health`
* Frontend: `https://circus-app.onrender.com/`
* API docs: `https://circus-app.onrender.com/docs`

---

## Testing

### Overview

The project includes comprehensive automated tests:

* **Frontend:** 22 tests (Vitest) - Pure logic testing, no UI/canvas
* **Backend:** 22 tests (pytest) - API endpoint testing with in-memory database
* **Total:** 44 tests, all passing

### Frontend Tests

Test files:

* `frontend/src/utils/scoring.test.ts` - Scoring mechanics (15 tests)
* `frontend/src/utils/gameState.test.ts` - Game state management (7 tests)

Running frontend tests:

```bash
cd frontend
npm run test:run    # Single run
npm run test        # Watch mode
```

### Backend Tests

Test file:

* `backend/tests/test_api.py` - API endpoints (22 tests)

Running backend tests:

```bash
cd backend
uv sync --all-extras
uv run pytest tests/test_api.py -v
```

### Test Coverage Summary

| Component | Tests | Coverage |
|-----------|-------|----------|
| Frontend - Scoring Logic | 15 | Balloon/row/bounce calculations |
| Frontend - Game State | 7 | State initialization and updates |
| Backend - Score Submission | 11 | POST /scores validation |
| Backend - Leaderboard | 8 | GET /leaderboard ordering |
| Backend - Integration | 3 | End-to-end workflows |

For detailed test documentation, see `TESTING.md` and `TEST_COMMANDS.md`.

---

## Continuous Integration

### GitHub Actions Workflows

The project uses GitHub Actions for CI/CD:

**CI Workflow** (`.github/workflows/ci.yml`)

* Triggers: Push to `main`, `logic`, `style` branches; Pull requests
* Tests: Frontend (Node.js 22.x) and Backend (Python 3.11)
* Docker build: Sanity check for containerization

**Guardrails Workflow** (`.github/workflows/guardrails.yml`)

* Enforces branch merge direction rules
* Warns if `style` branch touches game logic files
* Ensures required project structure exists

### CI Status

Check CI status in the GitHub Actions tab of the repository.

---

## API Reference

### Base URL

* Local: `http://localhost:8000`
* Production: `https://circus-app.onrender.com`

### Interactive Documentation

Visit `/docs` for Swagger UI or `/openapi.json` for the raw OpenAPI spec.

### Endpoints

#### GET /health

Health check endpoint for deployment monitoring.

**Response (200 OK):**

```json
{ "status": "ok" }
```

#### POST /scores

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

**Validation:**

* `name`: 1-10 characters, alphanumeric + spaces only
* `score`: Non-negative integer

#### GET /leaderboard

Retrieve top scores sorted by highest score.

**Query Parameters:**

* `limit` (optional): 1-100, default 10

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

For full OpenAPI specification, see `docs/architecture/openapi-spec.md`.

---

## Deployment

### Docker

You can run the project either directly with Docker or via npm scripts using Docker Compose.

#### Option 1 – Docker only

From the repository root:

```sh
docker build -t circus-app .
docker run -p 8000:8000 circus-app
```

* Builds the backend (including frontend production build if defined in Dockerfile)
* Runs the backend container on port 8000
* Requires a separate Postgres container if not included in the Dockerfile setup

#### Option 2 – Docker Compose via npm scripts

Using the `docker-compose.yml` already included:

```sh
npm run docker:up
```

* Launches frontend, backend, and Postgres in connected containers
* Database persists in the `postgres_data` volume
* Backend automatically connects to the database

To stop the containers:

```sh
npm run docker:down
```

* Stops and removes all containers while keeping volumes and images intact

### Render

This repository includes a Render setup for one-click deployment:

* Config: [`render.yaml`](render.yaml)
* Backend: Docker-based web service (`circus-backend`) using the root `Dockerfile`
  * Environment: `DATABASE_URL` injected from the managed PostgreSQL instance `circus_db`
  * CORS: `CORS_ORIGINS` set to the Render-hosted frontend
  * Port: 8000 (default)
* Frontend: static site (`circus-frontend`) built from `/frontend` and published from `frontend/dist`
  * Build: `cd frontend && npm ci && npm run build`
  * Environment: `VITE_API_BASE_URL` points to the Render backend (`https://circus-backend.onrender.com`)
* Database: managed PostgreSQL instance `circus_db` (starter plan)

To deploy, create a Render blueprint from `render.yaml` in this repo; Render will provision the backend, frontend, and database automatically.

**Verification:**

After deployment, verify:

* Health check: `https://circus-app.onrender.com/health`
* Frontend: `https://circus-app.onrender.com/`
* API docs: `https://circus-app.onrender.com/docs`

---

## Troubleshooting

### Common Issues

**Backend won't start:**

* Ensure Python 3.11 is installed: `python --version`
* Install uv: `curl -LsSf https://astral.sh/uv/install.sh | sh`
* Check port 8000 is not in use

**Frontend can't connect to backend:**

* Verify backend is running: `curl http://localhost:8000/health`
* Check `VITE_API_BASE_URL` in frontend `.env`
* Verify CORS origins in backend configuration

**Docker build fails:**

* Ensure Docker is running: `docker ps`
* Check Dockerfile syntax
* Review build logs for specific errors

**Tests fail:**

* Frontend: Ensure dependencies installed: `cd frontend && npm install`
* Backend: Run `uv sync --all-extras` in backend directory
* Check test output for specific failures

**Database connection errors:**

* Local: SQLite file created automatically at `backend/circus_scores.db`
* Docker: Ensure postgres container is healthy: `docker ps`
* Render: Check `DATABASE_URL` environment variable

For additional help, see `docs/architecture/api-integration.md`.

---

## Repository structure

```
main    → reviewed and integrated state
style   → UI, graphics, and sound effects
logic   → architecture, backend, and gameplay logic

frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── game/       # Game-specific components
│   │   └── ui/         # shadcn/ui components (40+)
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities and API client
│   ├── pages/          # Page components
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions
└── [config files]

backend/
├── app/
│   ├── main.py         # FastAPI application entry point
│   ├── config.py       # Configuration management
│   ├── database.py     # Database setup
│   ├── crud.py         # Database operations
│   ├── models.py       # Pydantic models
│   └── schemas.py      # SQLAlchemy ORM models
├── tests/              # Backend tests
└── [config files]

docs/
├── architecture/       # Architecture documentation
└── decisions/          # Architectural Decision Records

.github/
├── workflows/          # CI/CD workflows
└── instructions/       # AI agent instructions
```

---

## License

This project is for educational purposes and personal experimentation.

---