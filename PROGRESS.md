# Project Progress & Session Logs

This file serves as a persistent record of work completed, current status, and pending tasks. It should be updated at the end of every working session to ensure continuity.

## Latest Update: May 21, 2026

### Work Completed
- **Re-implemented Partner Switcher Dropdown**:
    - **Interactive Menu**: Restored the interactive dropdown menu when clicking the "Partner: ROGO" header in the Access Tree Sidebar, which was lost during a previous code merge.
    - **Visual Sync**: Built the dropdown to perfectly match the provided design screenshots, featuring a floating absolute-positioned panel, rounded-xl styling, and custom scrollbars.
    - **Active State Highlights**: Used dynamic primary global colors (`bg-primary-300`, `text-primary-300`) for the currently active session. Replaced the generic shield with a `ShieldCheck` icon, and replaced the trailing checkmark with a solid primary-colored circle containing a bold white `Check` to exactly match the reference designs. Added a clear "ACTIVE SESSION" badge.
    - **Hover UI Refinements**: Refined the hover states for inactive partners to match specific visual aesthetics: The outer row turns light gray (`hover:bg-neutral-50`), the text becomes primary-colored (`group-hover:text-primary-300`), and the inner icon box transitions to a clean white background with a soft drop shadow (`group-hover:bg-surface`, `group-hover:shadow-sm`).
    - **Functionality**: Re-wired the `handleSwitchPartner` logic to call the `/api/session/active-partner` POST endpoint. Upon a successful response, the local session context is updated, and `router.push(pathname)` clears URL parameters to refresh the active Partner tree accurately. Added `useRef` to handle closing the dropdown when clicking outside.
- **NavSidebar Active State Fix**:
    - **Primary Icon/Text Color**: Replaced Tailwind `text-primary-300` classes in the main `NavSidebar` component with dynamic inline styles (`style={{ color: 'var(--brand-primary)' }}`) for the active tab icon, text, and active indicator bar, specifically linked to the `themeMode`. This ensures that in light mode, the selected menu item (e.g., "Users & Permissions") correctly inherits the dynamically configured global primary color, rather than falling back to white or defaulting incorrectly due to OS-level `prefers-color-scheme: dark` media queries intercepting the icon's SVG stroke. Preserved `text-white` behavior for dark mode.
    - **Favicon Size Adjustment**: Increased the size of the collapsed state logo (favicon) from 32x32px (`h-8 w-8`) to 40x40px (`size-[40px]`) for better visibility and proportional alignment within the sidebar.
- **Standalone Project Breadcrumb Fix**: 
    - Resolved a state hydration bug where standalone projects (projects without an organization) incorrectly displayed the name of a previously viewed organization in the breadcrumb header.
    - Updated `project-overview.tsx` to explicitly verify `project.orgId === org.orgId` before rendering the organization segment. If the project lacks an `orgId`, it properly falls back to displaying "No Organization" and routes the back button to the Partner Overview.
- **Organization Table Dates Fix**:
    - Identified a data mapping gap where the backend database provided `createdAt` and `updatedAt` for organizations, but the frontend was only looking for a legacy `createdDate` field.
    - Updated the `Organization` type definition in `lib/types/partner.ts` to strictly support both `createdAt` and `updatedAt`.
    - Modified `partner-overview.tsx` to properly format and display these dates in the Partner Overview table, replacing the empty "—" placeholders.
- **Sidebar Alignment and Visual Enhancements**:
    - **Primary Icon Hover Color**: Added dynamic primary color transitions (`group-hover:text-primary-300`) to the icons (Organization building, Project dot, Partner folder) and text elements in the Access Tree sidebar. This ensures the icons transition to the primary brand color on hover, rather than defaulting to generic or invisible colors in light mode.
    - **Standalone Project Alignment**: Adjusted the indentation of standalone projects from `pl-[22px]` to `pl-[2px]` in the Access Tree sidebar. This perfectly aligns the center of the project's green dot with the vertical axis of the organization expansion arrows, creating a cleaner and more structured hierarchy.

## Previous Update: May 20, 2026

### Work Completed
- **Refined Breadcrumb Header Layout & Spacing**:
    - **Single-line Layout**: Moved organization statistical badges (Member count, Project count) into the same horizontal line as the breadcrumb navigation.
    - **ID Placement**: Added a `breadcrumbAddon` slot to render the ID tag immediately adjacent to the rightmost breadcrumb segment, decoupling it from the right-aligned stats.
    - **Right Alignment**: Implemented a `justify-between` flex layout to push contextual tags and badges to the far right of the header, keeping the breadcrumb navigation cleanly on the left.
    - **Back Button Spacing**: Shortened the gap between the back button and the breadcrumb navigation path from 16px to 8px.
    - **Visual Sync**: Updated the active breadcrumb segment color to sync with the primary brand color (`text-primary-300`).
    - **Flat Design Compliance**: Removed the border, shadow, and outline from the back button, as well as the shadow from the organizations table, to maintain consistency with the application's flat design system.
- **Branding Settings Cleanup**: 
    - Removed a redundant "Access Scope" toggle element (Partner View / Project View) that was inadvertently placed inside the "Brand Colors" configuration panel.
- **Redesigned Breadcrumb Header UI**: Refined the navigation header to match the latest typography and color specifications.
    - **Typography Scale**: Updated breadcrumb text size to **Montserrat 24px font-bold** (H4 scaled) with a **36px line-height**.
    - **Color Logic**:
        - **Non-active Segments**: Set to `text-neutral-600` (#8E8E8E). If clickable, they transition to `text-primary-300` on hover.
        - **Active Segment**: Set to `text-secondary-400` (#21214C) to clearly indicate the current view.
        - **Separator**: Standardized the literal "/" separator to `text-neutral-600`.
    - **Unified Single-Line Layout**: Integrated navigation segments and contextual badges (ID, Status) into a single horizontal flow. Used `flex-wrap` and `items-center` to ensure badges stay perfectly aligned with the text baseline.
- **Implemented Unified Breadcrumb Header**: Added a standardized navigation header across all overview states to provide clear hierarchical context and intuitive navigation.
    - Features a **Back Button**: Allows users to quickly return to the previous logical level (e.g., from Project to Organization, or Organization to Partner Overview).
    - Dynamic Breadcrumb Paths:
        - **Organization**: `Partner Name / Organization Name`
        - **Project (with Org)**: `Partner Name / Organization Name / Project Name`
        - **Standalone Project**: `Partner Name / No Organization / Project Name`
    - **Interactive Segments**: Made breadcrumb segments clickable, enabling direct navigation to the Partner Overview or Organization Overview tables.
    - Integrated this header into `OrganizationOverview` and `ProjectOverview` components.
- **Implemented Partner Overview Table**: Added a new platform-level view that displays a summary of all organizations when the "Partner Root" is clicked in the sidebar.
    - Features a comprehensive data table with columns: **Organization Name**, **Organization ID**, **Projects** (count), **Members** (count), **Created Date**, and **Updated Date**.
    - Enabled row-level navigation to the specific Organization Overview from the table.
    - Implemented real-time search filtering by organization name or ID.
- **Enhanced Sidebar Interactivity**: 
    - Made the **Partner Root** ("Partner: ROGO") in the Access Tree sidebar clickable.
    - Wired navigation to update the URL with `view=partner` while clearing existing organization and project filters.
    - Added hover states and consistent cursor styling to the Partner Root to indicate interactivity.
- **Refined Access Tree Typography & Alignment**:
    - Updated the **Partner Root** display to explicitly show "Partner: [NAME]" (e.g., "Partner: ROGO"). "Partner:" uses `text-neutral-500 font-normal` while the name uses `font-bold text-foreground` for clear visual hierarchy.
    - Corrected **Standalone Project Alignment**: Re-aligned standalone projects (not in an organization) to `pl-[34px]`. This ensures their green dot icons align perfectly with the building icons of organizations above them.
    - Standardized **Sub-Project Indentation**: Adjusted the indentation of projects within organizations to `pl-[50px]`, maintaining a clean 16px hierarchical offset from their parent organization.
- **Unified Topbar UI**: Standardized the Topbar by removing the vertical separator line between the theme/notification icons and the user profile, creating a cleaner, more unified header as requested.
- **Aligned Access Tree Sidebar UI**: Standardized the padding and alignment of the Access Tree sidebar to match the Partner switcher and global design specifications.
    - Adjusted the horizontal padding of the "Access Tree" header, search bar, and access scope toggle from **24px (px-6)** to **16px (px-4)** to align with the left edge of the Partner dropdown box.
    - Standardized the tree item padding by changing **px-2** to **px-0** and **pl-2** to **pl-0**, ensuring the folder and organization icons start exactly at the 16px alignment line.
    - Refined the indentation of project items within the tree by adjusting **pl-[42px]** to **pl-[34px]**, maintaining a consistent 8px hierarchical indentation relative to the parent organizations.
- **Restored "Brand Color Configuration" Picker**: Re-implemented the interactive color picker (SV-area and Hue-slider) into the dialog, providing users with full creative control while retaining the new logo-driven features.
- **Synchronized Dynamic Color Recommendations**: 
    - Moved color extraction and conversion logic to a shared utility (`lib/utils/colors.ts`).
    - Updated the main **Branding Tab** to display dynamic color recommendations from the logo, matching the dialog's behavior.
    - Implemented a consistent layout for recommended colors: `40x40px` circles with hex codes displayed directly below.
- **Flat UI Design**: Removed drop shadows from all buttons and color selection elements across the application to align with the new flat design system.
- **Logo Preview Enhancement**: Refined the logo and favicon preview cards by removing shadows and ensuring consistent border styling across the Branding settings.
- **Addressed Runtime and Build Integrity**:
    - Fixed a naming collision where the Next.js `Image` component shadowed the native browser `Image` constructor, resolving a runtime `TypeError`.
    - Resolved several TypeScript and linting warnings, specifically focusing on `prefer-const` and cascading render issues in `useEffect`.
- **Implemented Partner Selection Dropdown**:
    - Added a functional partner switcher to the `AccessTreeSidebar`, allowing users with multiple partner associations to switch between them easily.
    - Created a new API route `/api/session/active-partner` to securely update the `activePartnerId` in the server-side session cookie.
    - Enhanced the UI with an interactive dropdown menu, including visual feedback for the currently active partner and a click-outside-to-close handler.
    - Integrated the switcher with the existing `PartnerContext`, ensuring the organization and project tree automatically reloads upon switching.
    - Implemented automatic query parameter clearing (e.g., `orgId`, `projectId`) when a new partner is selected to maintain data integrity across different contexts.

## Previous Update: May 19, 2026

### Work Completed
- **Refined "Welcome to Rogo" View**: Standardized the initial dashboard greeting to comply with global design specifications and interactivity requirements.
    - Updated typography to use the global heading standard: **Montserrat 28px (font-heading)** for "Welcome to Rogo".
    - Standardized description text to **15px font-medium** with `neutral-500` color.
    - Updated the "Select an entity" badge to use **rounded-full** and **Montserrat 14px font-semibold**, aligning it with the platform's button design.
    - Implemented a "Play Once" animation policy: Added `animate-bounce-once` and `animate-pulse-once` to `globals.css` (tuned to a **3-second total duration** before stopping) and applied them to all animated elements in the Welcome view (Rocket icon, Sparkles, background glows, and loading dots). This ensures animations provide a lively entrance for a specific duration upon appearance rather than looping infinitely.
- **Hardened Auth Screen Dynamic Colors**: Replaced Tailwind classes (`text-primary-300`) with inline CSS variables (`style={{ color: 'var(--brand-primary)' }}`) for the "Forgot password?", "Register", and "Login" text links in the Auth forms. This ensures the text color synchronously and reliably updates when the user changes the global brand primary color without relying on Tailwind JIT compilation caching.
- **Synced Primary Color to Remaining UI Elements**: Fixed several hardcoded legacy brand colors (`#fd3566`, `#FF356A`) across the application to properly sync with the global dynamic primary color feature.
    - Updated "Forgot password?" link in `LoginForm`.
    - Updated "Create New Organization" buttons in `AccessTreeSidebar`.
    - Updated the notification bell dot in `Topbar`.
    - Updated the "Logout" button in `NavSidebar` to use `text-primary-300` and `hover:bg-primary-300/10`, removing the hardcoded red color and ensuring it syncs with the dynamic brand color.
    - Updated the typography and color of the "Back to Login" links in `ForgotPasswordForm` to match global primary variables and Montserrat 14px font-semibold.
- **Refined Sidebar Navigation UI**: Updated the `NavSidebar` and `AccessTreeSidebar` active states based on design specifications.
    - Updated `NavSidebar` active link background to `bg-primary-300/10` and text to `text-primary-300`.
    - Redesigned `AccessTreeSidebar` Access Scope switch to perfectly match Figma specs: `flex-direction: column; justify-content: center`, white rounded-full pill background with soft shadow (`0 1px 2px 0 rgba(0,0,0,0.05)`), dynamic primary color text, and `SF Pro 12px font-weight 700` typography.
    - Added custom active state styling for organizations and projects in the tree: a neutral-200 background with a right-aligned 4px solid neutral-800 border.
- **Enhanced Sidebar Interactivity**: Updated the `NavSidebar` to be collapsed by default (`80px`) and expand on hover (`260px`).
    - Implemented "Smart Animation" feel using CSS transitions with `cubic-bezier(0.4, 0, 0.2, 1)` and 500ms duration.
    - Added fade-in and slide animations for navigation labels, the "Partner Admin" tag, and the logout text.
    - Removed the manual toggle button for a cleaner, hover-driven experience.
- **Standardized Auth Headings**: Updated the headings across the Login, Register, and Forgot Password screens to identically use `28px` (H4) font size and the `Montserrat` font family (`font-heading`), ensuring consistency with the platform typography scale.

## Previous Update: May 18, 2026

### Work Completed
- **Fixed Auth Screens Styling**: Removed hardcoded colors (e.g., `#fd3566`) from the "Forgot password?", "Register", and "Login" links, linking them instead to the global primary color theme variable. Also updated the "Login" and "Create Account" headings to match the global H4 typography size (Montserrat 28px).
- **Enhanced Project Table UX**: Made rows in the "Projects in Organization" table clickable, allowing users to navigate directly to the project view by clicking anywhere on the row. Added `stopPropagation` to inline action buttons (Info, Copy, Action Menu) to prevent overlapping click events.
- **Fixed Row Navigation Bug**: Replaced the `<Link>` component inside the "Name" column with a styled `<span>` to prevent event bubbling conflicts in Next.js App Router where clicking the link caused two simultaneous `router.push` events (one from `<Link>`, one from the `<tr>`), resulting in an aborted navigation.
- **Resolved "Malformed resource string" API Error in Grant Access**: 
    - Investigated the error `Malformed resource string` using a MongoDB database sample and user feedback.
    - Corrected the project resource separator from a colon (`:`) to a forward slash (`/`) for specific projects (e.g., `partner:ROGO:project/6a03...`).
    - Implemented wildcard support (`partner:ROGO:project/*`) when the "Apply to all projects" checkbox is selected in the UI.
    - Updated actions to use the correct `projectReport` prefix for project-scoped resources.
    - This fully aligns the frontend payload with the strict Rogo ABAC v2 backend validation rules.
- **Wired ABAC Checkboxes in Grant Access Dialog**: 
    - Found that the "Grant Access" UI was previously using hardcoded stub permissions (`["projectDev:edit", "projectDev:view", etc.]`) and ignoring the actual checkboxes.
    - Implemented State bindings for the permission checkboxes in `GrantAccessDialog.tsx` (e.g., `permDevEdit`, `permAuthView`).
    - Updated the `handleSubmit` payload to collect the actual user selections and updated `handleGrantAccess` in `users-page.tsx` to dynamically pass these selections into the API's `actions` array.
- **Implemented Dynamic Project Permissions Display**:
    - Replaced mocked demo data in the "Users" table with real project assignments parsed from the ABAC permission records.
    - Added a helper function `getUserProjectData` to derive a user's accessible projects and their specific actions (Edit/View) from fully qualified resource strings.
    - Enhanced the "Projects for [User]" modal to display actual project details on the left and the user's specific permissions (as badges) on the right, replacing the generic "ACTIVE" status.
    - Integrated wildcard support for `project/*` resources, ensuring all projects are displayed if the user has partner-wide project access.

## Previous Update: May 14, 2026

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
- **UI/UX Improvements**:
    - Implemented a Dark/Light mode toggle in the `Topbar`, positioned to the left of the notification button.
    - Refined the dark mode color palette in `globals.css` to match the "Rogo Solution Web Dashboard" demo model.
    - Fixed hardcoded background and text colors in `app/layout.tsx` to ensure seamless theme transitions.
    - Standardized the neutral color scale for dark mode to improve readability and contrast.
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
