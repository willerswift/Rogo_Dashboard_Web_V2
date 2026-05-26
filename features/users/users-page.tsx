"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { UserPlus, Trash2, Pencil, UserMinus, Users, LayoutGrid, Copy, Check, ArrowUpDown } from "lucide-react";

import { listProjects, listProjectUsers } from "@/lib/api/project";
import { listOrganizations, listOrganizationUsers } from "@/lib/api/organization";
import { deletePartnerUser, listPartnerUsers } from "@/lib/api/user";
import { listPermissionRecords, grantPermissions, revokePermissions } from "@/lib/api/permission";
import { usePartnerContext } from "@/lib/hooks/usePartnerContext";
import { usePermission } from "@/lib/hooks/usePermission";
import type { PermissionRecord, Project, UserWithNumProject, OrgWithOwner, UserPartner, AbacV2Entry } from "@/lib/types/partner";
import {
  LoadingBlock,
  PrimaryButton,
  Modal,
  SearchInput,
} from "@/features/shared/ui";
import { DataTable, type DataTableColumn } from "@/lib/components/DataTable";
import { Avatar } from "@/lib/components/ui/avatar";
import { cn } from "@/lib/utils/cn";
import { formatPermissionUpdateDate } from "@/lib/utils/format";
import { GrantAccessDialog } from "./GrantAccessDialog";

export function UsersPage() {
  const { session, accessScope, globalSearch } = usePartnerContext();
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
  const [initialUserId, setInitialUserId] = useState<string | null>(null);
  const [defaultTab, setDefaultTab] = useState<"partner" | "project">("partner");
  const [viewingProjectsFor, setViewingProjectsFor] = useState<{user: UserPartner} | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [projectSearch, setProjectSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");


  const activeProject = useMemo(() => projects.find(p => p.uuid === projectId), [projects, projectId]);
  const activeOrg = useMemo(() => {
    if (activeProject?.orgId) {
      return orgs.find(o => o.orgId === activeProject.orgId);
    }
    return orgs.find(o => o.orgId === orgId);
  }, [orgs, orgId, activeProject]);

  const handleCopy = (id: string) => {
    void navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success("Project ID copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

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
const handleGrantAccess = async (userId: string, projectIds: string[], permissions: string[]) => {
  if (!partnerId) return;
  try {
    // 1. Tìm bản ghi hiện tại của user để so sánh
    const currentRecord = permissionRecords.find(r => r.ownerId === userId);

    // Phân biệt chính xác partner-level và project-level
    // Các project-level actions thực sự bắt đầu bằng: projectDev, projectAuth, hoặc projectReport
    const projectLevelActions = permissions.filter(a => 
      a.startsWith("projectDev") || a.startsWith("projectAuth") || a.startsWith("projectReport")
    );
    const partnerLevelActions = permissions.filter(a => 
      !a.startsWith("projectDev") && !a.startsWith("projectAuth") && !a.startsWith("projectReport")
    );

    // Tách các actions, resources cũ
    const oldPartnerActions: string[] = [];
    const oldProjectResources = new Set<string>();
    const oldProjectActions = new Set<string>();

    if (currentRecord?.abac) {
      currentRecord.abac.forEach(entry => {
        entry.resources.forEach(res => {
          const isPartner = res === `partner:${partnerId}` || (res.startsWith(`partner:${partnerId}`) && !res.includes(":project/"));
          if (isPartner) {
            entry.actions.forEach(act => oldPartnerActions.push(act));
          } else if (res.includes(":project/")) {
            oldProjectResources.add(res);
            entry.actions.forEach(act => oldProjectActions.add(act));
          }
        });
      });
    }

    // A. XỬ LÝ REVOKE (THU HỒI QUYỀN BỊ BỎ CHỌN)
    if (currentRecord) {
      // 1. Partner Level Revoke
      const partnerActionsToRevoke = oldPartnerActions.filter(act => !partnerLevelActions.includes(act));
      if (partnerActionsToRevoke.length > 0) {
        await revokePermissions({
          ownerId: userId,
          partnerId,
          resources: [`partner:${partnerId}`],
          actions: partnerActionsToRevoke,
        });
      }

      // 2. Project Level Revoke
      const targetProjectResources = projectLevelActions.length > 0 && projectIds.length > 0
        ? (projectIds[0] === "*" ? [`partner:${partnerId}:project/*`] : projectIds.map(id => `partner:${partnerId}:project/${id}`))
        : [];

      // Các project resources cũ không còn được chọn nữa -> Revoke hoàn toàn trên các resources này
      const projectResourcesToRevoke = Array.from(oldProjectResources).filter(res => !targetProjectResources.includes(res));
      if (projectResourcesToRevoke.length > 0) {
        await revokePermissions({
          ownerId: userId,
          partnerId,
          resources: projectResourcesToRevoke,
        });
      }

      // Các project actions cũ không còn được chọn nữa -> Revoke trên các project resources chung (vẫn được giữ lại)
      const commonProjectResources = targetProjectResources.filter(res => oldProjectResources.has(res));
      const projectActionsToRevoke = Array.from(oldProjectActions).filter(act => !projectLevelActions.includes(act));
      if (commonProjectResources.length > 0 && projectActionsToRevoke.length > 0) {
        await revokePermissions({
          ownerId: userId,
          partnerId,
          resources: commonProjectResources,
          actions: projectActionsToRevoke,
        });
      }
    }

    // B. XỬ LÝ GRANT (CẤP THÊM QUYỀN MỚI CHỌN)
    const entriesToGrant: AbacV2Entry[] = [];

    // Partner Level Grant
    const partnerActionsToGrant = currentRecord
      ? partnerLevelActions.filter(act => !oldPartnerActions.includes(act))
      : partnerLevelActions;
    if (partnerActionsToGrant.length > 0) {
      entriesToGrant.push({
        resources: [`partner:${partnerId}`],
        actions: partnerActionsToGrant,
      });
    }

    // Project Level Grant
    if (projectLevelActions.length > 0 && projectIds.length > 0) {
      const targetProjectResources = projectIds[0] === "*"
        ? [`partner:${partnerId}:project/*`]
        : projectIds.map(id => `partner:${partnerId}:project/${id}`);

      // Grant các actions được tích chọn lên các project tương ứng
      entriesToGrant.push({
        resources: targetProjectResources,
        actions: projectLevelActions,
      });
    }

    if (entriesToGrant.length > 0) {
      await grantPermissions({
        ownerId: userId,
        partnerId,
        entries: entriesToGrant,
      });
    }

    toast.success("Access updated successfully.");
    
    // Luôn reload data để lấy dữ liệu mới nhất, không cache cũ
    await loadData();
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "Failed to update access.");
  }
};


  const getUserProjectData = useCallback((ownerId: string): { project: Project; actions: string[]; hasWildcard?: boolean }[] => {
    const record = permissionRecords.find(r => r.ownerId === ownerId);
    if (!record || !record.abac) return [];

    const projectDataMap = new Map<string, { project: Project; actions: string[] }>();
    let hasWildcard = false;
    const allProjectsActions: string[] = [];

    record.abac.forEach(entry => {
      entry.resources.forEach(res => {
        const match = res.match(new RegExp(`^partner:${partnerId}:project/(.+)$`));
        if (match) {
          const id = match[1];
          if (id === "*") {
            hasWildcard = true;
            allProjectsActions.push(...entry.actions);
          } else {
            const project = projects.find(p => p.uuid === id);
            if (project) {
              const existing = projectDataMap.get(id) || { project, actions: [] };
              existing.actions.push(...entry.actions);
              projectDataMap.set(id, existing);
            }
          }
        }
      });
    });

    // Nếu có wildcard: chỉ expand thêm những project CHƯА có trong map
    if (allProjectsActions.length > 0) {
      projects.forEach(p => {
        const existing = projectDataMap.get(p.uuid) || { project: p, actions: [] };
        existing.actions.push(...allProjectsActions);
        projectDataMap.set(p.uuid, existing);
      });
    }

    const result = Array.from(projectDataMap.values()).map(item => ({
      ...item,
      actions: Array.from(new Set(item.actions)),
      hasWildcard,
    }));

    return result;
  }, [permissionRecords, projects, partnerId]);


  const filteredUserProjects = useMemo(() => {
    if (!viewingProjectsFor) return [];
    const allData = getUserProjectData(viewingProjectsFor.user.ownerId);
    if (!projectSearch.trim()) return allData;

    const query = projectSearch.toLowerCase();
    const resMap: Record<string, string> = {
      "projectAuth": "AUTH",
      "projectMgmt": "MQTT",
      "projectDev": "PROD",
      "projectReport": "REPORT",
    };

    return allData.filter(({ project: p, actions }) => {
      // 1. Search by Name or ID
      if (p.name.toLowerCase().includes(query) || p.uuid.toLowerCase().includes(query)) return true;

      // 2. Search by Permissions (Badges)
      const groups: Record<string, Set<string>> = {};
      actions.forEach(action => {
        const [resource, act] = action.split(":");
        const shortName = resMap[resource] || resource.toUpperCase();
        if (!groups[shortName]) groups[shortName] = new Set();
        groups[shortName].add(act || "*");
      });

      const badgeLabels: string[] = [];
      Object.entries(groups).forEach(([name, acts]) => {
        if (acts.has("*") || acts.has("edit")) {
          badgeLabels.push(`${name} EDIT`.toLowerCase());
        } else if (acts.has("view")) {
          badgeLabels.push(`${name} VIEW`.toLowerCase());
        }
      });

      return badgeLabels.some(label => label.includes(query));
    });
  }, [viewingProjectsFor, getUserProjectData, projectSearch]);

  const sortedUsers = useMemo(() => {
    let list = [...users];

    if (globalSearch) {
      const query = globalSearch.toLowerCase();
      list = list.filter(u => 
        u.user.name.toLowerCase().includes(query) || 
        u.user.email.toLowerCase().includes(query)
      );
    }

    list.sort((a, b) => {
      const recA = permissionRecords.find(r => r.ownerId === a.user.ownerId);
      const recB = permissionRecords.find(r => r.ownerId === b.user.ownerId);
      
      const dateA = recA?.updatedDate || a.user.updatedAt;
      const dateB = recB?.updatedDate || b.user.updatedAt;

      const timeA = dateA ? new Date(dateA).getTime() : 0;
      const timeB = dateB ? new Date(dateB).getTime() : 0;

      return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
    });
    return list;
  }, [users, permissionRecords, sortOrder, globalSearch]);

  const columns = useMemo<DataTableColumn<UserWithNumProject>[]>(() => {
    if (accessScope === "project") {
      return [
        {
          id: "user",
          header: "USER",
          headerClassName: "text-[11px] font-bold text-neutral-500 uppercase tracking-wider",
          cell: ({ user }) => (
            <div className="flex items-center gap-3">
              <Avatar name={user.name} email={user.email} />
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-foreground leading-tight">{user.name}</span>
                <span className="text-[12px] text-neutral-500 leading-tight mt-0.5">{user.email}</span>
              </div>
            </div>
          ),
        },
        {
          id: "projects",
          header: "PROJECTS",
          headerClassName: "text-[11px] font-bold text-neutral-500 uppercase tracking-wider",
          cell: ({ user }) => {
            const userProjectData = getUserProjectData(user.ownerId);
            const actualProjects = userProjectData.map(d => d.project);
            const hasWildcard = userProjectData[0]?.hasWildcard ?? false;

            if (actualProjects.length === 0) {
              return <span className="text-neutral-400 italic text-[12px]">No projects</span>;
            }

            // Nếu có wildcard (partner:*:project/*): hiện "All Projects" thay vì count sai
            if (hasWildcard && actualProjects.length >= projects.length) {
              const displayProjects = actualProjects.slice(0, 3);
              return (
                <div className="flex flex-col gap-2 py-1">
                  <div className="flex flex-wrap gap-2">
                    {displayProjects.map((p) => (
                      <div key={p.uuid} className="flex h-[28px] items-center justify-center gap-2 rounded-full bg-[hsla(241,100%,90%,1)] px-3 py-0.5 whitespace-nowrap">
                        <span className="text-[12px] font-bold text-[#4A4A4A] tracking-tight">{p.name}</span>
                        <span className="text-[12px] font-bold text-[#3B4AD0] opacity-80">{p.uuid.slice(0, 8)}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setInitialUserId(user.ownerId);
                      setDefaultTab("project");
                      setShowGrantAccess(true);
                    }}
                    className="text-[13px] font-bold text-neutral-500 text-left hover:text-foreground transition-colors flex items-center gap-1 w-fit"
                  >
                    View All {actualProjects.length} Projects
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              );
            }

            const displayProjects = actualProjects.slice(0, 3);
            const extraCount = actualProjects.length - 3;
            
            return (
              <div className="flex flex-col gap-2 py-1">
                <div className="flex flex-wrap gap-2">
                  {displayProjects.map((p) => (
                    <div key={p.uuid} className="flex h-[28px] items-center justify-center gap-2 rounded-full bg-[hsla(241,100%,90%,1)] px-3 py-0.5 whitespace-nowrap">
                      <span className="text-[12px] font-bold text-[#4A4A4A] tracking-tight">{p.name}</span>
                      <span className="text-[12px] font-bold text-[#3B4AD0] opacity-80">{p.uuid.slice(0, 8)}</span>
                    </div>
                  ))}
                </div>
                {extraCount > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setInitialUserId(user.ownerId);
                      setDefaultTab("project");
                      setShowGrantAccess(true);
                    }}
                    className="text-[13px] font-bold text-neutral-500 text-left hover:text-foreground transition-colors flex items-center gap-1 w-fit"
                  >
                    View {extraCount} more Project{extraCount !== 1 ? 's' : ''}
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                )}
              </div>
            );
          },
        },
        {
          id: "updatedAt",
          header: "TIME UPDATED",
          headerClassName: "text-[11px] font-bold text-neutral-500 uppercase tracking-wider",
           cell: ({ user }) => {
            const record = permissionRecords.find(r => r.ownerId === user.ownerId);
            const date = record?.updatedDate || user.updatedAt;
            return <span className="text-[13px] text-neutral-500">{formatPermissionUpdateDate(date)}</span>;
          },
        },
        {
          id: "actions",
          header: "ACTIONS",
          className: "text-right",
          headerClassName: "text-[11px] font-bold text-neutral-500 uppercase tracking-wider text-right",
          cell: () => (
            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="text-neutral-400 hover:text-foreground transition-colors">
                <Pencil className="size-4" />
              </button>
              <button className="text-neutral-400 hover:text-primary-300 transition-colors">
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
        headerClassName: "text-[11px] font-bold text-neutral-500 uppercase tracking-wider",
        cell: ({ user }) => {
          const isMe = user.ownerId === session.userId;
          return (
            <div className="flex items-center gap-3">
              <Avatar name={user.name} email={user.email} />
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-foreground leading-tight">
                  {user.name} {isMe && <span className="text-primary-300 ml-1 font-medium">(you)</span>}
                </span>
                <span className="text-[12px] text-neutral-500 leading-tight mt-0.5">{user.email}</span>
              </div>
            </div>
          );
        },
      },
      {
        id: "permissions",
        header: "PERMISSION",
        headerClassName: "text-[11px] font-bold text-neutral-500 uppercase tracking-wider",
        cell: ({ user }) => {
          const record = permissionRecords.find(r => r.ownerId === user.ownerId);
          if (!record || !record.abac || !record.abac.length) return <span className="text-neutral-400 text-[12px] italic">No permissions</span>;

          const resMap: Record<string, string> = {
            "organization": "ORG",
            "authorization": "AUTH",
            "productDev": "PROD",
            "report": "REPORT",
            "projectMgmt": "PRJ",
          };

          const rawActions = record.abac.flatMap(entry => {
            const parts = entry.resources[0]?.split(":");
            if (!parts) return [];
            const resourcePath = parts[2] || "";
            const isProjectResource = resourcePath.startsWith("project");

            // Partner view: Only show non-project resources
            if (isProjectResource) return [];

            // Check if user is Admin at partner level
            if (entry.actions.includes("*")) return ["*"];

            // Filter actions to match the resource type they are applied to
            return entry.actions.filter(action => {
              const [mod] = action.split(":");
              return !!resMap[mod];
            });
          });

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

          if (finalBadges.length === 0) return <span className="text-neutral-400 text-[12px] italic">No permissions</span>;

          return (
            <div className="flex flex-wrap gap-1.5">
              {finalBadges.sort((a, b) => a.label.localeCompare(b.label)).map(badge => (
                <PermissionBadge key={badge.label} label={badge.label} isAdmin={badge.isAdmin} />
              ))}
            </div>
          );
        },
      },      {
        id: "updatedAt",
        header: (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span>TIME UPDATE</span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setSortOrder(prev => prev === "newest" ? "oldest" : "newest");
              }}
              className="p-1 hover:bg-neutral-100 rounded transition-colors"
            >
              <ArrowUpDown className="size-3" />
            </button>
          </div>
        ),
        headerClassName: "text-[11px] font-bold text-neutral-500 uppercase tracking-wider",
        cell: ({ user }) => {
          const record = permissionRecords.find(r => r.ownerId === user.ownerId);
          const date = record?.updatedDate || user.updatedAt;
          return <span className="text-[13px] text-neutral-500">{formatPermissionUpdateDate(date)}</span>;

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
  }, [accessScope, permissionRecords, canDelete, handleDeleteUser, getUserProjectData, projects, session.userId, setInitialUserId, setDefaultTab, setShowGrantAccess]);


  const subTitle = useMemo(() => {
    if (activeProject) return "Users with project access";
    if (activeOrg) return "Users with access to this organization";
    if (accessScope === "project") return "Users with project access";
    return `Users permissions within partner ${session.activePartnerId || "Partner"}`;
  }, [activeOrg, activeProject, accessScope, session.activePartnerId]);

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
            <h1 className="text-[28px] font-bold text-foreground tracking-tight font-heading">
              {rootName}
            </h1>
            {displayId && (
              <span className="inline-flex h-[28px] items-center justify-center rounded-full bg-[hsla(241,100%,90%,1)] px-3 py-0.5 text-[12px] font-bold text-[#3B4AD0]">
                ID: {displayId}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Type Badge */}
            {activeProject ? (
              <span className="inline-flex h-[28px] items-center justify-center rounded-full bg-[hsla(241,100%,90%,1)] px-3 py-0.5 text-[12px] font-bold text-[#3B4AD0]">
                PRJ
              </span>
            ) : activeOrg ? (
              <span className="inline-flex h-[28px] items-center justify-center rounded-full bg-[hsla(241,100%,90%,1)] px-3 py-0.5 text-[12px] font-bold text-[#3B4AD0]">
                ORG
              </span>
            ) : (
              <span className="inline-flex h-[28px] items-center justify-center rounded-full bg-[hsla(241,100%,90%,1)] px-3 py-0.5 text-[12px] font-bold text-[#3B4AD0]">
                PARTNER
              </span>
            )}

            {/* Stat Badges */}
            <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-bold text-neutral-500">
              <Users className="size-3.5 text-neutral-400" />
              {users.length} Members
            </div>
            
            {(activeOrg || !projectId) && (
              <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-bold text-neutral-500">
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
          <h2 className="text-[18px] font-bold text-neutral-800 tracking-tight font-heading">
            {subTitle}
          </h2>

          {canAddUser && (
            <PrimaryButton
              type="button"
              onClick={() => {
                setInitialUserId(null);
                setDefaultTab(accessScope === "project" ? "project" : "partner");
                setShowGrantAccess(true);
              }}
              className="transition-all"
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
          data={sortedUsers}
          getRowClassName={(row) => row.user.ownerId === session.userId ? "bg-primary-100/10" : ""}
          onRowClick={(user) => {
            if (user.user.ownerId === session.userId) {
              toast.error("You cannot change your own permissions.");
              return;
            }
            setInitialUserId(user.user.ownerId);
            setDefaultTab(accessScope === "project" ? "project" : "partner");
            setShowGrantAccess(true);
          }}
          emptyTitle="No users found"
          emptyDescription={projectId ? "This project doesn't have any specific user permissions yet." : "Add or attach a user to grant them access."}
          emptyAction={projectId && (
            <PrimaryButton
              type="button"
              onClick={() => {
                setInitialUserId(null);
                setShowGrantAccess(true);
              }}
              className="transition-all mt-2"
            >
              <UserPlus className="size-4" />
              Grant Permission
            </PrimaryButton>
          )}
        />
      )}

      <GrantAccessDialog
        open={showGrantAccess}
        onClose={() => {
          setShowGrantAccess(false);
          setInitialUserId(null);
        }}
        users={users}
        projects={projects}
        orgs={orgs}
        permissionRecords={permissionRecords}
        initialUserId={initialUserId}
        defaultTab={defaultTab}
        onGrant={handleGrantAccess}
      />

      <Modal
        open={viewingProjectsFor !== null}
        onClose={() => {
          setViewingProjectsFor(null);
          setProjectSearch("");
        }}
        title={`Projects for ${viewingProjectsFor?.user.name}`}
        wide
        headerExtra={
          <div className="flex justify-end mt-2">
            <SearchInput
              placeholder="Search by name, ID or permission..."
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
              className="w-full max-w-sm"
            />
          </div>
        }
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {filteredUserProjects.length === 0 ? (
            <p className="text-sm text-neutral-500 text-center py-8">
              {projectSearch ? "No projects match your search." : "No projects found."}
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {filteredUserProjects.map(({ project: p, actions }) => {
                const resMap: Record<string, string> = {
                  "projectAuth": "AUTH",
                  "projectMgmt": "MQTT",
                  "projectDev": "PROD",
                  "projectReport": "REPORT",
                };

                const badges: { label: string; isAdmin: boolean }[] = [];
                const groups: Record<string, Set<string>> = {};

                actions.forEach(action => {
                  const [resource, act] = action.split(":");
                  const shortName = resMap[resource] || resource.toUpperCase();
                  if (!groups[shortName]) groups[shortName] = new Set();
                  groups[shortName].add(act || "*");
                });

                Object.entries(groups).forEach(([name, acts]) => {
                  if (acts.has("*") || acts.has("edit")) {
                    badges.push({ label: `${name} EDIT`, isAdmin: true });
                  } else if (acts.has("view")) {
                    badges.push({ label: `${name} VIEW`, isAdmin: false });
                  }
                });

                return (
                  <div 
                    key={p.uuid} 
                    className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 transition-all hover:border-primary-300"
                  >
                    <div className="flex flex-1 items-center gap-4 min-w-0">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-100/20 text-primary-300 group-hover:bg-primary-300 group-hover:text-white transition-all duration-300">
                        <LayoutGrid className="size-5.5" />
                      </div>
                      <div className="flex flex-col gap-1 min-w-0">
                        <p className="text-[16px] font-bold text-foreground leading-none truncate group-hover:text-primary-300 transition-colors">
                          {p.name}
                        </p>
                        <div className="flex items-center gap-2 text-neutral-500 font-mono text-[11px] tracking-tight">
                          <span className="truncate font-medium group-hover:text-neutral-400 transition-colors">{p.uuid}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(p.uuid)}
                            className="shrink-0 rounded-md p-1 text-neutral-400 transition hover:bg-surface-muted hover:text-primary-300"
                            title="Copy ID"
                          >
                            {copiedId === p.uuid ? (
                              <Check className="size-3 text-green-600" />
                            ) : (
                              <Copy className="size-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex shrink-0 flex-wrap gap-2 justify-end items-center max-w-[50%]">
                      {badges.length > 0 ? (
                        badges.sort((a, b) => a.label.localeCompare(b.label)).map(badge => (
                          <PermissionBadge key={badge.label} label={badge.label} isAdmin={badge.isAdmin} />
                        ))
                      ) : (
                        <span className="text-[12px] text-neutral-400 italic font-medium px-2">Default Access</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

function PermissionBadge({ label, isAdmin }: { label: string; isAdmin: boolean }) {
  return (
    <span className={cn(
      "inline-flex h-[28px] items-center justify-center rounded-full px-3 py-0.5 text-[12px] font-bold leading-[21px] font-sans whitespace-nowrap transition-colors",
      "bg-[hsla(148,72%,44%,0.1)] text-[#1F244A]"
    )}>
      {label}
    </span>
  );
}
