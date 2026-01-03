## AI-assisted development

This project started from an AI-generated MVP created with Lovable.dev.
The MVP focused on visuals, basic gameplay, and sound effects.

Subsequent development is intentionally split by responsibility:

- Lovable.dev
  Used only for UI styling, animations, and sound refinement
  (branch: `style`)
- Roo Code
  Used for architectural reasoning, game logic design, and documentation
  (branch: `logic`)
- GitHub Copilot
  Used for code-level implementation, refactoring, and tests
  (branch: `logic`)

This separation is intentional to keep the project small, readable, and aligned with real-world development practices. The proposed lightweight branching strategy is inspired by a small team setup:

`style` focuses on UI/UX and visual/audio polish

`logic` focuses on game logic and backend behavior

`main` is used for review, documentation, and final integration
