"use client";

import { useState, useMemo } from "react";
import { X, Search } from "lucide-react";
import { usePartnerContext } from "@/lib/hooks/usePartnerContext";
import type { UserWithNumProject, OrgWithOwner, Project } from "@/lib/types/partner";
import { Avatar } from "@/lib/components/ui/avatar";
import { PrimaryButton, SecondaryButton } from "@/features/shared/ui";
import { cn } from "@/lib/utils/cn";

interface GrantAccessDialogProps {
  open: boolean;
  onClose: () => void;
  orgs: OrgWithOwner[];
  projects: Project[];
  users: UserWithNumProject[];
  activeOrgId?: string | null;
  activeProjectId?: string | null;
  onGrant?: (userId: string, permissions: string[]) => Promise<void>;
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
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [view, setView] = useState<"permissions" | "projectList">("permissions");

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
        await onGrant(selectedUserId, ["example:permission"]);
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <div className="relative w-full max-w-[800px] h-[600px] flex flex-col rounded-[24px] bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-neutral-100 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              {view === "projectList" && (
                <button onClick={() => setView("permissions")} className="text-neutral-400 hover:text-neutral-900 transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
              <h5 className="text-[24px] font-bold text-[#1F244A] tracking-tight font-heading">{title}</h5>
            </div>
            <p className="text-[13px] text-neutral-500 mt-1">Manage who has access to this organization and their roles.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-50 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {view === "permissions" ? (
            <>
              {/* Left Panel - Users */}
              <div className="w-[280px] border-r border-neutral-100 flex flex-col bg-neutral-50/30">
                <div className="p-4 shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Search Username"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full h-10 rounded-xl border border-neutral-200 bg-white pl-9 pr-3 text-[14px] outline-none focus:border-primary-300 focus:ring-4 focus:ring-primary-100/20 transition-all placeholder:text-neutral-400"
                    />
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                  {filteredUsers.map(({ user }) => (
                    <button
                      key={user.ownerId}
                      onClick={() => setSelectedUserId(user.ownerId)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                        selectedUserId === user.ownerId 
                          ? "bg-[#E6E8F4] border border-[#393984]/10 shadow-sm" 
                          : "hover:bg-white border border-transparent"
                      )}
                    >
                      <Avatar name={user.name} email={user.email} />
                      <div className="overflow-hidden">
                        <p className={cn("text-[14px] font-bold truncate", selectedUserId === user.ownerId ? "text-[#393984]" : "text-neutral-900")}>
                          {user.name}
                        </p>
                        <p className="text-[12px] text-neutral-500 truncate">{user.email}</p>
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
                    <div className="flex items-center justify-between bg-[#FFF1F4] rounded-xl p-4 border border-[#FD3566]/20">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" className="flex flex-col items-center justify-center w-[22px] h-[22px] rounded-[8px] border border-neutral-500 bg-neutral-100 text-[#FD3566] focus:ring-[#FD3566]" />
                        <span className="text-[14px] font-medium text-neutral-900">Apply user to all Projects</span>
                      </label>
                      <button 
                        onClick={() => setView("projectList")}
                        className="text-[13px] font-bold text-[#1F244A] flex items-center gap-1.5 hover:text-[#FD3566] transition-colors"
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
                      <h6 className="text-[14px] font-medium text-[#393984]">(Optional) Project Development</h6>
                      <div className="space-y-3 pl-1">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" className="flex flex-col items-center justify-center w-[22px] h-[22px] rounded-[8px] border border-neutral-500 bg-neutral-100 text-[#FD3566] focus:ring-[#FD3566]" />
                          <span className="text-[14px] text-neutral-700">Project Development Edit (Create/ Edit/ Delete)</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" className="flex flex-col items-center justify-center w-[22px] h-[22px] rounded-[8px] border border-neutral-500 bg-neutral-100 text-[#FD3566] focus:ring-[#FD3566]" />
                          <span className="text-[14px] text-neutral-700">Project Development View</span>
                        </label>
                      </div>
                    </div>

                    <div className="w-full h-px bg-neutral-200 border-t border-dashed" />

                    <div className="space-y-4">
                      <h6 className="text-[14px] font-medium text-[#393984]">(Optional) Project Authorization:</h6>
                      <div className="flex gap-8 pl-1">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" className="flex flex-col items-center justify-center w-[22px] h-[22px] rounded-[8px] border border-neutral-500 bg-neutral-100 text-[#FD3566] focus:ring-[#FD3566]" />
                          <span className="text-[14px] text-neutral-700">Project Authorization Edit (Create/ Edit/ Delete)</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" className="flex flex-col items-center justify-center w-[22px] h-[22px] rounded-[8px] border border-neutral-500 bg-neutral-100 text-[#FD3566] focus:ring-[#FD3566]" />
                          <span className="text-[14px] text-neutral-700">Project Authorization View</span>
                        </label>
                      </div>
                    </div>

                     <div className="space-y-4">
                      <h6 className="text-[14px] font-medium text-[#393984]">(Optional) Project Report:</h6>
                      <div className="pl-1">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" className="flex flex-col items-center justify-center w-[22px] h-[22px] rounded-[8px] border border-neutral-500 bg-neutral-100 text-[#FD3566] focus:ring-[#FD3566]" />
                          <span className="text-[14px] text-neutral-700">Report Project</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
              <div className="p-6 pb-4">
                <div className="flex items-center justify-between bg-[#FFF1F4] rounded-xl p-4 border border-[#FD3566]/20 mb-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="flex flex-col items-center justify-center w-[22px] h-[22px] rounded-[8px] border border-neutral-500 bg-neutral-100 text-[#FD3566] focus:ring-[#FD3566]" />
                    <span className="text-[14px] font-medium text-neutral-900">Apply user to all Projects</span>
                  </label>
                  <span className="text-[13px] font-bold text-[#1F244A] flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 1L1 4L7 7L13 4L7 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M1 10L7 13L13 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M1 7L7 10L13 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {projects.length} Projects
                  </span>
                </div>
              </div>
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="sticky top-0 bg-white shadow-[0_1px_0_0_#F5F5F5] z-10">
                    <tr className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#1F244A]">
                      <th className="px-6 py-4 w-12">ALL PROJECT</th>
                      <th className="px-4 py-4">NAME</th>
                      <th className="px-4 py-4">PROJECT ID</th>
                      <th className="px-4 py-4">STATUS</th>
                      <th className="px-4 py-4">CREATED</th>
                      <th className="px-4 py-4">CREATED</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {projects.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-neutral-400 font-medium">
                          No projects available.
                        </td>
                      </tr>
                    ) : (
                      projects.map((project) => (
                        <tr key={project.uuid} className="hover:bg-neutral-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <input type="checkbox" className="flex flex-col items-center justify-center w-[22px] h-[22px] rounded-[8px] border border-neutral-500 bg-neutral-100 text-[#FD3566] focus:ring-[#FD3566]" />
                          </td>
                          <td className="px-4 py-4 font-medium text-[#FD3566]">{project.name}</td>
                          <td className="px-4 py-4 font-mono text-[12px] text-neutral-600">{project.uuid.slice(0, 8)}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#1FC16B] bg-[#1FC16B]/10 px-2 py-0.5 rounded-full w-fit">
                              <div className="h-1.5 w-1.5 rounded-full bg-[#1FC16B]" />
                              ACTIVE
                            </div>
                          </td>
                          <td className="px-4 py-4 text-[13px] text-neutral-500">Oct 24, 2023</td>
                          <td className="px-4 py-4 text-[13px] text-neutral-500">Jun 21, 2025</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t border-neutral-100 px-6 py-4 bg-white">
                <span className="text-[13px] text-neutral-500">
                  Showing 1 to {projects.length} of {projects.length} entries
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
        <div className="p-4 border-t border-neutral-100 flex justify-end gap-3 shrink-0 bg-white rounded-b-[24px]">
          <SecondaryButton onClick={onClose} className="px-6 border-neutral-300 text-neutral-700">
            Close
          </SecondaryButton>
          <PrimaryButton onClick={handleSubmit} disabled={!selectedUserId || isSubmitting} className="px-8 shadow-md">
            Save
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
