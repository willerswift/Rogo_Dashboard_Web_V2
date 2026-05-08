import "server-only";

import { redirect } from "next/navigation";

import { NAV_ITEMS } from "@/lib/config/navigation";
import type { PartnerSession } from "@/lib/types/partner";
import { getSessionCookie } from "@/lib/server/session";
import { hasPermission } from "@/lib/utils/permissions";

export const sessionHasPermission = hasPermission;

export function getAllowedNavigation(session: PartnerSession) {
  return NAV_ITEMS.filter((item) => sessionHasPermission(session, item.permission));
}

export function getFirstAccessiblePath(session: PartnerSession) {
  return getAllowedNavigation(session)[0]?.href ?? "/login";
}

export async function requireSession() {
  const session = await getSessionCookie();

  if (!session) {
    redirect("/login");
  }

  return session;
}
