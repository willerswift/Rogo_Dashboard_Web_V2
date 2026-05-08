import { NAV_ITEMS } from "@/lib/config/navigation";
import type { PartnerSession } from "@/lib/types/partner";

export function matchesAction(available: string, requested: string) {
  if (available === requested || available === "*" || available === `${requested.split(":")[0]}:*`) {
    return true;
  }

  return false;
}

export function hasPermission(session: PartnerSession, action: string) {
  if (!session.activePartnerId) {
    return false;
  }

  return session.projectResources.some((entry) => {
    const hasMatchingResource = entry.resources.some((resource) =>
      resource.startsWith(`partner:${session.activePartnerId}`),
    );

    if (!hasMatchingResource) {
      return false;
    }

    return entry.actions.some((availableAction) => matchesAction(availableAction, action));
  });
}

export function getAccessibleNavItems(session: PartnerSession) {
  return NAV_ITEMS.filter((item) => hasPermission(session, item.permission));
}

export function getFirstAccessibleHref(session: PartnerSession) {
  return getAccessibleNavItems(session)[0]?.href ?? null;
}
