"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Search, ChevronDown, ChevronRight, Building2, FolderIcon, Dot, Plus, Shield, Check } from "lucide-react";
import { usePartnerContext } from "@/lib/hooks/usePartnerContext";
import { listOrganizations } from "@/lib/api/organization";
import { listProjects } from "@/lib/api/project";
import { updateActivePartner } from "@/lib/api/auth";
import type { OrgWithOwner, Project } from "@/lib/types/partner";
import { cn } from "@/lib/utils/cn";
import { projectEvents } from "@/lib/utils/events";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CreateOrganizationDialog } from "@/features/organizations/CreateOrganizationDialog";
import { useIsAdmin } from "@/lib/hooks/useIsAdmin";
import { getUserAccessibleOrgIds, getUserAccessibleProjectIds, hasPermission } from "@/lib/utils/permissions";
import { getOrganization } from "@/lib/api/organization";
import { getProjectDetail } from "@/lib/api/project";

export function AccessTreeSidebar() {
  const { 
    session, 
    setSession, 
    accessScope, 
    setAccessScope, 
    globalSearch, 
    setGlobalSearch 
  } = usePartnerContext();
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const partnerId = session.activePartnerId;
  const isAdmin = useIsAdmin();

  const accessibleOrgIds = useMemo(() => getUserAccessibleOrgIds(session), [session]);
  const accessibleProjectIds = useMemo(() => getUserAccessibleProjectIds(session), [session]);

  const hasGlobalOrg = useMemo(() => hasPermission(session, "organization:view"), [session]);
  const hasGlobalProject = useMemo(() => {
    return hasPermission(session, "projectMgmt:view") || 
      session.projectResources.some(entry => entry.resources.some(r => r.includes(":project/*")));
  }, [session]);

  const [orgs, setOrgs] = useState<OrgWithOwner[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [expandedOrgs, setExpandedOrgs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  
  const [showPartnerDropdown, setShowPartnerDropdown] = useState(false);
  const partnerDropdownRef = useRef<HTMLDivElement>(null);
  
  const [partnerBrandings, setPartnerBrandings] = useState<Record<string, { color: string; favicon: string }>>({});

  const activeOrgId = searchParams.get("orgId");
  const activeProjectId = searchParams.get("projectId");

  const isOverview = pathname.startsWith("/overview");
  const showFullTree = accessScope !== "partner" || isOverview;

  useEffect(() => {
    if (typeof window !== "undefined" && session?.partnerIds) {
      const brandings: Record<string, { color: string; favicon: string }> = {};
      session.partnerIds.forEach((pid) => {
        brandings[pid] = {
          color: localStorage.getItem(`rogo-primary-color-${pid}`) || "#FD3566",
          favicon: localStorage.getItem(`rogo-favicon-url-${pid}`) || "",
        };
      });
      setPartnerBrandings(brandings);
    }
  }, [session?.partnerIds]);

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
      const data = await updateActivePartner(newPartnerId);
      setSession(data.session);
      setShowPartnerDropdown(false);
      router.push(pathname);
    } catch (e) {
      console.error("Error switching partner", e);
    }
  };

  const loadTree = useCallback(async () => {
    if (!partnerId) return;
    try {
      setLoading(true);

      const hasGlobalOrg = hasPermission(session, "organization:view");
      const hasGlobalProject = hasPermission(session, "projectMgmt:view") || 
        session.projectResources.some(entry => entry.resources.some(r => r.includes(":project/*")));

      if (isAdmin || (hasGlobalOrg && hasGlobalProject)) {
        const [nextOrgs, nextProjects] = await Promise.all([
          listOrganizations(partnerId),
          listProjects(partnerId),
        ]);
        setOrgs(nextOrgs);
        setAllProjects(nextProjects);
      } else {
        let fetchedOrgs: OrgWithOwner[] = [];
        if (hasGlobalOrg) {
          fetchedOrgs = await listOrganizations(partnerId);
        } else {
          const orgIds = getUserAccessibleOrgIds(session);
          const orgsData = await Promise.all(
            orgIds.map((orgId) => getOrganization(partnerId, orgId).catch(() => null))
          );
          fetchedOrgs = orgsData.filter((o): o is OrgWithOwner => o !== null);
        }

        let fetchedProjects: Project[] = [];
        if (hasGlobalProject) {
          fetchedProjects = await listProjects(partnerId);
        } else {
          const projectIds = getUserAccessibleProjectIds(session);
          const projectsData = await Promise.all(
            projectIds.map((projectId) => getProjectDetail(partnerId, projectId).then((res) => res.project).catch(() => null))
          );
          fetchedProjects = projectsData.filter((p): p is Project => p !== null);
        }

        setOrgs(fetchedOrgs);
        setAllProjects(fetchedProjects);
      }
    } catch (error) {
      console.error("Failed to load access tree", error);
    } finally {
      setLoading(false);
    }
  }, [partnerId, isAdmin, session]);

  useEffect(() => {
    loadTree();
    const unsubscribe = projectEvents.on("projectCreated", () => {
      loadTree();
    });
    return () => unsubscribe();
  }, [loadTree]);

  const normalizedSearch = globalSearch.toLowerCase().trim();

  const permissionFilteredOrgs = (isAdmin || hasGlobalOrg)
    ? orgs
    : orgs.filter((org) => accessibleOrgIds.includes(org.orgId));

  const permissionFilteredProjects = (isAdmin || hasGlobalProject)
    ? allProjects
    : allProjects.filter(
        (p) =>
          accessibleProjectIds.includes(p.uuid) ||
          (p.orgId && accessibleOrgIds.includes(p.orgId)),
      );

  const filteredOrgs = permissionFilteredOrgs.filter(org => {
    if (!normalizedSearch || accessScope === "partner") return true;
    const matchesOrg = org.name.toLowerCase().includes(normalizedSearch);
    const matchesAnyProject = permissionFilteredProjects.some(p => p.orgId === org.orgId && p.name.toLowerCase().includes(normalizedSearch));
    return matchesOrg || matchesAnyProject;
  });

  const filteredStandaloneProjects = permissionFilteredProjects.filter(p => {
    if (p.orgId) return false;
    if (!normalizedSearch || accessScope === "partner") return true;
    return p.name.toLowerCase().includes(normalizedSearch);
  });

  useEffect(() => {
    if (normalizedSearch && accessScope !== "partner") {
      const nextExpanded = new Set(expandedOrgs);
      let changed = false;
      orgs.forEach(org => {
        const hasMatchingProject = allProjects.some(p => p.orgId === org.orgId && p.name.toLowerCase().includes(normalizedSearch));
        if (hasMatchingProject && !nextExpanded.has(org.orgId)) {
          nextExpanded.add(org.orgId);
          changed = true;
        }
      });
      if (changed) setExpandedOrgs(nextExpanded);
    }
  }, [normalizedSearch, orgs, allProjects, accessScope]);

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
    setExpandedOrgs((prev) => {
      const next = new Set(prev);
      if (next.has(orgId)) next.delete(orgId);
      else next.add(orgId);
      return next;
    });
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
    <aside className="relative z-40 h-screen w-[280px] border-r border-border bg-surface overflow-hidden flex flex-col font-sans transition-colors duration-500">
      <div className="p-4 border-b border-border relative shrink-0" ref={partnerDropdownRef}>
        {isAdmin ? (
          <>
            <div 
              onClick={() => setShowPartnerDropdown(!showPartnerDropdown)}
              className="flex h-[40px] items-center justify-between gap-2 rounded-[4px] border border-border bg-surface-muted px-4 hover:border-primary-300 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-[14px] font-normal text-neutral-500 leading-[21px]">Partner:</span>
                <span className="text-[14px] font-bold text-foreground leading-[21px]">{session.activePartnerId || "Rogo"}</span>
              </div>
              <ChevronDown className={cn("size-4 text-neutral-400 shrink-0 transition-transform duration-200", showPartnerDropdown ? "rotate-180" : "")} />
            </div>
            {showPartnerDropdown && (
              <>
                <div className="fixed inset-0 bg-black/20 z-[110] transition-opacity" onClick={() => setShowPartnerDropdown(false)} />
                <div className="absolute top-[64px] left-4 right-4 bg-surface border border-border rounded-lg shadow-panel z-[120] overflow-hidden flex flex-col">
                  <div className="px-4 py-3 border-b border-border">
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">SWITCH PARTNER</span>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {session.partnerIds.map((pid) => {
                      const isActive = pid === session.activePartnerId;
                      const branding = partnerBrandings[pid] || { color: "#FD3566", favicon: "" };
                      const hasFavicon = !!branding.favicon;
                      return (
                        <button
                          key={pid}
                          onClick={() => handleSwitchPartner(pid)}
                          className={cn("group w-full flex items-center justify-between p-2 rounded-[8px] transition-all text-left", isActive ? "bg-primary-300/10 text-primary-300" : "hover:bg-neutral-50 text-neutral-600")}
                        >
                          <div className="flex items-center gap-3">
                            {hasFavicon ? (
                              <div className={cn("flex items-center justify-center shrink-0 size-[32px] overflow-hidden", isActive ? "bg-white rounded-[4px]" : "grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100")}>
                                <img src={branding.favicon} alt={pid} className="size-full object-contain" />
                              </div>
                            ) : (
                              <div className={cn("flex items-center justify-center shrink-0 size-[32px]", isActive ? "bg-white rounded-[4px] text-primary-300" : "text-neutral-400 group-hover:text-primary-300")}>
                                {isActive ? <Shield className="size-full" strokeWidth={2} /> : <Building2 className="size-full" />}
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className={cn("text-[15px] font-bold tracking-tight", isActive ? "text-primary-300" : "text-neutral-500 group-hover:text-primary-300")}>{pid}</span>
                              {isActive && <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 mt-0">ACTIVE SESSION</span>}
                            </div>
                          </div>
                          {isActive && <div className="flex items-center justify-center mr-4"><Check className="size-5 text-primary-300 stroke-[3px]" /></div>}
                        </button>
                      );
                    })}
                  </div>
                  <div className="px-4 py-3 bg-surface-muted border-t border-border">
                    <span className="text-xs text-neutral-400 italic">{session.partnerIds.length} partners available</span>
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex h-[40px] items-center gap-2 rounded-[4px] border border-border bg-surface-muted px-4">
            <div className="flex items-center gap-2 truncate">
              <span className="text-[14px] font-normal text-neutral-500 leading-[21px]">Partner:</span>
              <span className="text-[14px] font-bold text-foreground leading-[21px]">{session.activePartnerId || "Rogo"}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col shrink-0">
        <div className="px-4 pt-6 pb-2">
          <h2 className="text-[20px] font-semibold font-heading text-foreground tracking-tight">Access Tree</h2>
        </div>
        <div className="px-4 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder={accessScope === "partner" ? "Search username or email" : "Search organization, project, ..."}
              className="w-full h-[40px] rounded-[6px] border border-border bg-surface pl-9 pr-3 py-2 text-[14px] font-sans outline-none focus:border-primary-300 focus:ring-4 focus:ring-primary-100/20 transition-all placeholder:text-neutral-400 text-foreground"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
            />
          </div>
        </div>
        {!isOverview && (
          <div className="px-4 py-4 border-b border-border">
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">PERMISSION SCOPE</p>
            <div className="flex p-1 justify-center items-start gap-1 rounded-full bg-border-muted">
              <button
                onClick={() => setAccessScope("partner")}
                className={cn("flex flex-1 flex-col justify-center items-center py-2 px-3 rounded-full transition-all whitespace-nowrap", accessScope === "partner" ? "bg-surface text-primary-300" : "hover:bg-surface-muted text-neutral-500")}
                style={{ fontFamily: 'SF Pro Display, sans-serif', fontSize: '12px', fontWeight: 700, lineHeight: '18px' }}
              >
                Partner
              </button>
              <button
                onClick={() => setAccessScope("project")}
                className={cn("flex flex-1 flex-col justify-center items-center py-2 px-3 rounded-full transition-all whitespace-nowrap", accessScope === "project" ? "bg-surface text-primary-300" : "hover:bg-surface-muted text-neutral-500")}
                style={{ fontFamily: 'SF Pro Display, sans-serif', fontSize: '12px', fontWeight: 700, lineHeight: '18px' }}
              >
                Project
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        {showFullTree && (
          <div className="mt-4 pt-0 flex-1 overflow-y-auto px-4 custom-scrollbar font-sans">
            {loading ? (
              <div className="flex items-center justify-center py-8 text-sm text-neutral-400 italic">Loading access tree...</div>
            ) : (
              <div className="space-y-1">
                <div onClick={() => router.push(`${pathname}?view=partner`)} className="group flex items-center gap-4 py-2 text-[14px] text-foreground whitespace-nowrap px-0 cursor-pointer hover:bg-neutral-50 rounded-md transition-colors">
                  <FolderIcon className="size-5 text-neutral-400 fill-neutral-400 transition-colors group-hover:text-primary-300 group-hover:fill-primary-300" />
                  <div className="flex items-center gap-1.5 transition-colors group-hover:text-primary-300">
                    <span className="text-neutral-500 font-normal transition-colors group-hover:text-primary-300">Partner:</span>
                    <span className="font-bold uppercase tracking-tight">{session.activePartnerId || "ROGO"}</span>
                  </div>
                </div>
                <div className="pl-0 space-y-0">
                  {filteredOrgs.map((org) => {
                    const isExpanded = expandedOrgs.has(org.orgId);
                    const isActive = activeOrgId === org.orgId && !activeProjectId;
                    const orgProjects = allProjects.filter(p => p.orgId === org.orgId);
                    return (
                      <div key={org.orgId} className="space-y-0">
                        <div className="group flex items-center pl-0 hover:bg-neutral-50 rounded-md cursor-pointer transition-colors" onClick={() => toggleOrg(org.orgId)}>
                          <div className="p-1 text-neutral-400 mr-1">{isExpanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}</div>
                          <button onClick={(e) => { e.stopPropagation(); handleSelectOrg(org.orgId); }} className={cn("flex flex-1 items-center gap-3 rounded-md px-2 py-2 text-[14px] transition-all whitespace-nowrap outline-none", isActive ? "text-primary-300 font-semibold" : "text-neutral-600 font-medium")}>
                            <Building2 className={cn("size-[18px] shrink-0", isActive ? "text-primary-300" : "text-neutral-400")} />
                            <span className="truncate">{org.name}</span>
                          </button>
                        </div>
                        {isExpanded && (
                          <div className="overflow-hidden space-y-0">
                            <OrgProjectsList projects={orgProjects} activeProjectId={activeProjectId} onSelect={(pid) => handleSelectProject(pid, org.orgId)} searchQuery={normalizedSearch} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {filteredStandaloneProjects.map((project) => (
                    <div key={project.uuid} className="w-full">
                      <button onClick={() => handleSelectProject(project.uuid)} className={cn("group flex w-full items-center gap-3 rounded-md py-2 pl-[2px] pr-2 text-[14px] transition-all relative whitespace-nowrap outline-none", activeProjectId === project.uuid ? "text-primary-300 font-semibold bg-primary-300/5 ring-1 ring-primary-300/20" : "text-neutral-600 font-medium hover:bg-neutral-50 hover:text-primary-300")}>
                        <Dot className={cn("size-[18px] shrink-0 transition-colors", activeProjectId === project.uuid ? "text-primary-300" : "text-green-500 group-hover:text-primary-300")} />
                        <span className="truncate">{project.name}</span>
                      </button>
                    </div>
                  ))}
                </div>
                {isAdmin && (
                  <button onClick={() => setShowCreateOrg(true)} className="flex w-full items-center gap-1.5 py-2 px-2 text-[14px] font-semibold text-primary-300 hover:bg-primary-300/10 rounded-xl transition-colors mt-2 font-heading whitespace-nowrap outline-none">
                    <Plus className="size-5" />
                    <span>Create New Organization</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <CreateOrganizationDialog open={showCreateOrg} onClose={() => setShowCreateOrg(false)} onSuccess={() => { loadTree(); }} />
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
