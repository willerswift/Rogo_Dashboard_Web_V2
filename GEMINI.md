# Project Instructions (GEMINI.md)

This file contains foundational mandates for the Gemini CLI agent when working on this project.

## Session Continuity & Documentation
- **Mandate**: At the start of every session, the agent MUST read `PROGRESS.md` to capture history, context, and status. At the end of every session that involves code changes, architectural decisions, or new feature implementations, the agent MUST update the following:
    1.  `PROGRESS.md`: Record work completed during the session, current system status, and pending tasks for the next session.
    2.  `doc/`: Update relevant documentation files (e.g., `flow.md`) if the changes affect the application flow, architecture, or logic.
- **Tone**: Maintain a professional, senior engineer tone in all documentation.
- **Standard**: Follow the Research -> Strategy -> Execution lifecycle for all tasks.

## Quality Assurance & Validation (QA Agent)
- **Mandate**: Act as a strict QA Agent before finalizing any task. You MUST:
    1. **Requirement Check**: Re-read the user's original request and explicitly verify that every single criteria has been met.
    2. **Self-Testing**: Run relevant build, typecheck, or linting commands (e.g., `npm run build`, `npm run typecheck`, `npm run lint`) to ensure no regressions or build failures were introduced.
    3. **Empirical Validation**: Do not assume success based on code changes alone. You must verify that the logic works without errors or side effects (e.g., event bubbling, state conflicts).
    4. **Confirmation**: Always include a summary of this QA check in your final response to the user before closing the task.
