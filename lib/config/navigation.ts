export const NAV_ITEMS = [
  {
    title: "Overview",
    href: "/overview",
    permission: "projectMgmt:view",
    icon: "Overview",
  },
  {
    title: "Users & Permissions",
    href: "/users",
    permission: "authorization:view",
    icon: "Users",
  },
  {
    title: "Account",
    href: "/account",
    permission: "authorization:view",
    icon: "Account",
  },
  {
    title: "Settings",
    href: "/settings",
    permission: "projectMgmt:*",
    icon: "Settings",
  },
] as const;
