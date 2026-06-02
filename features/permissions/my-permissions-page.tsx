"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Building2, FolderKanban, Info, Mail } from "lucide-react";

import { usePartnerContext } from "@/lib/hooks/usePartnerContext";
import { getUserAccessibleOrgIds, getUserAccessibleProjectIds, getActionsForResource } from "@/lib/utils/permissions";
import type { AbacV2Entry } from "@/lib/types/partner";

// Map action strings sang badge labels thân thiện
function getActionBadges(actions: string[]): { label: string; color: string }[] {
  const badges: { label: string; color: string }[] = [];

  const actionMap: Record<string, { label: string; color: string }> = {
    "*": { label: "FULL ACCESS", color: "bg-primary-300/10 text-primary-300 border-primary-300/30" },
    "organization:view": { label: "ORG VIEW", color: "bg-blue-50 text-blue-600 border-blue-200" },
    "organization:edit": { label: "ORG EDIT", color: "bg-blue-100 text-blue-700 border-blue-300" },
    "project:view": { label: "PRJ VIEW", color: "bg-green-50 text-green-600 border-green-200" },
    "project:edit": { label: "PRJ EDIT", color: "bg-green-100 text-green-700 border-green-300" },
    "authorization:view": { label: "AUTH VIEW", color: "bg-purple-50 text-purple-600 border-purple-200" },
    "authorization:edit": { label: "AUTH EDIT", color: "bg-purple-100 text-purple-700 border-purple-300" },
    "projectMgmt:view": { label: "MGMT VIEW", color: "bg-orange-50 text-orange-600 border-orange-200" },
    "projectMgmt:edit": { label: "MGMT EDIT", color: "bg-orange-100 text-orange-700 border-orange-300" },
    "projectMgmt:*": { label: "MGMT FULL", color: "bg-orange-100 text-orange-700 border-orange-300" },
    "authorization:*": { label: "AUTH FULL", color: "bg-purple-100 text-purple-700 border-purple-300" },
  };

  for (const action of actions) {
    const mapped = actionMap[action];
    if (mapped) {
      badges.push(mapped);
    } else {
      // Fallback cho action không có trong map
      badges.push({
        label: action.toUpperCase().replace(":", " "),
        color: "bg-neutral-100 text-neutral-600 border-neutral-200",
      });
    }
  }

  return badges;
}

type OrgAccess = {
  orgId: string;
  actions: string[];
};

type ProjectAccess = {
  projectId: string;
  orgId?: string;
  actions: string[];
};

export function MyPermissionsPage() {
  const { session } = usePartnerContext();
  const router = useRouter();

  const partnerId = session.activePartnerId;

  // Parse org accesses từ projectResources
  const orgAccesses = useMemo<OrgAccess[]>(() => {
    const map = new Map<string, Set<string>>();

    for (const entry of session.projectResources) {
      for (const resource of entry.resources) {
        const match = resource.match(/(?:^|:)organization:([^:]+)/);
        if (match?.[1]) {
          const orgId = match[1];
          if (!map.has(orgId)) map.set(orgId, new Set());
          entry.actions.forEach((a) => map.get(orgId)!.add(a));
        }
      }
    }

    return Array.from(map.entries()).map(([orgId, actions]) => ({
      orgId,
      actions: Array.from(actions),
    }));
  }, [session.projectResources]);

  // Parse project accesses từ projectResources
  const projectAccesses = useMemo<ProjectAccess[]>(() => {
    const map = new Map<string, { orgId?: string; actions: Set<string> }>();

    for (const entry of session.projectResources) {
      let projectId: string | null = null;
      let orgId: string | undefined;

      for (const resource of entry.resources) {
        const pMatch = resource.match(/(?:^|:)project:([^:]+)/);
        const oMatch = resource.match(/(?:^|:)organization:([^:]+)/);
        if (pMatch?.[1]) projectId = pMatch[1];
        if (oMatch?.[1]) orgId = oMatch[1];
      }

      if (projectId) {
        if (!map.has(projectId)) map.set(projectId, { orgId, actions: new Set() });
        entry.actions.forEach((a) => map.get(projectId!)!.actions.add(a));
      }
    }

    return Array.from(map.entries()).map(([projectId, data]) => ({
      projectId,
      orgId: data.orgId,
      actions: Array.from(data.actions),
    }));
  }, [session.projectResources]);

  // Lấy user initials từ email
  const initials = session.email
    ? session.email.slice(0, 2).toUpperCase()
    : "U";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700 max-w-4xl">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-[28px] font-bold font-heading text-foreground tracking-tight">My Permissions</h1>
        <p className="text-[14px] text-neutral-500">
          Review your current access levels and roles across organizations and projects.
        </p>
      </div>

      {/* User info card */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between rounded-2xl border border-border bg-surface px-6 py-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-primary-200 to-secondary-300 text-white font-bold text-[15px] shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-foreground text-[15px] truncate">
              {session.email?.split("@")[0] ?? "User"}
            </p>
            <p className="text-[13px] text-neutral-500 truncate break-all">{session.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border bg-surface-muted px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-500 shrink-0">
          <ShieldCheck className="size-3.5" />
          Partner User
        </div>
      </div>

      {/* Organization Access */}
      {orgAccesses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary-300" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">
              Organization Access
            </p>
          </div>

          <div className="space-y-3">
            {orgAccesses.map((orgAccess) => {
              const badges = getActionBadges(orgAccess.actions);
              return (
                <div
                  key={orgAccess.orgId}
                  className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between rounded-2xl border border-border bg-surface px-6 py-4 transition-colors hover:border-primary-300/30 hover:bg-primary-300/5"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-primary-100/20 text-primary-300 shrink-0">
                      <Building2 className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-foreground text-[14px] break-all">{orgAccess.orgId}</p>
                      <div className="mt-1 flex gap-1.5 flex-wrap">
                        {badges.map((badge, i) => (
                          <span
                            key={i}
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider ${badge.color}`}
                          >
                            {badge.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/overview?orgId=${orgAccess.orgId}`)}
                    className="h-8 rounded-full border border-border bg-surface px-4 text-[12px] font-semibold text-foreground hover:border-primary-300 hover:text-primary-300 transition-all whitespace-nowrap w-full sm:w-auto"
                  >
                    View Org
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Project Access */}
      {projectAccesses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">
              Project Access
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {projectAccesses.map((projectAccess) => {
              const badges = getActionBadges(projectAccess.actions);
              return (
                <div
                  key={projectAccess.projectId}
                  className="flex flex-col gap-3 rounded-2xl border border-border bg-surface px-5 py-4 transition-colors hover:border-primary-300/30 hover:bg-primary-300/5"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                      <FolderKanban className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-foreground text-[14px] break-all">
                        {projectAccess.projectId}
                      </p>
                      {projectAccess.orgId && (
                        <p className="text-[12px] text-neutral-400 mt-0.5 break-all">
                          Organization: {projectAccess.orgId}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {badges.map((badge, i) => (
                      <span
                        key={i}
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() =>
                      router.push(
                        projectAccess.orgId
                          ? `/overview?orgId=${projectAccess.orgId}&projectId=${projectAccess.projectId}`
                          : `/overview?projectId=${projectAccess.projectId}`,
                      )
                    }
                    className="w-fit h-8 rounded-full border border-border bg-surface px-4 text-[12px] font-semibold text-foreground hover:border-primary-300 hover:text-primary-300 transition-all"
                  >
                    View Project
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state nếu không có quyền gì */}
      {orgAccesses.length === 0 && projectAccesses.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-surface-muted px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-surface border border-border">
            <ShieldCheck className="size-5 text-neutral-400" />
          </div>
          <h3 className="font-bold text-foreground">No permissions assigned yet</h3>
          <p className="mt-2 text-sm text-neutral-500 max-w-sm mx-auto">
            Your account does not have any specific permissions yet. Contact your Partner Admin to request access.
          </p>
        </div>
      )}

      {/* Info banner */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between rounded-2xl border border-blue-100 bg-blue-50/50 px-5 py-4">
        <div className="flex items-start gap-3">
          <Info className="size-4 text-blue-500 mt-0.5 shrink-0" />
          <p className="text-[13px] text-blue-700">
            Permissions are managed by your Partner Admin. Contact{" "}
            <a
              href={`mailto:${partnerId ? `admin@${partnerId.toLowerCase()}.com` : "admin@rogo.com.vn"}`}
              className="font-semibold underline underline-offset-2 hover:text-blue-900 transition-colors"
            >
              {partnerId ? `admin@${partnerId.toLowerCase()}.com` : "admin@rogo.com.vn"}
            </a>{" "}
            to request changes.
          </p>
        </div>
        <button className="shrink-0 rounded-full border border-blue-200 bg-white px-4 py-2 text-[12px] font-semibold text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all whitespace-nowrap w-full sm:w-auto">
          Request access change
        </button>
      </div>
    </div>
  );
}
