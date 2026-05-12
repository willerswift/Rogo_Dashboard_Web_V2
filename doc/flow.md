# Rogo Dashboard V2 - Web Application Flow Documentation

## 1. Overview
Rogo Dashboard V2 is a management interface for Rogo Partner APIs, built using Next.js 16 (App Router), TypeScript, and Tailwind CSS. It allows partners to manage organizations, projects, products, and user permissions through a structured dashboard.

## 2. Authentication & Session Management
- **Entry Point**: Users land on the `/login` page if not authenticated.
- **Login Process**:
    1. User submits credentials via the login form.
    2. The frontend calls `/api/auth/login`.
    3. On success, an `httpOnly` session cookie is set.
- **Session Validation**:
    - The `app/(dashboard)/layout.tsx` checks for the session cookie.
    - If absent, it redirects the user back to `/login`.
- **Session Data**: Basic user info and permissions are bootstrapped via `GET /api/partner/user/resources`.

## 3. Main Interface Structure
The interface is wrapped in a `DashboardShell` which consists of:
- **NavSidebar**: Primary navigation for switching between major modules (Overview, Organizations, Projects, Products, Users, etc.).
- **AccessTreeSidebar**: A conditional sidebar shown only on `/overview` and `/users` routes to filter data by organization/project hierarchy.
- **Topbar**: Displays the current context, search, and user account menu.
- **Main Content**: The central area where feature-specific forms and tables are rendered.

## 4. Application Navigation Flow
1. **Initial Load**: After login, users are typically redirected to `/overview`.
2. **Module Switching**:
    - **Organizations**: View and manage partner organizations (`/organizations`).
    - **Projects**: Manage projects within selected organizations (`/projects`).
    - **Products**: Manage Rogo products and releases (`/products`).
    - **Users & Permissions**: Manage partner users and their ABAC (Attribute-Based Access Control) permissions (`/users`).
3. **Filtering**: Users use the `AccessTreeSidebar` to narrow down the scope of data they are viewing (e.g., selecting a specific Project to see its users).

## 5. Data Flow (Client-Server Communication)
- **Frontend**: Uses React Server Components (RSC) for initial data fetching where possible, and client-side hooks for interactive parts.
- **API Proxy**: Next.js Route Handlers in `app/api/*` act as a proxy to the actual Rogo Partner Backend. This keeps API keys and logic secure on the server side.
- **Permissions**: Components use `usePermission(action)` or `PermissionGate` to conditionally render UI elements based on the user's assigned roles and attributes.

## 6. Error Handling & Feedback
- **Toasts**: `sonner` is used for global notifications (success/error messages).
- **Validation**: `react-hook-form` combined with `zod` ensures data integrity before submission.
