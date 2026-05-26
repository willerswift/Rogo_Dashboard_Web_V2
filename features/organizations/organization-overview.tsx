"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Plus, MoreVertical, Users, LayoutDashboard, Pencil, Trash2, Info, Copy, Check } from "lucide-react";
import { useRouter } from "next/navigation";

import { getOrganization, listOrganizationUsers } from "@/lib/api/organization";
import { listProjects, getProjectDetail } from "@/lib/api/project";
import { usePartnerContext } from "@/lib/hooks/usePartnerContext";
import type { OrgWithOwner, Project, OrganizationMember } from "@/lib/types/partner";
import { LoadingBlock, EmptyState, PrimaryButton, SearchInput } from "@/features/shared/ui";
import { BreadcrumbHeader } from "@/features/shared/breadcrumb-header";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/format";
import { CreateProjectDialog } from "./CreateProjectDialog";
import { RenameProjectDialog } from "./RenameProjectDialog";
import { DeleteProjectDialog } from "./DeleteProjectDialog";
import { useIsAdmin } from "@/lib/hooks/useIsAdmin";
import { getUserAccessibleOrgIds, getUserAccessibleProjectIds, hasPermission, hasOrgPermission } from "@/lib/utils/permissions";


export function OrganizationOverview({ orgId }: { orgId: string }) {
  const { session } = usePartnerContext();
  const partnerId = session.activePartnerId;
  const partnerName = session.activePartnerId || "ROGO";
  const router = useRouter();
  const isAdmin = useIsAdmin();

  // Kiểm tra quyền tạo project trong org này
  const canCreateProject = isAdmin || hasOrgPermission(session, orgId, "project:edit");
  // Kiểm tra quyền edit project (dùng làm gãrd cho actions menu)
  const canEditProjects = isAdmin;

  const [org, setOrg] = useState<OrgWithOwner | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [openUuidId, setOpenUuidId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const uuidRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!partnerId || !orgId) return;
    try {
      setLoading(true);

      const hasGlobalProject = hasPermission(session, "projectMgmt:view") || 
        session.projectResources.some(entry => entry.resources.some(r => r.includes(":project/*")));

      if (isAdmin || hasGlobalProject) {
        // Admin hoặc có global project permission: lấy toàn bộ projects của org này
        const [nextOrg, nextProjects, nextMembers] = await Promise.all([
          getOrganization(partnerId, orgId),
          listProjects(partnerId, orgId),
          isAdmin ? listOrganizationUsers(partnerId, orgId) : Promise.resolve([]),
        ]);
        setOrg(nextOrg);
        setProjects(nextProjects);
        setMembers(nextMembers);
      } else {
        // Non-admin: chỉ fetch những project được gán cụ thể
        const projectIds = getUserAccessibleProjectIds(session);

        const [nextOrg, fetchedProjects] = await Promise.all([
          getOrganization(partnerId, orgId),
          Promise.all(
            projectIds.map((projectId) =>
              getProjectDetail(partnerId, projectId)
                .then((res) => res.project)
                .catch((e) => {
                  console.warn(`Cannot load project ${projectId}:`, e);
                  return null;
                }),
            ),
          ),
        ]);

        setOrg(nextOrg);
        // Chỉ lấy project thuộc org này
        const orgProjects = fetchedProjects
          .filter((p): p is Project => p !== null)
          .filter((p) => p.orgId === orgId);
        setProjects(orgProjects);
        setMembers([]); // Non-admin không có quyền listOrganizationUsers
      }
    } catch {
      toast.error("Failed to load organization details");
    } finally {
      setLoading(false);
    }
  }, [partnerId, orgId, isAdmin, session]);

  useEffect(() => {
    void load();
  }, [load]);

  // Handle outside click for dropdown menu and UUID popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
      if (uuidRef.current && !uuidRef.current.contains(event.target as Node)) {
        setOpenUuidId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopy = (uuid: string) => {
    void navigator.clipboard.writeText(uuid);
    setCopiedId(uuid);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredProjects = projects.filter(
    (project) => {
      const query = searchQuery.toLowerCase();
      const matchName = project.name.toLowerCase().includes(query);
      const matchId = project.uuid.toLowerCase().includes(query);
      const matchCreated = project.createdAt && formatDate(project.createdAt).toLowerCase().includes(query);
      const matchUpdated = project.updatedAt && formatDate(project.updatedAt).toLowerCase().includes(query);

      return matchName || matchId || matchCreated || matchUpdated;
    }
  );

  if (loading) return <LoadingBlock label="Loading organization..." />;
  if (!org) return <EmptyState title="Not found" description="Select an organization from the tree." />;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700 transition-colors duration-500">
      <BreadcrumbHeader
        items={[
          { label: partnerName, href: "/overview?view=partner" },
          { label: org.name, active: true }
        ]}
        backHref="/overview?view=partner"
        breadcrumbAddon={
          <div className="flex items-center h-[28px] px-3 rounded-full bg-[hsla(241,100%,90%,1)] text-[12px] font-bold text-[#4A4A4A] uppercase tracking-tight whitespace-nowrap">
            ID: {org.orgId}
          </div>
        }
      >
        <div className="flex items-center gap-3 ml-2">
          <div className="flex items-center h-[28px] px-3 rounded-full bg-[hsla(241,100%,90%,1)] text-[12px] font-bold text-[#4A4A4A] uppercase tracking-wider">
            ORG
          </div>
          <div className="flex items-center h-[28px] px-3 rounded-full bg-surface-muted border border-border text-[12px] font-bold text-[#4A4A4A] gap-1.5 whitespace-nowrap">
            <Users className="size-3.5 text-neutral-400" />
            {members.length} Members
          </div>
          <div className="flex items-center h-[28px] px-3 rounded-full bg-surface-muted border border-border text-[12px] font-bold text-[#4A4A4A] gap-1.5 whitespace-nowrap">
            <LayoutDashboard className="size-3.5 text-neutral-400" />
            {projects.length} Projects
          </div>
        </div>
      </BreadcrumbHeader>

      {/* Projects Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold font-heading text-foreground tracking-tight">Projects in Organization</h3>
          <div className="flex items-center gap-3">
            <SearchInput
              placeholder="Search projects, id, time..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[240px]"
            />
            {/* Chỉ hiện nút Create Project nếu có quyền */}
            {canCreateProject && (
              <PrimaryButton
                onClick={() => setIsCreateOpen(true)}
                className="transition-all"
              >
                <Plus className="size-4 stroke-[3px]" />
                Create Project
              </PrimaryButton>
            )}
          </div>
        </div>

        <div className="overflow-visible rounded-2xl border border-border bg-surface">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-surface-muted/50 border-b border-border text-[12px] font-bold uppercase tracking-wider text-neutral-500 leading-[18px] font-sans">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Project ID</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4">Updated</th>
                {/* Chỉ hiện cột Actions nếu có quyền edit */}
                {canEditProjects && <th className="px-6 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-muted">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={canEditProjects ? 6 : 5} className="px-6 py-20 text-center text-neutral-400 font-medium">
                    {searchQuery ? "No projects found matching your search." : "No projects found in this organization."}
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project, idx) => (
                  <tr 
                    key={project.uuid} 
                    onClick={() => router.push(`/overview?orgId=${orgId}&projectId=${project.uuid}`)}
                    className={cn(
                      "group transition-colors cursor-pointer",
                      idx % 2 === 1 ? "bg-surface-muted/30" : "bg-surface",
                      "hover:bg-primary-300/5"
                    )}
                  >
                    <td className="px-6 py-4">
                      <span
                        className="font-bold text-primary-300 hover:underline transition-all block"
                      >
                        {project.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 leading-none relative">
                        <span className="font-mono text-[12px] font-bold text-neutral-400 tracking-tight uppercase leading-none">
                          {project.uuid.slice(0, 8)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenUuidId(openUuidId === project.uuid ? null : project.uuid);
                          }}
                          className={cn(
                            "flex items-center justify-center transition-colors shrink-0 p-0 outline-none -mt-[1px]",
                            openUuidId === project.uuid ? "text-primary-300" : "text-neutral-400 hover:text-primary-300"
                          )}
                          title="View full ID"
                        >
                          <Info size={13} strokeWidth={2.5} />
                        </button>

                        {openUuidId === project.uuid && (
                          <div
                            ref={uuidRef}
                            className="absolute bottom-full mb-3 left-0 z-[100] w-[280px] rounded-xl border border-border bg-surface p-3 animate-in fade-in zoom-in duration-200"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest leading-none">
                                  Project ID
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopy(project.uuid);
                                  }}
                                  className={cn(
                                    "flex h-6 items-center gap-1.5 rounded-md px-2 text-[10px] font-bold transition-all shrink-0",
                                    copiedId === project.uuid
                                      ? "bg-primary-300/10 text-primary-300"
                                      : "bg-primary-300 text-white hover:bg-primary-400"
                                  )}
                                >
                                  {copiedId === project.uuid ? (
                                    <>
                                      <Check size={11} strokeWidth={3} />
                                      <span>Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy size={11} strokeWidth={3} />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>
                              </div>

                              <div className="rounded-lg border border-primary-300/20 bg-primary-300/10 p-2">
                                <div className="text-[12px] font-medium text-primary-300 break-all leading-relaxed font-mono tracking-tight">
                                  {project.uuid}
                                </div>
                              </div>
                            </div>
                            {/* Little arrow */}
                            <div className="absolute top-full left-3 -mt-1.5 h-3 w-3 rotate-45 border-b border-r border-border bg-surface" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center h-[28px] w-fit px-3 rounded-full bg-[hsla(148,72%,44%,0.1)] gap-1.5 text-[12px] font-bold text-[#4A4A4A] uppercase tracking-wide whitespace-nowrap">
                        <div className="h-2 w-2 rounded-full bg-[#1FC16B]" />
                        Active
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13px] font-medium text-neutral-500">{project.createdAt ? formatDate(project.createdAt) : "—"}</td>
                    <td className="px-6 py-4 text-[13px] font-medium text-neutral-500">{project.updatedAt ? formatDate(project.updatedAt) : "—"}</td>
                    {/* Actions column chỉ hiện với admin */}
                    {canEditProjects && (
                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === project.uuid ? null : project.uuid);
                            }}
                            className="rounded-lg p-1.5 text-neutral-400 hover:bg-surface-muted hover:text-foreground transition-all"
                          >
                            <MoreVertical className="size-4" />
                          </button>

                          {openMenuId === project.uuid && (
                            <div
                              ref={menuRef}
                              className="absolute right-0 top-full z-20 mt-1 w-48 origin-top-right overflow-hidden rounded-xl border border-border bg-surface animate-in fade-in zoom-in-95 duration-150"
                            >
                              <div className="py-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedProject(project);
                                    setIsRenameOpen(true);
                                    setOpenMenuId(null);
                                  }}
                                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[14px] font-semibold text-foreground hover:bg-surface-muted transition-colors"
                                >
                                  <Pencil className="size-4" />
                                  Rename Project
                                </button>
                                <div className="h-px bg-border-muted" />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedProject(project);
                                    setIsDeleteOpen(true);
                                    setOpenMenuId(null);
                                  }}
                                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[14px] font-semibold text-primary-300 hover:bg-surface-muted transition-colors"
                                >
                                  <Trash2 className="size-4" />
                                  Delete Project
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="flex items-center justify-between bg-surface border-t border-border px-6 py-4">
            <div className="text-[13px] font-medium text-neutral-500">
              Showing <span className="text-foreground font-bold">1</span> to <span className="text-foreground font-bold">{projects.length}</span> of <span className="text-foreground font-bold">{projects.length}</span> entries
            </div>
            <div className="flex gap-2">
              <button disabled className="h-9 px-4 rounded-lg border border-border bg-surface text-[16px] font-semibold text-neutral-400 hover:bg-surface-muted disabled:opacity-30 transition-all font-heading">Previous</button>
              <button disabled className="h-9 px-4 rounded-lg border border-border bg-surface text-[16px] font-semibold text-neutral-400 hover:bg-surface-muted disabled:opacity-30 transition-all font-heading">Next</button>
            </div>
          </div>
        </div>
      </div>

      <CreateProjectDialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={load}
        initialOrgId={orgId}
      />

      <RenameProjectDialog
        open={isRenameOpen}
        onClose={() => {
          setIsRenameOpen(false);
          setSelectedProject(null);
        }}
        onSuccess={load}
        project={selectedProject}
      />

      <DeleteProjectDialog
        open={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedProject(null);
        }}
        onSuccess={load}
        project={selectedProject}
      />
    </div>
  );
}
