# Clown Circus Carnival

This project is a modern remake inspired by classic arcade games *Circus* (Exidy, 1977) and *Clowns* (Midway, 1978).

The goal is to build a small but complete **end-to-end web application** that combines a playable arcade-style game with a leaderboard, while showcasing modern AI-assisted development workflows.

---

## Project goals

- Recreate the core mechanics of classic clown-and-balloons arcade games
- Deliver a functional web-based game with sound and visual effects
- Integrate a backend for score persistence and leaderboard
- Demonstrate professional development practices:
  - API-driven development
  - AI-assisted coding
  - CI/CD and reproducibility

---

## Current status

- ✅ Frontend MVP implemented (graphics, sounds, basic gameplay)
- ⏳ Backend and API integration (planned)
- ⏳ Leaderboard persistence (planned)

The frontend currently runs standalone using mocked or local state.  
Backend integration will be introduced in later phases.

---

## System architecture (high-level)

The system is designed with a **clear separation between frontend and backend**.

- **Frontend**
  - React + TypeScript (Vite)
  - Handles rendering, user input, and game loop
  - Communicates with the backend via HTTP APIs

- **Backend** *(planned)*
  - Python + FastAPI
  - Exposes REST endpoints for:
    - score submission
    - leaderboard retrieval
  - Follows an OpenAPI specification used as the contract with the frontend

---

## AI-assisted development workflow

Different AI tools are used with **distinct responsibilities**:

- **Lovable Dev**
  - Rapid prototyping of UI, styling, and sound effects
  - Frontend MVP generation

- **Roo Code**
  - Architectural guidance and refactoring
  - API design and backend scaffolding
  - Documentation support

- **GitHub Copilot**
  - Implementation of gameplay logic and backend functionality
  - Tests and incremental improvements

Guidelines for AI assistants are documented in `/docs/`.

---

## Technologies

Frontend:
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

Backend (planned):
- Python
- FastAPI
- OpenAPI

Tooling:
- GitHub Actions (CI/CD)
- Docker (containerization)
- GitHub Codespaces (development environment)

---

## Development

### Local development

Requirements:
- Node.js
- npm

```sh
git clone <REPOSITORY_URL>
cd clown-circus-carnival
npm install
npm run dev
```

### GitHub Codespaces

The project can also be run using GitHub Codespaces with no local setup required.

---

### Deployment

Deployment will be automated via CI/CD in later phases of the project.
At the current stage, the frontend can be previewed locally or via Lovable.

---

### License

This project is for educational purposes and personal experimentation.