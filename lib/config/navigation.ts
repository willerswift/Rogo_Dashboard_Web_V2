export const NAV_ITEMS = [
  {
    title: "Overview",
    href: "/overview",
    permission: "projectMgmt:view",
    icon: "Overview",
    adminOnly: false,
  },
  {
    title: "Users & Permissions",
    href: "/users",
    permission: "authorization:view",
    icon: "Users",
    adminOnly: true,
  },
  {
    title: "My Permissions",
    href: "/my-permissions",
    permission: "projectMgmt:view",
    icon: "MyPermissions",
    adminOnly: false,
    userOnly: true,
  },
  {
    title: "Account",
    href: "/account",
    permission: "projectMgmt:view",
    icon: "Account",
    adminOnly: false,
  },

  {
    title: "Settings",
    href: "/settings",
    permission: "projectMgmt:*",
    icon: "Settings",
    adminOnly: true,
  },
] as const;

