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

### Prerequisites

The following tools are required for local development:

* **Node.js** (v18+) and **npm**
* **Python 3.11+**
* **[uv](https://docs.astral.sh/uv/)** (Python environment & dependency manager)
* **Docker** (for containerized builds and deployment)

Note: GitHub Codespaces includes Node.js, Python, and Docker pre-installed in the standard VM. You'll need to install `uv` separately (see below).

### GitHub Codespaces

This repository is configured for GitHub Codespaces, providing a complete cloud-based development environment:

1. Click the **Code** button on the GitHub repository page
2. Select the **Codespaces** tab
3. Click **Create codespace on main** (or your target branch)

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

### Containerization (Docker)

Build the multi-stage Docker image (frontend build + backend runtime) using the [Dockerfile](Dockerfile), then run the backend service:

```sh
docker build -t circus-app .
docker run -p 8000:8000 circus-app
```

Note: The root [package.json](package.json) defines `docker:up`, `docker:down`, and `docker:build` scripts that assume a Docker Compose file. If/when a `docker-compose.yml` is added, you can use:

```sh
npm run docker:up       # start services
npm run docker:down     # stop services
npm run docker:build    # build services
```

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