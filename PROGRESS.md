# Project Progress & Session Logs

This file serves as a persistent record of work completed, current status, and pending tasks. It should be updated at the end of every working session to ensure continuity.

## Latest Update: May 12, 2026

### Work Completed
- Created `doc/flow.md` providing a comprehensive overview of the application's architecture, auth flow, and navigation.
- Established this `PROGRESS.md` file for session-to-session tracking.
- Investigated project structure (Next.js 16, App Router, ABAC permissions).
- **Modified Token Logic**: Removed automatic token refresh to prevent UI flickering on failure. Now, when a token expires (401), the system clears session cookies and redirects to the login page.
    - Updated `lib/server/upstream.ts` to remove retry logic in `withUpstreamAuthRetry`.
    - Updated `app/api/session/route.ts` to remove refresh attempt in session sync.
    - Removed unused `refreshAccessToken` function and cleaned up imports.
- **Updated Branding**: Set custom `web_icon.png` as the browser favicon while maintaining the original sidebar logo.
    - Updated `lib/components/ThemeProvider.tsx` to use `/web_icon.png` for favicon and revert logo to `/Rogo logo_light.svg`.
    - Updated `app/layout.tsx` metadata for browser tab icon.
    - Removed legacy `app/favicon.ico`.
- **Fixed Real-time Project Sync**: Resolved issue where new projects required a manual F5 to appear in the Access Tree.
    - Implemented a lightweight `EventEmitter` in `lib/utils/events.ts`.
    - Updated `CreateProjectDialog.tsx` to emit a `projectCreated` event upon success.
    - Updated `OrgProjectsList` in `AccessTreeSidebar.tsx` to listen for the event and trigger a data re-fetch for the specific organization.
- **Improved UI Hierarchy**: Adjusted indentation of standalone projects (orgId: null) in the Access Tree.
    - Reduced `padding-left` of standalone project buttons to align their status dots with organization arrows. This clarifies that they are top-level items and not nested within the preceding organization.
- **Fixed Organization Collapse**: Resolved issue where an active organization could not be collapsed.
    - Decoupled expansion state from the URL's active organization ID.
    - Implemented auto-expansion on selection while still allowing manual toggle to collapse.

### Current Status
- Project is in a "greenfield" state but with core shell architecture implemented.
- Auth flow and dashboard shell are functional.
- Documentation for app flow is now available in the `doc/` directory.

### Pending Tasks
1. [ ] Implement real staging credentials verification (as noted in `NEXT_SESSION.md`).
2. [ ] Expand feature-specific documentation in the `doc/` folder.
3. [ ] Verify ABAC permission gates with real data.

---
*Note: Always update this file and relevant files in `doc/` before ending a session, as mandated in `GEMINI.md`.*
