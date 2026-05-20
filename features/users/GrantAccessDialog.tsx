"use client";

import { useState, useMemo } from "react";
import { X, Search } from "lucide-react";
import { usePartnerContext } from "@/lib/hooks/usePartnerContext";
import type { UserWithNumProject, OrgWithOwner, Project } from "@/lib/types/partner";
import { Avatar } from "@/lib/components/ui/avatar";
import { CheckboxInput, PrimaryButton, SecondaryButton, SearchInput } from "@/features/shared/ui";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/format";

interface GrantAccessDialogProps {
  open: boolean;
  onClose: () => void;
  orgs: OrgWithOwner[];
  projects: Project[];
  users: UserWithNumProject[];
  activeOrgId?: string | null;
  activeProjectId?: string | null;
  onGrant?: (userId: string, projectIds: string[], permissions: string[]) => Promise<void>;
}

export function GrantAccessDialog({
  open,
  onClose,
  orgs,
  projects,
  users,
  activeOrgId,
  activeProjectId,
  onGrant
}: GrantAccessDialogProps) {
  const [search, setSearch] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [view, setView] = useState<"permissions" | "projectList">("permissions");

  const [permDevEdit, setPermDevEdit] = useState(false);
  const [permDevView, setPermDevView] = useState(false);
  const [permAuthEdit, setPermAuthEdit] = useState(false);
  const [permAuthView, setPermAuthView] = useState(false);
  const [permReport, setPermReport] = useState(false);

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const query = projectSearch.toLowerCase();
      const matchName = project.name?.toLowerCase().includes(query);
      const matchId = project.uuid?.toLowerCase().includes(query);
      const matchCreated = project.createdAt && formatDate(project.createdAt).toLowerCase().includes(query);
      const matchUpdated = project.updatedAt && formatDate(project.updatedAt).toLowerCase().includes(query);
      return matchName || matchId || matchCreated || matchUpdated;
    });
  }, [projects, projectSearch]);

  const isAllSelected = filteredProjects.length > 0 && filteredProjects.every(p => selectedProjects.has(p.uuid));

  const handleToggleAllProjects = () => {
    if (isAllSelected) {
      // If all are selected, unselect the currently filtered ones
      setSelectedProjects(prev => {
        const next = new Set(prev);
        filteredProjects.forEach(p => next.delete(p.uuid));
        return next;
      });
    } else {
      // Select all currently filtered ones
      setSelectedProjects(prev => {
        const next = new Set(prev);
        filteredProjects.forEach(p => next.add(p.uuid));
        return next;
      });
    }
  };

  const handleToggleProject = (uuid: string) => {
    setSelectedProjects(prev => {
      const next = new Set(prev);
      if (next.has(uuid)) {
        next.delete(uuid);
      } else {
        next.add(uuid);
      }
      return next;
    });
  };

  // Dialog Title Logic
  const title = useMemo(() => {
    if (view === "projectList") return "Project list";

    let orgName = "Organization";
    let projectName = "Project";
    
    if (activeOrgId) {
      const org = orgs.find(o => o.orgId === activeOrgId);
      if (org) orgName = org.name;
    }
    
    if (activeProjectId) {
      const proj = projects.find(p => p.uuid === activeProjectId);
      if (proj) projectName = proj.name;
    }

    return `Rogo / ${orgName} / ${projectName}`;
  }, [activeOrgId, activeProjectId, orgs, projects, view]);

  const filteredUsers = useMemo(() => {
    if (!search) return users;
    const lowerSearch = search.toLowerCase();
    return users.filter(
      u => u.user.name.toLowerCase().includes(lowerSearch) || 
           u.user.email.toLowerCase().includes(lowerSearch)
    );
  }, [search, users]);

  const handleSubmit = async () => {
    if (!selectedUserId) return;
    setIsSubmitting(true);
    try {
      if (onGrant) {
        const permissions: string[] = [];
        if (permDevEdit) permissions.push("projectDev:edit");
        if (permDevView) permissions.push("projectDev:view");
        if (permAuthEdit) permissions.push("projectAuth:edit");
        if (permAuthView) permissions.push("projectAuth:view");
        if (permReport) permissions.push("projectReport:edit", "projectReport:view");
        
        const finalProjectIds = isAllSelected && selectedProjects.size === projects.length 
          ? ["*"] 
          : Array.from(selectedProjects);

        await onGrant(selectedUserId, finalProjectIds, permissions);
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4 transition-colors duration-500">
      <div className="relative w-full max-w-[800px] h-[600px] flex flex-col rounded-[var(--Radius-6,12px)] bg-surface border border-dialog-border shadow-dialog animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Header */}
        <div className="relative px-8 py-[var(--Spacing-5,20px)] border-b border-border shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                {view === "projectList" && (
                  <button onClick={() => setView("permissions")} className="text-neutral-400 hover:text-foreground transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                )}
                <h5 className="text-[24px] font-bold text-foreground tracking-tight font-heading">{title}</h5>
              </div>
              <p className="text-[13px] text-neutral-500 mt-1">Manage who has access to this organization and their roles.</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-neutral-400 hover:bg-surface-muted transition-colors -mt-1 -mr-1"
            >
              <X className="size-5" />
            </button>
          </div>
          
          {view === "projectList" && (
            <div className="absolute right-8 bottom-3 w-[280px]">
              <SearchInput
                placeholder="Search projects..."
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {view === "permissions" ? (
            <>
              {/* Left Panel - Users */}
              <div className="w-[240px] border-r border-border flex flex-col bg-surface shrink-0 p-6 gap-5 self-stretch items-start">
                <div className="w-full shrink-0">
                  <SearchInput
                    placeholder="Search Username"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div className="flex-1 w-full overflow-y-auto space-y-4 custom-scrollbar">
                  {filteredUsers.map(({ user }) => (
                    <button
                      key={user.ownerId}
                      onClick={() => setSelectedUserId(user.ownerId)}
                      className={cn(
                        "w-full flex items-center gap-3 p-1 rounded-xl transition-all text-left self-stretch",
                        selectedUserId === user.ownerId 
                          ? "bg-primary-100/20 ring-1 ring-primary-300/20 shadow-sm" 
                          : "hover:bg-surface-muted"
                      )}
                    >
                      <Avatar name={user.name} email={user.email} className="size-10" />
                      <div className="overflow-hidden flex-1">
                        <p className={cn(
                          "text-[16px] font-bold truncate leading-[24px] font-sans text-foreground", 
                        )}>
                          {user.name}
                        </p>
                        <p className="text-[12px] text-neutral-500 truncate leading-[18px] font-sans">{user.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Panel - Permissions */}
              <div className="flex-1 p-6 overflow-y-auto">
                {!selectedUserId ? (
                  <div className="h-full flex flex-col items-center justify-center text-neutral-400">
                    <p>Select a user to assign permissions</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between bg-primary-100/10 rounded-xl p-4 border border-primary-300/20">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <CheckboxInput checked={isAllSelected} onChange={handleToggleAllProjects} />
                        <span className="text-[14px] font-medium text-foreground">Apply user to all Projects</span>
                      </label>
                      <button 
                        onClick={() => setView("projectList")}
                        className="text-[13px] font-bold text-primary-300 flex items-center gap-1.5 hover:text-primary-400 transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 1L1 4L7 7L13 4L7 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M1 10L7 13L13 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M1 7L7 10L13 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {projects.length} Projects
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1">
                          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>

                    <div className="space-y-4">
                      <h6 className="text-[14px] font-medium text-primary-300">(Optional) Project Development</h6>
                      <div className="space-y-3 pl-1">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <CheckboxInput checked={permDevEdit} onChange={() => setPermDevEdit(!permDevEdit)} />
                          <span className="text-[14px] text-neutral-600 dark:text-neutral-400">Project Development Edit (Create/ Edit/ Delete)</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <CheckboxInput checked={permDevView} onChange={() => setPermDevView(!permDevView)} />
                          <span className="text-[14px] text-neutral-600 dark:text-neutral-400">Project Development View</span>
                        </label>
                      </div>
                    </div>

                    <div className="w-full h-px bg-border border-t border-dashed" />

                    <div className="space-y-4">
                      <h6 className="text-[14px] font-medium text-primary-300">(Optional) Project Authorization:</h6>
                      <div className="flex gap-8 pl-1">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <CheckboxInput checked={permAuthEdit} onChange={() => setPermAuthEdit(!permAuthEdit)} />
                          <span className="text-[14px] text-neutral-600 dark:text-neutral-400">Project Authorization Edit (Create/ Edit/ Delete)</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <CheckboxInput checked={permAuthView} onChange={() => setPermAuthView(!permAuthView)} />
                          <span className="text-[14px] text-neutral-600 dark:text-neutral-400">Project Authorization View</span>
                        </label>
                      </div>
                    </div>

                     <div className="space-y-4">
                      <h6 className="text-[14px] font-medium text-primary-300">(Optional) Project Report:</h6>
                      <div className="pl-1">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <CheckboxInput checked={permReport} onChange={() => setPermReport(!permReport)} />
                          <span className="text-[14px] text-neutral-600 dark:text-neutral-400">Report Project</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col h-full bg-surface overflow-hidden">
              <div className="px-6 pt-4 pb-4">
                <div className="flex items-center justify-between bg-primary-100/10 rounded-xl p-4 border border-primary-300/20">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <CheckboxInput checked={isAllSelected} onChange={handleToggleAllProjects} />
                    <span className="text-[14px] font-medium text-foreground">Apply user to all Projects</span>
                  </label>
                  <span className="text-[13px] font-bold text-primary-300 flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 1L1 4L7 7L13 4L7 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M1 10L7 13L13 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M1 7L7 10L13 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {filteredProjects.length} Projects
                  </span>
                </div>
              </div>
              <div className="flex-1 overflow-auto border-t border-border">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="sticky top-0 bg-surface shadow-sm z-10">
                    <tr className="text-[12px] font-bold uppercase tracking-wider text-neutral-500 leading-[18px] font-sans border-b border-border">
                      <th className="px-6 py-4 w-12 text-left">ALL PROJECT</th>
                      <th className="px-6 py-4 text-left">NAME</th>
                      <th className="px-6 py-4 text-left">PROJECT ID</th>
                      <th className="px-6 py-4 text-left">STATUS</th>
                      <th className="px-6 py-4 text-left">CREATED</th>
                      <th className="px-6 py-4 text-left">UPDATED</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-muted">
                    {filteredProjects.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-neutral-400 font-medium">
                          {projectSearch ? "No projects found matching your search." : "No projects available."}
                        </td>
                      </tr>
                    ) : (
                      filteredProjects.map((project) => (
                        <tr key={project.uuid} className="hover:bg-surface-muted transition-colors">
                          <td className="px-6 py-4">
                            <CheckboxInput checked={selectedProjects.has(project.uuid)} onChange={() => handleToggleProject(project.uuid)} />
                          </td>
                          <td className="px-6 py-4 font-medium text-primary-300">{project.name}</td>
                          <td className="px-6 py-4 font-mono text-[12px] text-neutral-400">{project.uuid.slice(0, 8)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#1FC16B] bg-[#1FC16B]/10 px-2 py-0.5 rounded-full w-fit">
                              <div className="h-1.5 w-1.5 rounded-full bg-[#1FC16B]" />
                              ACTIVE
                            </div>
                          </td>
                          <td className="px-6 py-4 text-[13px] text-neutral-500">{project.createdAt ? formatDate(project.createdAt) : "—"}</td>
                          <td className="px-6 py-4 text-[13px] text-neutral-500">{project.updatedAt ? formatDate(project.updatedAt) : "—"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t border-border px-6 py-4 bg-surface">
                <span className="text-[13px] text-neutral-500">
                  Showing 1 to {filteredProjects.length} of {filteredProjects.length} entries
                </span>
                <div className="flex gap-2">
                  <SecondaryButton disabled className="h-8 text-[13px] px-3 font-sans opacity-50 cursor-not-allowed">Previous</SecondaryButton>
                  <SecondaryButton disabled className="h-8 text-[13px] px-3 font-sans opacity-50 cursor-not-allowed">Next</SecondaryButton>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex justify-end gap-3 shrink-0 bg-surface rounded-b-[var(--Radius-6,12px)]">
          <SecondaryButton onClick={onClose} className="px-6">
            Close
          </SecondaryButton>
          <PrimaryButton onClick={handleSubmit} disabled={!selectedUserId || isSubmitting} className="px-8 shadow-md shadow-primary-300/20">
            Save
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
