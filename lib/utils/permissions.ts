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

  // Check partner-level resources (admin)
  const hasPartnerLevelPermission = session.projectResources.some((entry) => {
    const hasMatchingResource = entry.resources.some((resource) =>
      resource.startsWith(`partner:${session.activePartnerId}`),
    );
    if (!hasMatchingResource) return false;
    return entry.actions.some((availableAction) => matchesAction(availableAction, action));
  });

  if (hasPartnerLevelPermission) return true;

  // Non-admin: nếu action là projectMgmt:view (dùng cho Overview & My Permissions),
  // cho phép nếu user có bất kỳ org/project resource nào
  if (action === "projectMgmt:view") {
    return session.projectResources.some((entry) =>
      entry.resources.some(
        (r) =>
          r.includes("organization:") ||
          r.includes("project:") ||
          r.startsWith(`partner:${session.activePartnerId}`),
      ),
    );
  }

  return false;
}

/**
 * Kiểm tra user có phải partner admin không.
 * Admin = có entry trong projectResources với resource partner:ID và action là * hoặc projectMgmt:* hoặc authorization:*
 */
export function isPartnerAdmin(session: PartnerSession): boolean {
  if (!session.activePartnerId) return false;

  return session.projectResources.some((entry) => {
    const hasPartnerResource = entry.resources.some(
      (resource) =>
        resource === `partner:${session.activePartnerId}` ||
        resource.startsWith(`partner:${session.activePartnerId}:`),
    );
    if (!hasPartnerResource) return false;

    return entry.actions.some(
      (action) => action === "*" || action === "projectMgmt:*" || action === "authorization:*",
    );
  });
}

export function getAccessibleNavItems(session: PartnerSession) {
  const admin = isPartnerAdmin(session);

  return NAV_ITEMS.filter((item) => {
    // adminOnly items: chỉ admin mới truy cập
    if (item.adminOnly && !admin) return false;
    // userOnly items: chỉ non-admin mới thấy
    if ("userOnly" in item && item.userOnly && admin) return false;
    // Kiểm tra permission
    return hasPermission(session, item.permission);
  });
}

export function getFirstAccessibleHref(session: PartnerSession) {
  return getAccessibleNavItems(session)[0]?.href ?? null;
}



/**
 * Lấy danh sách orgId mà user có quyền xem (từ resource "organization:ORG_ID")
 * Dùng cho non-admin user để lọc Access Tree và Overview.
 */
export function getUserAccessibleOrgIds(session: PartnerSession): string[] {
  const orgIds = new Set<string>();

  for (const entry of session.projectResources) {
    const canView = entry.actions.some((a) => matchesAction(a, "organization:view"));
    if (!canView) continue;

    for (const resource of entry.resources) {
      // Format: organization:ORG_ID hoặc partner:ID:organization:ORG_ID
      const directMatch = resource.match(/^organization:(.+)$/);
      if (directMatch?.[1]) {
        orgIds.add(directMatch[1]);
        continue;
      }
      const nestedMatch = resource.match(/organization:([^:]+)/);
      if (nestedMatch?.[1]) {
        orgIds.add(nestedMatch[1]);
      }
    }
  }

  return Array.from(orgIds);
}

/**
 * Lấy danh sách projectId mà user có quyền xem.
 * Format resource: project:PROJECT_ID hoặc partner:ID:project:PROJECT_ID
 */
export function getUserAccessibleProjectIds(session: PartnerSession): string[] {
  const projectIds = new Set<string>();

  for (const entry of session.projectResources) {
    const canView = entry.actions.some((a) => matchesAction(a, "project:view"));
    if (!canView) continue;

    for (const resource of entry.resources) {
      const directMatch = resource.match(/^project:(.+)$/);
      if (directMatch?.[1]) {
        projectIds.add(directMatch[1]);
        continue;
      }
      const nestedMatch = resource.match(/project:([^:]+)/);
      if (nestedMatch?.[1]) {
        projectIds.add(nestedMatch[1]);
      }
    }
  }

  return Array.from(projectIds);
}

/**
 * Kiểm tra user có quyền với action nhất định trên một org cụ thể.
 */
export function hasOrgPermission(session: PartnerSession, orgId: string, action: string): boolean {
  // Admin có full quyền
  if (isPartnerAdmin(session)) return true;

  return session.projectResources.some((entry) => {
    const hasOrgResource = entry.resources.some(
      (r) => r === `organization:${orgId}` || r.includes(`organization:${orgId}`),
    );
    if (!hasOrgResource) return false;
    return entry.actions.some((a) => matchesAction(a, action));
  });
}

/**
 * Kiểm tra user có quyền với action nhất định trên một project cụ thể.
 */
export function hasProjectPermission(
  session: PartnerSession,
  projectId: string,
  action: string,
): boolean {
  // Admin có full quyền
  if (isPartnerAdmin(session)) return true;

  return session.projectResources.some((entry) => {
    const hasProjectResource = entry.resources.some(
      (r) => r === `project:${projectId}` || r.includes(`project:${projectId}`),
    );
    if (!hasProjectResource) return false;
    return entry.actions.some((a) => matchesAction(a, action));
  });
}

/**
 * Lấy danh sách actions mà user có trên một resource cụ thể.
 * Dùng để hiển thị badges trong "My Permissions" page.
 */
export function getActionsForResource(session: PartnerSession, resourceId: string): string[] {
  const actions = new Set<string>();

  for (const entry of session.projectResources) {
    const hasResource = entry.resources.some(
      (r) => r === resourceId || r.includes(resourceId),
    );
    if (!hasResource) continue;
    entry.actions.forEach((a) => actions.add(a));
  }

  return Array.from(actions);
}

