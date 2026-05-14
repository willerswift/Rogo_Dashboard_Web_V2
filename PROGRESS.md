# Project Progress & Session Logs

This file serves as a persistent record of work completed, current status, and pending tasks. It should be updated at the end of every working session to ensure continuity.

## Latest Update: May 14, 2026

### Work Completed
<<<<<<< Updated upstream
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

### Current Status
- Dashboard shell is fully functional with project management capabilities (Create, Rename, Delete).
- UI is localized to English across major organization and project views.
- Dev environment is stabilized.
=======
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
- **Improved UI Component Reusability**: Refactored various features to use the shared `CheckboxInput` and `TextInput` components instead of hardcoded Tailwind classes.

### Current Status
- Dashboard shell and core UI components are functional and follow the updated design system.
- Global checkbox and input components are now standardized for all forms.
>>>>>>> Stashed changes

### Pending Tasks
1. [ ] Implement real staging credentials verification (as noted in `NEXT_SESSION.md`).
2. [ ] Expand feature-specific documentation in the `doc/` folder.
3. [ ] Verify ABAC permission gates with real data.

## Previous Update: May 13, 2026

---
*Note: Always update this file and relevant files in `doc/` before ending a session, as mandated in `GEMINI.md`.*
