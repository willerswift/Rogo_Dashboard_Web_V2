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
    <aside className="h-screen w-[280px] border-r border-neutral-100 bg-white">
      <div className="flex flex-col h-full">
        <div className="p-6 pb-2">
          <h2 className="text-[17px] font-bold font-heading text-neutral-900 tracking-tight">Access Tree</h2>
        </div>

        <div className="px-6 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search partner, org, project"
              className="w-full h-11 rounded-xl border border-neutral-200 bg-neutral-50 pl-10 pr-3 text-sm outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition-all placeholder:text-neutral-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          <div className="space-y-1">
            {/* Partner Root */}
            <div className="flex items-center gap-2 px-3 py-2 text-[13px] font-bold text-neutral-600">
              <FolderIcon className="size-4 text-neutral-400 fill-neutral-400/10" />
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
                        className="p-1 hover:bg-neutral-100 rounded text-neutral-400 transition-colors"
                      >
                        {isExpanded ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
                      </button>
                      <button
                        onClick={() => handleSelectOrg(org.orgId)}
                        className={cn(
                          "flex flex-1 items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] transition-all",
                          isActive 
                            ? "bg-[#E6E8F4] text-[#393984] font-bold" 
                            : "text-neutral-600 hover:bg-neutral-50"
                        )}
                      >
                        <Building2 className={cn("size-[15px]", isActive ? "text-[#393984]" : "text-neutral-400")} />
                        <span className="truncate">{org.name}</span>
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="pl-6 space-y-0.5 border-l border-neutral-100 ml-2.5">
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

              {/* Standalone Projects */}
              {standaloneProjects.map((project) => (
                <div key={project.uuid} className="pl-5">
                  <button
                    onClick={() => handleSelectProject(project.uuid)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] transition-all",
                      activeProjectId === project.uuid
                        ? "bg-[#E6E8F4] text-[#393984] font-bold"
                        : "text-neutral-600 hover:bg-neutral-50"
                    )}
                  >
                    <Dot className={cn("size-4", activeProjectId === project.uuid ? "text-[#393984]" : "text-green-500")} />
                    <span className="truncate">{project.name}</span>
                  </button>
                </div>
              ))}
            </div>

            <button className="flex w-full items-center gap-2 px-3 py-3 text-[13px] font-bold text-primary-300 hover:opacity-80 transition-opacity">
              <Plus className="size-4" />
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
            "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] transition-all",
            activeProjectId === p.uuid
              ? "bg-[#E6E8F4] text-[#393984] font-bold"
              : "text-neutral-500 hover:text-neutral-900"
          )}
        >
          <Dot className={cn("size-4", activeProjectId === p.uuid ? "text-[#393984]" : "text-green-500")} />
          <span className="truncate">{p.name}</span>
        </button>
      ))}
    </>
  );
}


