# Next session handoff

This repo is a greenfield Next.js 16 App Router reference dashboard for the Rogo partner APIs.

## Architecture in place

- `app/(auth)` handles login UI.
- `app/(dashboard)` hosts protected shell routes.
- `app/api/*` proxies browser requests through Next route handlers.
- Tokens stay in httpOnly cookies; the session bootstrap comes from `GET /partner/user/resources`.
- `usePermission(action)` and `PermissionGate` drive tab/action visibility from ABAC V2 entries.

## Important API drift to remember

- Organization create requires `orgId` even though the high-level brief was looser.
- Project key generation uses the code-backed `CreateProjectDto` shape.
- Product release currently ignores the requested `releaseStatus` value in backend code.
- User flows differ: `POST /partner/user/add` creates a partner user, while `POST /partner/project/user/attach` validates/attaches an existing user to a project.

## Current status

- `npm test`, `npm run typecheck`, and `npm run build` pass.
- Unauthenticated smoke checks pass for `/login`, `/`, `/organizations`, `/api/session`, and `/api/partner/user/resources`.
- Authenticated staging verification is still pending real credentials.

## If you continue

1. Run a real login/logout/refresh smoke test against staging.
2. Verify one happy path and one permission-denied path per feature area.
3. Keep commit history conventional and atomic.
