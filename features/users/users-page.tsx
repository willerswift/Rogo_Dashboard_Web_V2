"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { UserPlus, Trash2, Pencil, UserMinus, Users, LayoutGrid } from "lucide-react";

import { listProjects, listProjectUsers } from "@/lib/api/project";
import { listOrganizations, listOrganizationUsers } from "@/lib/api/organization";
import { deletePartnerUser, listPartnerUsers } from "@/lib/api/user";
import { listPermissionRecords } from "@/lib/api/permission";
import { usePartnerContext } from "@/lib/hooks/usePartnerContext";
import { usePermission } from "@/lib/hooks/usePermission";
import type { PermissionRecord, Project, UserWithNumProject, OrgWithOwner } from "@/lib/types/partner";
import {
  LoadingBlock,
  PrimaryButton,
} from "@/features/shared/ui";
import { DataTable, type DataTableColumn } from "@/lib/components/DataTable";
import { Avatar } from "@/lib/components/ui/avatar";
import { cn } from "@/lib/utils/cn";
import { GrantAccessDialog } from "./GrantAccessDialog";

export function UsersPage() {
  const { session, accessScope, setAccessScope } = usePartnerContext();
  const searchParams = useSearchParams();
  const orgId = searchParams.get("orgId");
  const projectId = searchParams.get("projectId");

  const canAddUser = usePermission("projectAuth:edit");
  const canDelete = usePermission("authorization:edit");
  const partnerId = session.activePartnerId;

  const [users, setUsers] = useState<UserWithNumProject[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [orgs, setOrgs] = useState<OrgWithOwner[]>([]);
  const [permissionRecords, setPermissionRecords] = useState<PermissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGrantAccess, setShowGrantAccess] = useState(false);

  const activeProject = useMemo(() => projects.find(p => p.uuid === projectId), [projects, projectId]);
  const activeOrg = useMemo(() => {
    if (activeProject?.orgId) {
      return orgs.find(o => o.orgId === activeProject.orgId);
    }
    return orgs.find(o => o.orgId === orgId);
  }, [orgs, orgId, activeProject]);

  const loadData = useCallback(async () => {
    if (!partnerId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [nextProjects, nextOrgs, nextPermissions] = await Promise.all([
        listProjects(partnerId),
        listOrganizations(partnerId),
        listPermissionRecords(partnerId),
      ]);

      setProjects(nextProjects);
      setOrgs(nextOrgs);
      setPermissionRecords(nextPermissions);

      // Fetch filtered users based on context
      let nextUsers: UserWithNumProject[] = [];
      if (projectId) {
        const prjUsers = await listProjectUsers(partnerId, projectId);
        nextUsers = prjUsers.map(u => ({ user: u, numOfProject: 0 }));
      } else if (orgId) {
        const orgMembers = await listOrganizationUsers(partnerId, orgId);
        nextUsers = orgMembers.map(m => ({ user: m.user!, numOfProject: 0 }));
      } else {
        nextUsers = await listPartnerUsers(partnerId);
      }
      setUsers(nextUsers);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load users data.");
    } finally {
      setLoading(false);
    }
  }, [partnerId, orgId, projectId]);

  useEffect(() => {
    const run = async () => {
      await Promise.resolve();
      void loadData();
    };
    void run();
  }, [loadData]);

  const handleDeleteUser = useCallback(async (uuid: string) => {
    if (!partnerId || !window.confirm(`Delete partner user?`)) {
      return;
    }

    try {
      await deletePartnerUser({ partnerId, uuid });
      toast.success("User deleted.");
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete user.");
    }
  }, [partnerId, loadData]);

  const handleGrantAccess = async (userId: string, permissions: string[]) => {
    console.log("Granting access for", userId, permissions);
    toast.success("Access granted (stub).");
    await loadData();
  };

  const columns = useMemo<DataTableColumn<UserWithNumProject>[]>(() => {
    if (accessScope === "project") {
      return [
        {
          id: "user",
          header: "USER",
          headerClassName: "text-[11px] font-bold text-neutral-800 uppercase tracking-wider",
          cell: ({ user }) => (
            <div className="flex items-center gap-3">
              <Avatar name={user.name} email={user.email} />
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-neutral-900 leading-tight">{user.name}</span>
                <span className="text-[12px] text-neutral-500 leading-tight mt-0.5">{user.email}</span>
              </div>
            </div>
          ),
        },
        {
          id: "projects",
          header: "PROJECTS",
          headerClassName: "text-[11px] font-bold text-neutral-800 uppercase tracking-wider",
          cell: () => {
            // Stub data for UI verification
            const userProjects = [
              { name: "Sensor Integration", id: "PRJ-001" },
              { name: "Alpha Project", id: "PRJ-002" },
              { name: "Sample Project", id: "PRJ-003" },
            ];
            
            return (
              <div className="flex flex-col gap-2 py-1">
                <div className="flex flex-wrap gap-2">
                  {userProjects.map((p) => (
                    <div key={p.id} className="flex h-[28px] items-center justify-center gap-2 rounded-full bg-[#1FC16B]/10 px-2 py-0.5">
                      <span className="text-[12px] font-bold text-[#1F244A] tracking-tight">{p.name}</span>
                      <span className="text-[11px] font-bold text-[#3B4AD0]">{p.id}</span>
                    </div>
                  ))}
                </div>
                <button className="text-[13px] font-bold text-[#FD3566] text-left hover:underline flex items-center gap-1 w-fit">
                  View 2 more Projects
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            );
          },
        },
        {
          id: "joined",
          header: "JOINED",
          headerClassName: "text-[11px] font-bold text-neutral-800 uppercase tracking-wider",
          cell: () => <span className="text-[13px] text-neutral-500">Oct 12, 2023</span>,
        },
        {
          id: "actions",
          header: "ACTIONS",
          className: "text-right",
          headerClassName: "text-[11px] font-bold text-neutral-800 uppercase tracking-wider text-right",
          cell: () => (
            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="text-neutral-400 hover:text-neutral-900 transition-colors">
                <Pencil className="size-4" />
              </button>
              <button className="text-neutral-400 hover:text-[#FD3566] transition-colors">
                <UserMinus className="size-4" />
              </button>
            </div>
          ),
        },
      ];
    }

    return [
      {
        id: "user",
        header: "USER",
        headerClassName: "text-[11px] font-bold text-neutral-800 uppercase tracking-wider",
        cell: ({ user }) => (
          <div className="flex items-center gap-3">
            <Avatar name={user.name} email={user.email} />
            <div className="flex flex-col">
              <span className="text-[14px] font-bold text-neutral-900 leading-tight">{user.name}</span>
              <span className="text-[12px] text-neutral-500 leading-tight mt-0.5">{user.email}</span>
            </div>
          </div>
        ),
      },
      {
        id: "permissions",
        header: "PERMISSION",
        headerClassName: "text-[11px] font-bold text-neutral-800 uppercase tracking-wider",
        cell: ({ user }) => {
          const record = permissionRecords.find(r => r.ownerId === user.ownerId);
          if (!record || !record.abac || !record.abac.length) return <span className="text-neutral-300 text-[12px] italic">No permissions</span>;
          
          const resMap: Record<string, string> = {
            "organization": "ORG",
            "authorization": "AUTH",
            "projectAuth": "PRJ AUTH",
            "projectMgmt": "PRJ MQTT",
            "productDev": "PROD",
            "projectDev": "PRJ PROD",
            "report": "REPORT",
            "projectReport": "PRJ REPORT",
          };

          const rawActions = record.abac.flatMap(entry => entry.actions);
          const uniqueRawActions = Array.from(new Set(rawActions.map(a => a.trim()))).filter(Boolean);

          if (uniqueRawActions.includes("*")) {
            return <PermissionBadge label="ADMIN" isAdmin />;
          }

          const shortNameGroups: Record<string, Set<string>> = {};
          uniqueRawActions.forEach(action => {
            const [resource, act] = action.split(":");
            const shortName = resMap[resource] || resource.toUpperCase();
            const effectiveAction = act || "*";
            
            if (!shortNameGroups[shortName]) shortNameGroups[shortName] = new Set();
            shortNameGroups[shortName].add(effectiveAction);
          });

          const finalBadges: { label: string; isAdmin: boolean }[] = [];
          Object.entries(shortNameGroups).forEach(([shortName, acts]) => {
            const hasFullAccess = acts.has("*") || acts.has("edit");
            const hasViewAccess = acts.has("view");

            if (hasFullAccess) {
              finalBadges.push({ label: `${shortName} EDIT`, isAdmin: true });
            } else if (hasViewAccess) {
              finalBadges.push({ label: `${shortName} VIEW`, isAdmin: false });
            }
          });
          
          return (
            <div className="flex flex-wrap gap-1.5">
              {finalBadges.sort((a, b) => a.label.localeCompare(b.label)).map(badge => (
                <PermissionBadge key={badge.label} label={badge.label} isAdmin={badge.isAdmin} />
              ))}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "",
        className: "text-right",
        cell: ({ user }) => (
          <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
            {canDelete ? (
              <button
                onClick={() => void handleDeleteUser(user.uuid)}
                className="p-2 text-neutral-400 hover:text-red-500 transition-colors"
                title="Remove user"
              >
                <Trash2 className="size-4" />
              </button>
            ) : null}
          </div>
        ),
      },
    ];
  }, [accessScope, permissionRecords, canDelete, handleDeleteUser]);

  const subTitle = useMemo(() => {
    if (activeProject) return "Users with project access";
    if (activeOrg) return "Users with access to this organization";
    if (accessScope === "project") return "Users with project access";
    return "Partner Users";
  }, [activeOrg, activeProject, accessScope]);

  const rootName = useMemo(() => {
    if (activeOrg) return activeOrg.name;
    return session.activePartnerId || "Partner";
  }, [activeOrg, session.activePartnerId]);

  const displayId = useMemo(() => {
    if (activeProject) return activeProject.uuid.slice(0, 8);
    if (activeOrg) return activeOrg.orgId;
    return session.activePartnerId;
  }, [activeProject, activeOrg, session.activePartnerId]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="space-y-5">
        {/* Top Tier: Root Context Info (Large) */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <h1 className="text-[28px] font-bold text-neutral-900 tracking-tight font-heading">
              {rootName}
            </h1>
            {displayId && (
              <span className="inline-flex items-center rounded-md bg-[#F0F2FF] px-2 py-0.5 text-[10px] font-bold text-[#3B4AD0] uppercase">
                ID: {displayId}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Type Badge */}
            {activeProject ? (
              <span className="inline-flex items-center rounded-md bg-green-100/10 px-2 py-0.5 text-[10px] font-bold text-green-600">
                PRJ
              </span>
            ) : activeOrg ? (
              <span className="inline-flex items-center rounded-md bg-[#FFEBF0] px-2 py-0.5 text-[10px] font-bold text-[#FD3566]">
                ORG
              </span>
            ) : (
              <span className="inline-flex items-center rounded-md bg-primary-100/10 px-2 py-0.5 text-[10px] font-bold text-primary-300">
                PARTNER
              </span>
            )}

            {/* Stat Badges */}
            <div className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] font-bold text-neutral-500 shadow-sm">
              <Users className="size-3.5 text-neutral-400" />
              {users.length} Members
            </div>
            
            {(activeOrg || !projectId) && (
              <div className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] font-bold text-neutral-500 shadow-sm">
                <LayoutGrid className="size-3.5 text-neutral-400" />
                {activeOrg 
                  ? projects.filter(p => p.orgId === activeOrg.orgId).length
                  : projects.length
                } Projects
              </div>
            )}
          </div>
        </div>

        {/* Bottom Tier: Context Title & Action Button */}
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-bold text-neutral-900 tracking-tight font-heading">
            {subTitle}
          </h2>

          {canAddUser && (
            <PrimaryButton
              type="button"
              onClick={() => setShowGrantAccess(true)}
              className="bg-[#FD3566] hover:bg-[#EA023B] shadow-md shadow-[#FD3566]/20 transition-all"
            >
              <UserPlus className="size-4" />
              Grant Access
            </PrimaryButton>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingBlock label="Loading users..." />
      ) : (
        <DataTable
          columns={columns}
          data={users}
          emptyTitle="No users found"
          emptyDescription={projectId ? "This project doesn't have any specific user permissions yet." : "Add or attach a user to grant them access."}
          emptyAction={projectId && (
            <PrimaryButton
              type="button"
              onClick={() => setShowGrantAccess(true)}
              className="bg-[#FD3566] hover:bg-[#EA023B] shadow-md shadow-[#FD3566]/20 transition-all mt-2"
            >
              <UserPlus className="size-4" />
              Grant Permission
            </PrimaryButton>
          )}
        />
      )}

      <GrantAccessDialog
        open={showGrantAccess}
        onClose={() => setShowGrantAccess(false)}
        orgs={orgs}
        projects={projects}
        users={users}
        activeOrgId={orgId}
        activeProjectId={projectId}
        onGrant={handleGrantAccess}
      />
    </div>
  );
}

function PermissionBadge({ label, isAdmin }: { label: string; isAdmin: boolean }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2 py-0.5 h-6 text-[10px] font-bold tracking-tight whitespace-nowrap transition-colors",
      isAdmin 
        ? "bg-[#F3E8FF] text-[#7C3AED]" // Purple for Admin
        : "bg-[#F3F4F6] text-neutral-600" // Standard for View only
    )}>
      {label}
    </span>
  );
}
