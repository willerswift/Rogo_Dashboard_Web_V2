"use client";

import { useState, useEffect } from "react";
import { Search, ChevronDown, ChevronRight, Building2, FolderIcon, Dot, Plus } from "lucide-react";
import { usePartnerContext } from "@/lib/hooks/usePartnerContext";
import { listOrganizations } from "@/lib/api/organization";
import { listProjects } from "@/lib/api/project";
import type { OrgWithOwner, Project } from "@/lib/types/partner";
import { cn } from "@/lib/utils/cn";
import { useRouter, useSearchParams } from "next/navigation";

export function AccessTreeSidebar() {
  const { session } = usePartnerContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const partnerId = session.activePartnerId;

  const [orgs, setOrgs] = useState<OrgWithOwner[]>([]);
  const [standaloneProjects, setStandaloneProjects] = useState<Project[]>([]);
  const [expandedOrgs, setExpandedOrgs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [accessScope, setAccessScope] = useState<"partner" | "user">("partner");

  const activeOrgId = searchParams.get("orgId");
  const activeProjectId = searchParams.get("projectId");

  useEffect(() => {
    async function loadTree() {
      if (!partnerId) return;
      try {
        setLoading(true);
        const [nextOrgs, nextProjects] = await Promise.all([
          listOrganizations(partnerId),
          listProjects(partnerId),
        ]);
        setOrgs(nextOrgs);
        setStandaloneProjects(nextProjects.filter(p => !p.orgId));
      } catch (error) {
        console.error("Failed to load access tree", error);
      } finally {
        setLoading(false);
      }
    }
    void loadTree();
  }, [partnerId]);

  const toggleOrg = (orgId: string) => {
    const next = new Set(expandedOrgs);
    if (next.has(orgId)) next.delete(orgId);
    else next.add(orgId);
    setExpandedOrgs(next);
  };

  const handleSelectOrg = (orgId: string) => {
    router.push(`/overview?orgId=${orgId}`);
  };

  const handleSelectProject = (projectId: string, orgId?: string) => {
    const url = orgId 
      ? `/overview?orgId=${orgId}&projectId=${projectId}`
      : `/overview?projectId=${projectId}`;
    router.push(url);
  };

  return (
    <aside className="h-screen w-[280px] border-r border-neutral-100 bg-white overflow-hidden flex flex-col shadow-sm font-sans">
      {/* 1. Partner Switcher */}
      <div className="p-4 border-b border-neutral-100">
        <div className="flex h-[48px] items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-2 hover:bg-neutral-50 cursor-pointer transition-all shadow-sm">
          <span className="text-[14px] font-bold text-neutral-900 truncate">
            <span className="font-normal text-neutral-500 mr-2">Partner:</span>
            {session.activePartnerId || "Rogo"}
          </span>
          <ChevronDown className="size-4 text-neutral-400 shrink-0" />
        </div>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* 2. Access Tree Header */}
        <div className="p-6 pb-2">
          <h2 className="text-[20px] font-bold font-heading text-neutral-900 tracking-tight">Access Tree</h2>
        </div>

        {/* 3. Search */}
        <div className="px-6 py-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search partner, org, project"
              className="w-full h-11 rounded-xl border border-neutral-200 bg-white pl-11 pr-3 text-[14px] font-sans outline-none focus:border-primary-300 focus:ring-4 focus:ring-primary-100/20 transition-all placeholder:text-neutral-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* 4. Access Scope Toggle */}
        <div className="px-6 py-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-3 font-sans">Access Scope</p>
          <div className="flex p-1 bg-neutral-100 rounded-2xl">
            <button
              onClick={() => setAccessScope("partner")}
              className={cn(
                "flex-1 py-2 text-[13px] font-bold rounded-xl transition-all font-sans",
                accessScope === "partner" ? "bg-primary-300 text-white shadow-md" : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              Partner View
            </button>
            <button
              onClick={() => setAccessScope("user")}
              className={cn(
                "flex-1 py-2 text-[13px] font-bold rounded-xl transition-all font-sans",
                accessScope === "user" ? "bg-primary-300 text-white shadow-md" : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              User View
            </button>
          </div>
        </div>

        {/* Tree Content */}
        <div className="mt-4 border-t border-neutral-100 pt-4 flex-1 overflow-y-auto px-4 custom-scrollbar font-sans">
          <div className="space-y-1">
            {/* Partner Root */}
            <div className="flex items-center gap-3 px-3 py-2.5 text-[14px] font-bold text-neutral-600">
              <FolderIcon className="size-5 text-neutral-400 fill-neutral-400/10" />
              <span>{session.activePartnerId || "Rogo"}</span>
            </div>

            {/* Organizations */}
            <div className="pl-2 space-y-1">
              {orgs.map((org) => {
                const isExpanded = expandedOrgs.has(org.orgId) || activeOrgId === org.orgId;
                const isActive = activeOrgId === org.orgId && !activeProjectId;

                return (
                  <div key={org.orgId} className="space-y-1">
                    <div className="group flex items-center">
                      <button 
                        onClick={() => toggleOrg(org.orgId)}
                        className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-400 transition-colors"
                      >
                        {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                      </button>
                      <button
                        onClick={() => handleSelectOrg(org.orgId)}
                        className={cn(
                          "flex flex-1 items-center gap-3 rounded-xl px-3 py-2 text-[14px] font-sans transition-all",
                          isActive 
                            ? "bg-[#E6E8F4] text-[#393984] font-bold" 
                            : "text-neutral-600 hover:bg-neutral-50"
                        )}
                      >
                        <Building2 className={cn("size-[18px]", isActive ? "text-[#393984]" : "text-neutral-400")} />
                        <span className="truncate">{org.name}</span>
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="pl-8 space-y-1 border-l border-neutral-100 ml-3.5">
                        <OrgProjectsList 
                          orgId={org.orgId} 
                          activeProjectId={activeProjectId}
                          onSelect={(pid) => handleSelectProject(pid, org.orgId)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}

              {standaloneProjects.map((project) => (
                <div key={project.uuid} className="pl-6">
                  <button
                    onClick={() => handleSelectProject(project.uuid)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[14px] font-sans transition-all relative overflow-hidden",
                      activeProjectId === project.uuid
                        ? "bg-[#E6E8F4] text-[#393984] font-bold"
                        : "text-neutral-600 hover:bg-neutral-50"
                    )}
                  >
                    <Dot className={cn("size-5", activeProjectId === project.uuid ? "text-[#393984]" : "text-green-500")} />
                    <span className="truncate">{project.name}</span>
                    {activeProjectId === project.uuid && (
                      <div className="absolute right-0 top-0 h-full w-1 rounded-l-full bg-[#393984]" />
                    )}
                  </button>
                </div>
              ))}
            </div>

            <button className="flex w-full items-center gap-3 px-3 py-4 text-[14px] font-bold text-primary-300 hover:bg-primary-100/10 rounded-xl transition-colors mt-2 font-sans">
              <Plus className="size-5" />
              <span>Create New Organization</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

function OrgProjectsList({ orgId, activeProjectId, onSelect }: { 
  orgId: string; 
  activeProjectId: string | null;
  onSelect: (pid: string) => void;
}) {
  const { session } = usePartnerContext();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!session.activePartnerId) return;
      try {
        const next = await listProjects(session.activePartnerId, orgId);
        setProjects(next);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [orgId, session.activePartnerId]);

  if (loading) return <div className="pl-6 py-2 text-[10px] text-neutral-400 italic">Loading...</div>;

  return (
    <>
      {projects.map((p) => (
        <button
          key={p.uuid}
          onClick={() => onSelect(p.uuid)}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[14px] transition-all relative overflow-hidden",
            activeProjectId === p.uuid
              ? "bg-[#E6E8F4] text-[#393984] font-bold"
              : "text-neutral-500 hover:text-neutral-900"
          )}
        >
          <Dot className={cn("size-5", activeProjectId === p.uuid ? "text-[#393984]" : "text-green-500")} />
          <span className="truncate">{p.name}</span>
          {activeProjectId === p.uuid && (
            <div className="absolute right-0 top-0 h-full w-1 rounded-l-full bg-[#393984]" />
          )}
        </button>
      ))}
    </>
  );
}
