"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Plus, MoreVertical, Users, LayoutDashboard, Pencil, Trash2, Info, Copy, Check } from "lucide-react";
import Link from "next/link";

import { getOrganization, listOrganizationUsers } from "@/lib/api/organization";
import { listProjects } from "@/lib/api/project";
import { usePartnerContext } from "@/lib/hooks/usePartnerContext";
import type { OrgWithOwner, Project, OrganizationMember } from "@/lib/types/partner";
import { LoadingBlock, EmptyState, PrimaryButton } from "@/features/shared/ui";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/format";
import { CreateProjectDialog } from "./CreateProjectDialog";
import { RenameProjectDialog } from "./RenameProjectDialog";
import { DeleteProjectDialog } from "./DeleteProjectDialog";

export function OrganizationOverview({ orgId }: { orgId: string }) {
  const { session } = usePartnerContext();
  const partnerId = session.activePartnerId;

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
      const [nextOrg, nextProjects, nextMembers] = await Promise.all([
        getOrganization(partnerId, orgId),
        listProjects(partnerId, orgId),
        listOrganizationUsers(partnerId, orgId),
      ]);
      setOrg(nextOrg);
      setProjects(nextProjects);
      setMembers(nextMembers);
    } catch {
      toast.error("Failed to load organization details");
    } finally {
      setLoading(false);
    }
  }, [partnerId, orgId]);

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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-[32px] font-bold font-heading text-neutral-1000 tracking-tight">{org.name}</h1>
          <div className="flex items-center h-6 px-2.5 rounded-lg bg-[#E6E8F4] text-[11px] font-bold text-[#393984] uppercase">
            ID: {org.orgId}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center h-7 px-3 rounded-full bg-[#FFEBF0] text-[10px] font-bold text-[#FD3566] uppercase tracking-wider">
            ORG
          </div>
          <div className="flex items-center h-7 px-3 rounded-full bg-neutral-100 text-[12px] font-bold text-neutral-600 gap-1.5">
            <Users className="size-3" />
            {members.length} Members
          </div>
          <div className="flex items-center h-7 px-3 rounded-full bg-neutral-100 text-[12px] font-bold text-neutral-600 gap-1.5">
            <LayoutDashboard className="size-3" />
            {projects.length} Projects
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold font-heading text-neutral-900 tracking-tight">Projects in Organization</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-neutral-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search projects, id, time..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 pl-9 pr-4 rounded-full border border-neutral-200 bg-white text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-[#FD3566] focus:ring-4 focus:ring-[#FD3566]/10 w-[240px]"
              />
            </div>
            <PrimaryButton
              onClick={() => setIsCreateOpen(true)}
              className="bg-[#FD3566] hover:bg-[#EA023B] shadow-md shadow-[#FD3566]/20 transition-all"
            >
              <Plus className="size-4 stroke-[3px]" />
              Create Project
            </PrimaryButton>
          </div>
        </div>

        <div className="overflow-visible rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-neutral-50/50 border-b border-neutral-100 text-[12px] font-bold uppercase tracking-wider text-neutral-800 leading-[18px] font-sans">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Project ID</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4">Updated</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-neutral-400 font-medium">
                    {searchQuery ? "No projects found matching your search." : "No projects found in this organization."}
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project, idx) => (
                  <tr key={project.uuid} className={cn(
                    "group transition-colors",
                    idx % 2 === 1 ? "bg-neutral-50/30" : "bg-white",
                    "hover:bg-[#FFEBF0]/30"
                  )}>
                    <td className="px-6 py-4">
                      <Link
                        href={`/overview?orgId=${orgId}&projectId=${project.uuid}`}
                        className="font-bold text-[#FD3566] hover:underline transition-all"
                      >
                        {project.name}
                      </Link>
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
                            openUuidId === project.uuid ? "text-[#FD3566]" : "text-neutral-300 hover:text-[#FD3566]"
                          )}
                          title="View full ID"
                        >
                          <Info size={13} strokeWidth={2.5} />
                        </button>

                        {openUuidId === project.uuid && (
                          <div
                            ref={uuidRef}
                            className="absolute bottom-full mb-3 left-0 z-[100] w-[280px] rounded-xl border border-neutral-200 bg-white p-3 shadow-2xl animate-in fade-in zoom-in duration-200"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest leading-none">
                                  Project ID
                                </span>
                                <button
                                  onClick={() => handleCopy(project.uuid)}
                                  className={cn(
                                    "flex h-6 items-center gap-1.5 rounded-md px-2 text-[10px] font-bold transition-all shrink-0",
                                    copiedId === project.uuid
                                      ? "bg-[#FD3566]/10 text-[#FD3566]"
                                      : "bg-[#FD3566] text-white hover:bg-[#EA023B]"
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

                              <div className="rounded-lg border border-[#E6E8F4] bg-[#E6E8F4]/30 p-2">
                                <div className="text-[12px] font-medium text-[#393984] break-all leading-relaxed font-mono tracking-tight">
                                  {project.uuid}
                                </div>
                              </div>
                            </div>
                            {/* Little arrow */}
                            <div className="absolute top-full left-3 -mt-1.5 h-3 w-3 rotate-45 border-b border-r border-neutral-200 bg-white" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#1FC16B] uppercase tracking-wide">
                        <div className="h-2 w-2 rounded-full bg-[#1FC16B]" />
                        Active
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13px] font-medium text-neutral-500">{project.createdAt ? formatDate(project.createdAt) : "—"}</td>
                    <td className="px-6 py-4 text-[13px] font-medium text-neutral-500">{project.updatedAt ? formatDate(project.updatedAt) : "—"}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === project.uuid ? null : project.uuid)}
                          className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 transition-all"
                        >
                          <MoreVertical className="size-4" />
                        </button>

                        {openMenuId === project.uuid && (
                          <div
                            ref={menuRef}
                            className="absolute right-0 top-full z-20 mt-1 w-48 origin-top-right overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-150"
                          >
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  setSelectedProject(project);
                                  setIsRenameOpen(true);
                                  setOpenMenuId(null);
                                }}
                                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[14px] font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                              >
                                <Pencil className="size-4" />
                                Rename Project
                              </button>
                              <div className="h-px bg-neutral-100" />
                              <button
                                onClick={() => {
                                  setSelectedProject(project);
                                  setIsDeleteOpen(true);
                                  setOpenMenuId(null);
                                }}
                                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[14px] font-semibold text-[#FD3566] hover:bg-neutral-50 transition-colors"
                              >
                                <Trash2 className="size-4" />
                                Delete Project
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="flex items-center justify-between bg-white border-t border-neutral-100 px-6 py-4">
            <div className="text-[13px] font-medium text-neutral-400">
              Showing <span className="text-neutral-900 font-bold">1</span> to <span className="text-neutral-900 font-bold">{projects.length}</span> of <span className="text-neutral-900 font-bold">{projects.length}</span> entries
            </div>
            <div className="flex gap-2">
              <button disabled className="h-9 px-4 rounded-lg border border-neutral-200 bg-white text-[16px] font-semibold text-neutral-400 hover:bg-neutral-50 disabled:opacity-30 transition-all font-heading">Previous</button>
              <button disabled className="h-9 px-4 rounded-lg border border-neutral-200 bg-white text-[16px] font-semibold text-neutral-400 hover:bg-neutral-50 disabled:opacity-30 transition-all font-heading">Next</button>
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
