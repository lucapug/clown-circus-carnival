# Clown Circus Carnival

This project is a modern remake inspired by the classic arcade games *Circus* (Exidy, 1977) and *Clowns* (Midway, 1978).

The goal is to build a small but complete **end-to-end web application** that combines a playable arcade-style game with a leaderboard, while showcasing **professional, AI-assisted development workflows**.

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

## System architecture (high level)

The system is designed with a **clear separation between frontend and backend**.

### Frontend

* React + TypeScript (Vite)
* Tailwind CSS + shadcn/ui
* Handles rendering, input, game loop, and sound effects
* Communicates with the backend via HTTP APIs
* Lives in `/frontend`

### Backend

* Python + FastAPI
* API-first design using OpenAPI as the contract
* Endpoints for:

  * score submission
  * leaderboard retrieval
* SQLite used for local persistence (designed to be replaceable)

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

### Local development (frontend)

Requirements:

* Node.js
* npm

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

### Local development (backend)

Requirements:

* Python 3.11+
* [uv](https://docs.astral.sh/uv/)

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

### Cloud deployment (Render)

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

---

## Repository structure

```
main    → reviewed and integrated state
style   → UI, graphics, and sound effects
logic   → architecture, backend, and gameplay logic
frontend/ → React + Vite frontend application
backend/  → FastAPI + SQLite backend service
```

---

## License

This project is for educational purposes and personal experimentation.

---