"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, ChevronDown, ChevronRight, Building2, FolderIcon, Dot, Plus, ShieldCheck, Check } from "lucide-react";
import { usePartnerContext } from "@/lib/hooks/usePartnerContext";
import { listOrganizations } from "@/lib/api/organization";
import { listProjects } from "@/lib/api/project";
import type { OrgWithOwner, Project } from "@/lib/types/partner";
import { cn } from "@/lib/utils/cn";
import { projectEvents } from "@/lib/utils/events";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CreateOrganizationDialog } from "@/features/organizations/CreateOrganizationDialog";

export function AccessTreeSidebar() {
  const { session, setSession, accessScope, setAccessScope } = usePartnerContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const partnerId = session.activePartnerId;

  const [orgs, setOrgs] = useState<OrgWithOwner[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [expandedOrgs, setExpandedOrgs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  
  const [showPartnerDropdown, setShowPartnerDropdown] = useState(false);
  const partnerDropdownRef = useRef<HTMLDivElement>(null);

  const activeOrgId = searchParams.get("orgId");
  const activeProjectId = searchParams.get("projectId");

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (partnerDropdownRef.current && !partnerDropdownRef.current.contains(event.target as Node)) {
        setShowPartnerDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSwitchPartner = async (newPartnerId: string) => {
    if (newPartnerId === partnerId) {
      setShowPartnerDropdown(false);
      return;
    }
    try {
      const res = await fetch("/api/session/active-partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activePartnerId: newPartnerId }),
      });
      if (res.ok) {
        const data = await res.json();
        setSession(data.session);
        setShowPartnerDropdown(false);
        router.push(pathname); // Clear any specific project/org selection
      } else {
        console.error("Failed to switch partner");
      }
    } catch (e) {
      console.error("Error switching partner", e);
    }
  };

  const loadTree = useCallback(async () => {
    if (!partnerId) return;
    try {
      setLoading(true);
      const [nextOrgs, nextProjects] = await Promise.all([
        listOrganizations(partnerId),
        listProjects(partnerId),
      ]);
      setOrgs(nextOrgs);
      setAllProjects(nextProjects);
    } catch (error) {
      console.error("Failed to load access tree", error);
    } finally {
      setLoading(false);
    }
  }, [partnerId]);

  useEffect(() => {
    const run = async () => {
      await Promise.resolve();
      void loadTree();
    };
    void run();

    // Listen for project creation events to refresh the tree
    const unsubscribe = projectEvents.on("projectCreated", () => {
      void loadTree();
    });

    return () => unsubscribe();
  }, [loadTree]);

  // Handle search filtering and auto-expansion
  const normalizedSearch = search.toLowerCase().trim();

  const filteredOrgs = orgs.filter(org => {
    if (!normalizedSearch) return true;
    const matchesOrg = org.name.toLowerCase().includes(normalizedSearch);
    const matchesAnyProject = allProjects.some(p => p.orgId === org.orgId && p.name.toLowerCase().includes(normalizedSearch));
    return matchesOrg || matchesAnyProject;
  });

  const filteredStandaloneProjects = allProjects.filter(p => {
    if (p.orgId) return false;
    if (!normalizedSearch) return true;
    return p.name.toLowerCase().includes(normalizedSearch);
  });

  useEffect(() => {
    if (normalizedSearch) {
      const nextExpanded = new Set(expandedOrgs);
      orgs.forEach(org => {
        const hasMatchingProject = allProjects.some(p => p.orgId === org.orgId && p.name.toLowerCase().includes(normalizedSearch));
        if (hasMatchingProject) {
          nextExpanded.add(org.orgId);
        }
      });
      setExpandedOrgs(nextExpanded);
    }
  }, [normalizedSearch, orgs, allProjects]);

  // Auto-expand the active organization when it changes
  useEffect(() => {
    if (activeOrgId) {
      setExpandedOrgs((prev) => {
        if (prev.has(activeOrgId)) return prev;
        const next = new Set(prev);
        next.add(activeOrgId);
        return next;
      });
    }
  }, [activeOrgId]);

  const toggleOrg = (orgId: string) => {
    const next = new Set(expandedOrgs);
    if (next.has(orgId)) next.delete(orgId);
    else next.add(orgId);
    setExpandedOrgs(next);
  };

  const handleSelectOrg = (orgId: string) => {
    router.push(`${pathname}?orgId=${orgId}`);
  };

  const handleSelectProject = (projectId: string, orgId?: string) => {
    const url = orgId
      ? `${pathname}?orgId=${orgId}&projectId=${projectId}`
      : `${pathname}?projectId=${projectId}`;
    router.push(url);
  };

  return (
    <aside className="h-screen w-[280px] border-r border-border bg-surface overflow-hidden flex flex-col font-sans transition-colors duration-500">
      {/* 1. Partner Switcher */}
      <div className="p-4 border-b border-border relative" ref={partnerDropdownRef}>
        <div 
          onClick={() => setShowPartnerDropdown(!showPartnerDropdown)}
          className="flex h-[40px] items-center justify-between gap-2 rounded-[4px] border border-border bg-surface-muted px-4 hover:border-primary-300 cursor-pointer transition-all"
        >
          <div className="flex items-center gap-2 truncate">
            <span className="text-[14px] font-normal text-neutral-500 leading-[21px]">
              Partner:
            </span>
            <span className="text-[14px] font-bold text-foreground leading-[21px]">
              {session.activePartnerId || "Rogo"}
            </span>
          </div>
          <ChevronDown className={cn("size-4 text-neutral-400 shrink-0 transition-transform duration-200", showPartnerDropdown ? "rotate-180" : "")} />
        </div>

        {/* Dropdown Menu */}
        {showPartnerDropdown && (
          <div className="absolute top-[64px] left-4 right-4 bg-surface border border-border rounded-lg shadow-panel z-50 overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-border">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">SWITCH PARTNER</span>
            </div>
            <div className="max-h-[300px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {session.partnerIds.map((pid) => {
                const isActive = pid === session.activePartnerId;
                return (
                  <button
                    key={pid}
                    onClick={() => handleSwitchPartner(pid)}
                    className={cn(
                      "group w-full flex items-center justify-between p-2 rounded-[16px] transition-all text-left",
                      isActive 
                        ? "bg-primary-300/10 text-primary-300" 
                        : "hover:bg-neutral-50 text-neutral-600"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {isActive ? (
                        <div className="flex items-center justify-center size-[42px] rounded-[12px] bg-primary-300 text-white shrink-0 shadow-sm transition-all duration-300">
                          <ShieldCheck className="size-[22px]" />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center size-[42px] rounded-[12px] bg-surface-muted text-neutral-400 shrink-0 border border-border group-hover:bg-surface group-hover:text-primary-300 group-hover:border-transparent group-hover:shadow-sm transition-all duration-300">
                          <Building2 className="size-[22px]" />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className={cn("text-[15px] font-bold tracking-tight transition-colors", isActive ? "text-primary-300" : "text-neutral-500 group-hover:text-primary-300")}>{pid}</span>
                        {isActive && <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 mt-0">ACTIVE SESSION</span>}
                      </div>
                    </div>
                    {isActive && (
                      <div className="flex items-center justify-center size-6 rounded-full bg-primary-300 mr-2">
                        <Check className="size-3 text-white stroke-[3px]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="px-4 py-3 bg-surface-muted border-t border-border">
              <span className="text-xs text-neutral-400 italic">{session.partnerIds.length} partners available</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* 2. Access Tree Header */}
        <div className="px-4 pt-6 pb-2">
          <h2 className="text-[20px] font-semibold font-heading text-foreground tracking-tight">Access Tree</h2>
        </div>

        {/* 3. Search */}
        <div className="px-4 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search organization, project, ..."
              className="w-full h-[40px] rounded-[6px] border border-border bg-surface pl-9 pr-3 py-2 text-[14px] font-sans outline-none focus:border-primary-300 focus:ring-4 focus:ring-primary-100/20 transition-all placeholder:text-neutral-400 text-foreground"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* 4. Access Scope Toggle */}
        {!pathname.startsWith("/overview") && (
          <div className="px-4 py-2">
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">ACCESS SCOPE</p>
            <div className="flex p-1 justify-center items-start self-stretch gap-1 rounded-full bg-border-muted transition-colors">
              <button
                onClick={() => setAccessScope("partner")}
                className={cn(
                  "flex flex-1 flex-col justify-center items-center py-2 px-3 rounded-full transition-all whitespace-nowrap",
                  accessScope === "partner" ? "bg-surface" : "hover:bg-surface-muted"
                )}
                style={{ 
                  fontFamily: 'SF Pro Display, sans-serif', 
                  fontSize: '12px', 
                  fontWeight: 700,
                  lineHeight: '18px',
                  color: accessScope === "partner" ? 'var(--brand-primary)' : 'var(--neutral-500)',
                  textAlign: 'center'
                }}
              >
                Partner View
              </button>
              <button
                onClick={() => setAccessScope("project")}
                className={cn(
                  "flex flex-1 flex-col justify-center items-center py-2 px-3 rounded-full transition-all whitespace-nowrap",
                  accessScope === "project" ? "bg-surface" : "hover:bg-surface-muted"
                )}
                style={{ 
                  fontFamily: 'SF Pro Display, sans-serif', 
                  fontSize: '12px', 
                  fontWeight: 700,
                  lineHeight: '18px',
                  color: accessScope === "project" ? 'var(--brand-primary)' : 'var(--neutral-500)',
                  textAlign: 'center'
                }}
              >
                Project view
              </button>
            </div>
          </div>
        )}

        {/* Tree Content */}
        <div className="mt-4 border-t border-border pt-4 flex-1 overflow-y-auto px-4 custom-scrollbar font-sans">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-sm text-neutral-400 italic">
              Loading access tree...
            </div>
          ) : (
            <div className="space-y-1">
              {/* Partner Root */}
              <div 
                onClick={() => router.push(`${pathname}?view=partner`)}
                className="group flex items-center gap-4 py-2 text-[14px] text-foreground whitespace-nowrap px-0 cursor-pointer hover:bg-neutral-50 rounded-md transition-colors"
              >
                <FolderIcon className="size-5 text-neutral-400 fill-neutral-400 transition-colors group-hover:text-primary-300 group-hover:fill-primary-300" />
                <div className="flex items-center gap-1.5 transition-colors group-hover:text-primary-300">
                  <span className="text-neutral-500 font-normal transition-colors group-hover:text-primary-300">Partner:</span>
                  <span className="font-bold uppercase tracking-tight">{session.activePartnerId || "ROGO"}</span>
                </div>
              </div>

              {/* Organizations */}
              <div className="pl-0 space-y-0">
                {filteredOrgs.map((org) => {
                  const isExpanded = expandedOrgs.has(org.orgId);
                  const isActive = activeOrgId === org.orgId && !activeProjectId;
                  const orgProjects = allProjects.filter(p => p.orgId === org.orgId);

                  return (
                    <div key={org.orgId} className="space-y-0">
                      <div
                        className="group flex items-center pl-0 hover:bg-neutral-50 rounded-md cursor-pointer transition-colors"
                        onClick={() => toggleOrg(org.orgId)}
                      >
                        <div className="p-1 text-neutral-400 transition-colors mr-1">
                          {isExpanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectOrg(org.orgId);
                          }}
                          className={cn(
                            "flex flex-1 items-center gap-3 rounded-md px-2 py-2 text-[14px] transition-all whitespace-nowrap outline-none",
                            isActive ? "text-primary-300 font-semibold" : "text-neutral-600 font-medium"
                          )}
                        >
                          <Building2 className={cn("size-[18px] shrink-0", isActive ? "text-primary-300" : "text-neutral-400")} />
                          <span className="truncate">{org.name}</span>
                        </button>
                      </div>

                      <div
                        className={cn(
                          "grid transition-all duration-300 ease-in-out",
                          isExpanded ? "grid-rows-[1fr] opacity-100 mt-0" : "grid-rows-[0fr] opacity-0"
                        )}
                      >
                        <div className="overflow-hidden space-y-0">
                          <OrgProjectsList
                            projects={orgProjects}
                            activeProjectId={activeProjectId}
                            onSelect={(pid) => handleSelectProject(pid, org.orgId)}
                            searchQuery={normalizedSearch}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredStandaloneProjects.map((project) => (
                  <div key={project.uuid} className="w-full">
                    <button
                      onClick={() => handleSelectProject(project.uuid)}
                      className={cn(
                        "group flex w-full items-center gap-3 rounded-md py-2 pl-[2px] pr-2 text-[14px] transition-all relative whitespace-nowrap outline-none",
                        activeProjectId === project.uuid
                          ? "text-primary-300 font-semibold bg-primary-300/5 ring-1 ring-primary-300/20"
                          : "text-neutral-600 font-medium hover:bg-neutral-50 hover:text-primary-300"
                      )}
                    >
                      <Dot className={cn("size-[18px] shrink-0 transition-colors", activeProjectId === project.uuid ? "text-primary-300" : "text-green-500 group-hover:text-primary-300")} />
                      <span className="truncate">{project.name}</span>
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowCreateOrg(true)}
                className="flex w-full items-center gap-1.5 py-2 px-2 text-[14px] font-semibold text-primary-300 hover:bg-primary-300/10 rounded-xl transition-colors mt-2 font-heading whitespace-nowrap outline-none"
              >
                <Plus className="size-5" />
                <span>Create New Organization</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <CreateOrganizationDialog
        open={showCreateOrg}
        onClose={() => setShowCreateOrg(false)}
        onSuccess={() => {
          void loadTree();
        }}
      />
    </aside>
  );
}

function OrgProjectsList({ projects, activeProjectId, onSelect, searchQuery }: {
  projects: Project[];
  activeProjectId: string | null;
  onSelect: (pid: string) => void;
  searchQuery: string;
}) {
  const filteredProjects = projects.filter(p => {
    if (!searchQuery) return true;
    return p.name.toLowerCase().includes(searchQuery);
  });

  return (
    <>
      {filteredProjects.map((p) => (
        <button
          key={p.uuid}
          onClick={() => onSelect(p.uuid)}
          className={cn(
            "group flex w-full items-center gap-3 rounded-md py-2 pl-[38px] pr-2 text-[14px] transition-all relative whitespace-nowrap outline-none",
            activeProjectId === p.uuid
              ? "text-primary-300 font-semibold bg-primary-300/5 ring-1 ring-primary-300/20"
              : "text-neutral-600 font-medium hover:bg-neutral-50 hover:text-primary-300"
          )}
        >
          <Dot className={cn("size-[18px] shrink-0 transition-colors", activeProjectId === p.uuid ? "text-primary-300" : "text-green-500 group-hover:text-primary-300")} />
          <span className="truncate">{p.name}</span>
        </button>
      ))}
    </>
  );
}
