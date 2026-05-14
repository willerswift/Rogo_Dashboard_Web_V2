# Project Progress & Session Logs

This file serves as a persistent record of work completed, current status, and pending tasks. It should be updated at the end of every working session to ensure continuity.

## Latest Update: May 14, 2026

### Work Completed
- **Implemented Project Action Menu**: Added a three-dot dropdown menu for each project in the organization overview table.
    - Features "Rename Project" and "Delete Project" actions.
    - Implemented `RenameProjectDialog` and `DeleteProjectDialog` components with appropriate form validation and API integration.
    - Added outside-click detection for the dropdown menu.
- **English Localization & UI Sync**: Synchronized all Vietnamese UI elements to English as requested.
    - Translated "Đổi tên Project" -> "Rename Project".
    - Translated "Xóa Project" -> "Delete Project".
    - Translated "Hành động không thể hoàn tác" -> "This action cannot be undone".
    - Standardized table headers to uppercase ("NAME", "PROJECT ID", etc.) to match design specifications.
- **Fixed Organization Create Placeholder**: Corrected the placeholder text in `CreateOrganizationDialog.tsx`.
- **Resolved Vercel Build Failure**:
    - Identified that `pnpm-lock.yaml` was outdated and causing `ERR_PNPM_OUTDATED_LOCKFILE` on Vercel.
    - Removed `pnpm-lock.yaml` to force Vercel to use `npm`.
    - Fixed a TypeScript error in `RenameProjectDialog.tsx` where `authorizedServices` was being mapped incorrectly, causing `next build` to fail.
- **Enhanced UI/UX**:
    - Implemented search functionality for the Access Tree sidebar with auto-expanding organizations.
    - Truncated Project IDs in the project list to improve readability.
    - Added an info icon next to Project IDs that displays the full UUID and provides a "Copy" action via a toast notification.
- **Resolved Environment Issues**:
    - Fixed "Module not found: Can't resolve 'tailwindcss'" by explicitly setting `turbopack.root` in `next.config.ts`.
    - Fixed "Module not found: Can't resolve 'date-fns'" by ensuring all dependencies are installed via `npm install`.
- **Standardized Checkbox Design Globally**: Updated all tickboxes across the application to match the new design system.
    - Redesigned `CheckboxInput` in `features/shared/ui.tsx` to include a required **24x24px size**, **8px border-radius**, and a **checkmark icon** for the ticked state.
    - Implemented specific flexbox styling for the icon container (`size-[22px]`, `flex-col`, `items-center`, `justify-center`) to ensure precise alignment.
    - Replaced raw checkbox inputs in `GrantAccessDialog.tsx`, `ProductsPage.tsx`, `ProductDetailPage.tsx`, `ProjectsPage.tsx`, `LoginForm.tsx`, and `RegisterForm.tsx` with the standardized component.
    - Verified consistent behavior with React Hook Form across all forms.
- **Standardized Table Header Colors**: Updated all table headers globally to use **neutral-800** text color for improved readability and brand alignment.
    - Updated shared components `DataTable` and `TableHead`.
    - Applied changes to manual tables in Users & Permissions, Organizations, Products, and Projects features.
- **Updated Global Input Styles**: Standardized the design of all input boxes (text, email, password, select, and textarea) across the website.
    - Updated `TextInput`, `TextArea`, and `SelectInput` in `features/shared/ui.tsx` to use a **40px height**, **6px border-radius**, and **border-[#E5E7EB]**.
    - Implemented `px-[var(--Spacing-2,8px)]` padding for all standard inputs, with `--Spacing-2: 8px` defined in `globals.css`.
    - Updated manual input implementations in `LoginForm.tsx`, `RegisterForm.tsx`, `ForgotPasswordForm.tsx`, `GrantAccessDialog.tsx`, and `AccessTreeSidebar.tsx` to match the new design.
    - Refactored `CreateOrganizationDialog.tsx` and `CreateProjectDialog.tsx` to use the standardized `TextInput` component and updated their custom styles.
    - Updated the `Input` UI component in `lib/components/ui/input.tsx` for system-wide consistency.
- **Resolved Runtime TypeError & Missing ID in Project Overview**:
    - Added a safeguard to check for `project.uuid` before calling `.slice(0, 8)` in `project-overview.tsx`.
    - Implemented a fallback to the `projectId` prop for the ID display, ensuring the correct ID is always shown even if the API detail response is incomplete.
- **Resolved Critical Git Conflicts & Restored Build**: Successfully resolved multiple git conflict markers across `organization-overview.tsx`, `CreateOrganizationDialog.tsx`, `projects-page.tsx`, and `AccessTreeSidebar.tsx`.
    - Merged new functional features (Project Action Menu, Project ID tooltip/copy, English localization) with the updated design system.
    - Standardized table headers to use **neutral-800** text color and **px-6 py-4** padding.
    - Applied the new **6px border-radius** and **standardized TextInput** components across affected dialogs.
    - Verified the fix with a successful `npm run build` (Next.js/Turbopack).
- **Stabilized UI/UX**:
    - Ensured consistent behavior of the Project ID copy feature in both Organization Overview and Projects Page.
    - Restored the Project Action Menu (Rename/Delete) in the organization table.
    - Cleaned up duplicate code segments caused by improper merge resolution.

### Current Status
- Dashboard shell and core UI components are fully functional and standardized.
- UI is localized to English across all major views.
- Build is stable and passing production checks.
- Dev environment is stabilized.

### Pending Tasks
1. [ ] Implement real staging credentials verification (as noted in `NEXT_SESSION.md`).
2. [ ] Expand feature-specific documentation in the `doc/` folder.
3. [ ] Verify ABAC permission gates with real data.

## Previous Update: May 13, 2026

---
*Note: Always update this file and relevant files in `doc/` before ending a session, as mandated in `GEMINI.md`.*
