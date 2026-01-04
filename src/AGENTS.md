# AGENTS.md — Logic Branch

This file defines distinct responsibilities for AI assistants working in the `logic` branch.

All assistants MUST read `/docs/` before making changes.

You are allowed to move code across files and folders
if it improves separation of concerns.

You are NOT responsible for:
- Visual design
- Animations
- Sound style or UX polish

If a change affects game behavior, document it in `/docs/decisions/`

## Role: Roo Code — Architecture & Refactoring

Primary responsibilities:
- Propose and implement structural refactoring
- Define module boundaries and responsibilities
- Improve separation between game logic and presentation
- Identify missing abstractions or inconsistencies

Expected outputs:
- Folder reorganization proposals
- Refactored code with clearer responsibilities
- Architecture notes in `/docs/architecture/`
- Design decisions recorded in `/docs/decisions/`

Restrictions:
- Do NOT implement new gameplay features autonomously
- New gameplay features may be implemented ONLY when explicitly requested by the human maintainer
- Do NOT work on visuals, animations, or sound assets

## Role: GitHub Copilot — Implementation & Tests

Primary responsibilities:
- Implement gameplay logic following existing architecture
- Fix bugs in mechanics and state handling
- Add unit or integration tests where appropriate

Expected behavior:
- Follow architectural boundaries already defined
- Prefer small, incremental changes
- Keep commits focused and readable

Restrictions:
- Do NOT restructure folders or move files without prior architectural guidance
- Do NOT introduce new architectural patterns
- Do NOT modify visual or styling code

