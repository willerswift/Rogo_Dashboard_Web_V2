"use client";
import { useState, useMemo, useEffect } from "react";
import { X, Search, Plus, ChevronLeft, Mail, User as UserIcon, Building2, ChevronDown, ChevronRight, FolderIcon, LayoutGrid } from "lucide-react";
import { usePartnerContext } from "@/lib/hooks/usePartnerContext";
import type { UserWithNumProject, PermissionRecord, UserPartner, Project, OrgWithOwner } from "@/lib/types/partner";
import { Avatar } from "@/lib/components/ui/avatar";
import { CheckboxInput, PrimaryButton, SearchInput } from "@/features/shared/ui";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/format";

interface GrantAccessDialogProps {
  open: boolean;
  onClose: () => void;
  users: UserWithNumProject[];
  projects: Project[];
  orgs?: OrgWithOwner[];
  permissionRecords?: PermissionRecord[];
  initialUserId?: string | null;
  defaultTab?: "partner" | "project";
  onGrant?: (userId: string, projectIds: string[], permissions: string[]) => Promise<void>;
}

type PermissionsState = {
  devEdit: boolean;
  devView: boolean;
  authEdit: boolean;
  authView: boolean;
  reportEdit: boolean;
  reportView: boolean;
  mqttEdit: boolean;
  mqttView: boolean;
  orgEdit: boolean;
  orgView: boolean;
  authPartnerEdit: boolean;
  authPartnerView: boolean;
  prodEdit: boolean;
  prodView: boolean;
  reportPartnerEdit: boolean;
};

type ProjectPermissions = {
  devEdit: boolean;
  devView: boolean;
  authEdit: boolean;
  authView: boolean;
  report: boolean;
};

const initialPermissions: PermissionsState = {
  devEdit: false,
  devView: false,
  authEdit: false,
  authView: false,
  reportEdit: false,
  reportView: false,
  mqttEdit: false,
  mqttView: false,
  orgEdit: false,
  orgView: false,
  authPartnerEdit: false,
  authPartnerView: false,
  prodEdit: false,
  prodView: false,
  reportPartnerEdit: false,
};

const initialProjectPermissions: ProjectPermissions = {
  devEdit: false,
  devView: false,
  authEdit: false,
  authView: false,
  report: false,
};

export function GrantAccessDialog({
  open,
  onClose,
  users,
  projects,
  orgs = [],
  permissionRecords = [],
  initialUserId = null,
  defaultTab = "partner",
  onGrant
}: GrantAccessDialogProps) {
  const { session } = usePartnerContext();
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(initialUserId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"partner" | "project">(defaultTab);
  
  const [permissions, setPermissions] = useState<PermissionsState>(initialPermissions);
  const [projectPermissionsMap, setProjectPermissionsMap] = useState<Record<string, ProjectPermissions>>({});
  const [focusedProjectId, setFocusedProjectId] = useState<string | null>(null);
  const [expandedOrgs, setExpandedOrgs] = useState<Set<string>>(new Set());
  const [applyToAll, setApplyToAll] = useState(false);

  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteUsername, setInviteUsername] = useState("");
  const [inviteError, setInviteError] = useState<{ email?: string }>({});

  const groupedProjects = useMemo(() => {
    const map: Record<string, Project[]> = {};
    projects.forEach(p => {
      const key = p.orgId || "standalone";
      if (!map[key]) map[key] = [];
      map[key].push(p);
    });
    return map;
  }, [projects]);

  const numSelectedProjects = useMemo(() => Object.keys(projectPermissionsMap).length, [projectPermissionsMap]);

  useEffect(() => {
    if (open) {
      const frame = requestAnimationFrame(() => {
        setSelectedUserId(initialUserId);
        setSearch("");
        setActiveTab(defaultTab);
        setIsInviting(false);
        setInviteEmail("");
        setInviteUsername("");
        setInviteError({});
        setFocusedProjectId(null);
        setProjectPermissionsMap({});
        setExpandedOrgs(new Set(orgs.map(o => o.orgId)));
        setApplyToAll(false);
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [open, initialUserId, orgs, defaultTab]);

  useEffect(() => {
    if (!selectedUserId || isInviting) {
      if (!isInviting) {
        setPermissions(initialPermissions);
        setProjectPermissionsMap({});
      }
      return;
    }

    const record = permissionRecords.find(r => r.ownerId === selectedUserId);
    if (!record || !record.abac) {
      setPermissions(initialPermissions);
      setProjectPermissionsMap({});
      return;
    }

    const nextPerms = { ...initialPermissions };
    const nextProjectPermsMap: Record<string, ProjectPermissions> = {};

    record.abac.forEach(entry => {
      const hasAction = (action: string) => entry.actions.some(a => a === action || a === "*");
      
      if (hasAction("organization:edit")) nextPerms.orgEdit = true;
      if (hasAction("organization:view")) nextPerms.orgView = true;
      if (hasAction("authorization:edit")) nextPerms.authPartnerEdit = true;
      if (hasAction("authorization:view")) nextPerms.authPartnerView = true;
      if (hasAction("productDev:edit")) nextPerms.prodEdit = true;
      if (hasAction("productDev:view")) nextPerms.prodView = true;
      if (hasAction("report:edit") || hasAction("report:view")) nextPerms.reportPartnerEdit = true;

      entry.resources.forEach(res => {
        const match = res.match(new RegExp(`^partner:${session.activePartnerId}:project/(.+)$`));
        if (match) {
          const pid = match[1];
          if (pid !== "*") {
            const current = nextProjectPermsMap[pid] || { ...initialProjectPermissions };
            if (hasAction("projectDev:edit")) current.devEdit = true;
            if (hasAction("projectDev:view")) current.devView = true;
            if (hasAction("projectAuth:edit")) current.authEdit = true;
            if (hasAction("projectAuth:view")) current.authView = true;
            if (hasAction("projectReport:edit") || hasAction("projectReport:view")) current.report = true;
            nextProjectPermsMap[pid] = current;
          }
        }
      });
    });

    setPermissions(nextPerms);
    setProjectPermissionsMap(nextProjectPermsMap);
  }, [selectedUserId, permissionRecords, session.activePartnerId, isInviting]);

  const sortedUserList = useMemo(() => {
    const list = [...users];
    if (initialUserId) {
      const idx = list.findIndex(u => u.user.ownerId === initialUserId);
      if (idx > -1) {
        const [selected] = list.splice(idx, 1);
        list.unshift(selected);
      }
    }
    return list;
  }, [users, initialUserId]);

  const filteredUsers = useMemo(() => {
    if (!search) return sortedUserList;
    const lowerSearch = search.toLowerCase();
    return sortedUserList.filter(
      u => u.user.name.toLowerCase().includes(lowerSearch) || 
           u.user.email.toLowerCase().includes(lowerSearch)
    );
  }, [search, sortedUserList]);

  const handleSubmit = async () => {
    if (!selectedUserId && !isInviting) return;
    
    if (isInviting) {
      const errors: { email?: string } = {};
      if (!inviteEmail) errors.email = "Enter Email address";
      if (Object.keys(errors).length > 0) {
        setInviteError(errors);
        return;
      }
    }
    
    setIsSubmitting(true);
    try {
      if (onGrant) {
        const actions: string[] = [];
        if (permissions.orgEdit) actions.push("organization:edit");
        if (permissions.orgView) actions.push("organization:view");
        if (permissions.authPartnerEdit) actions.push("authorization:edit");
        if (permissions.authPartnerView) actions.push("authorization:view");
        if (permissions.prodEdit) actions.push("productDev:edit");
        if (permissions.prodView) actions.push("productDev:view");
        if (permissions.reportPartnerEdit) {
          actions.push("report:edit");
          actions.push("report:view");
        }
        
        // Project-level actions (from the representative focused project)
        const pPerms = focusedProjectId ? projectPermissionsMap[focusedProjectId] : null;
        if (pPerms) {
          if (pPerms.devEdit) actions.push("projectDev:edit");
          if (pPerms.devView) actions.push("projectDev:view");
          if (pPerms.authEdit) actions.push("projectAuth:edit");
          if (pPerms.authView) actions.push("projectAuth:view");
          if (pPerms.report) {
            actions.push("projectReport:edit");
            actions.push("projectReport:view");
          }
        }
        
        const projectIds = Object.keys(projectPermissionsMap);
        if (projectIds.length === 0) projectIds.push("*");
        
        if (selectedUserId) {
          await onGrant(selectedUserId, projectIds, actions);
        }
      }
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updatePerm = (key: keyof PermissionsState, val: boolean) => {
    setPermissions(prev => ({ ...prev, [key]: val }));
  };

  const toggleOrg = (orgId: string) => {
    setExpandedOrgs(prev => {
      const next = new Set(prev);
      if (next.has(orgId)) next.delete(orgId);
      else next.add(orgId);
      return next;
    });
  };

  const updateProjectPerm = (projectId: string, key: keyof ProjectPermissions, val: boolean) => {
    setProjectPermissionsMap(prev => ({
      ...prev,
      [projectId]: {
        ...(prev[projectId] || { ...initialProjectPermissions }),
        [key]: val
      }
    }));
  };

  const toggleProjectSelection = (projectId: string) => {
    setProjectPermissionsMap(prev => {
      const next = { ...prev };
      if (next[projectId]) {
        delete next[projectId];
      } else {
        next[projectId] = { ...initialProjectPermissions };
        setFocusedProjectId(projectId);
      }
      return next;
    });
  };

  const clearAllProjects = () => {
    setProjectPermissionsMap({});
    setFocusedProjectId(null);
    setApplyToAll(false);
  };

  const handleApplyToAllChange = (val: boolean) => {
    setApplyToAll(val);
    if (val) {
      const next: Record<string, ProjectPermissions> = {};
      projects.forEach(p => {
        next[p.uuid] = { ...initialProjectPermissions };
      });
      setProjectPermissionsMap(next);
    } else {
      setProjectPermissionsMap({});
    }
  };

  const focusedProject = useMemo(() => projects.find(p => p.uuid === focusedProjectId), [projects, focusedProjectId]);
  const focusedProjectOrg = useMemo(() => orgs.find(o => o.orgId === focusedProject?.orgId), [orgs, focusedProject]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4 transition-colors duration-500 font-sans">
      <div className="relative w-full max-w-[900px] h-[720px] max-h-[90vh] flex flex-col rounded-[12px] bg-surface border border-dialog-border animate-in fade-in zoom-in-95 duration-200 overflow-hidden text-[#1F244A]">
        
        {/* Header */}
        <div className="relative px-8 pt-8 pb-0 shrink-0 bg-surface">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {isInviting && (
                <button 
                  onClick={() => setIsInviting(false)}
                  className="p-1 rounded-full hover:bg-neutral-100 transition-colors"
                >
                  <ChevronLeft className="size-6 text-neutral-600" />
                </button>
              )}
              <div>
                <h2 className="text-[24px] font-bold tracking-tight font-heading">
                  {isInviting ? (
                    <>
                      <span className="text-neutral-600">Invite new user to </span>
                      <span className="text-primary-300">{session.activePartnerId || "Rogo"}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-neutral-600">Grant permission for user within </span>
                      <span className="text-primary-300">{session.activePartnerId || "Rogo"}</span>
                    </>
                  )}
                </h2>
                <p className="text-[14px] text-neutral-500 mt-1">Manage who has access to this organization and their roles.</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-neutral-400 hover:bg-surface-muted transition-colors -mt-1 -mr-1"
            >
              <X className="size-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-8 mt-6 border-b border-border">
            <button
              onClick={() => setActiveTab("partner")}
              className={cn(
                "pb-4 text-[16px] font-bold transition-all relative",
                activeTab === "partner" ? "text-primary-300" : "text-neutral-400 hover:text-neutral-600"
              )}
            >
              Partner Permission
              {activeTab === "partner" && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary-300" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("project")}
              className={cn(
                "pb-4 text-[16px] font-bold transition-all relative",
                activeTab === "project" ? "text-primary-300" : "text-neutral-400 hover:text-neutral-600"
              )}
            >
              Project Permission
              {activeTab === "project" && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary-300" />
              )}
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Users or Invite */}
          <div className="w-[280px] border-r border-border flex flex-col bg-surface shrink-0 p-6">
            {!isInviting ? (
              <>
                <div className="mb-5">
                  <SearchInput
                    placeholder="Search Username"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar mb-4">
                  {filteredUsers.map(({ user }: { user: UserPartner }) => {
                    const isSelected = selectedUserId === user.ownerId && !isInviting;
                    return (
                      <button
                        key={user.ownerId}
                        onClick={() => {
                          setSelectedUserId(user.ownerId);
                          setIsInviting(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 p-2 rounded-[8px] transition-all text-left self-stretch border",
                          isSelected
                            ? "bg-[#F3F4FF] border-[#3B4AD0]/20" 
                            : "bg-transparent border-transparent hover:bg-surface-muted"
                        )}
                      >
                        <Avatar name={user.name} email={user.email} className="size-11" />
                        <div className="overflow-hidden flex-1">
                          <p className={cn("text-[15px] font-bold truncate transition-colors", isSelected ? "text-[#3B4AD0]" : "text-foreground")}>{user.name}</p>
                          <p className="text-[12px] text-neutral-500 truncate mt-0.5">{user.email}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => {
                    setIsInviting(true);
                    setSelectedUserId(null);
                    setInviteError({});
                  }}
                  className="flex items-center gap-2.5 py-3 text-primary-300 hover:text-primary-400 transition-all font-bold text-[14px] font-heading mt-auto group"
                >
                  <Plus className="size-5 stroke-[3px] group-hover:scale-110 transition-transform" />
                  <span>{activeTab === "project" ? "Invite User to Project" : "Invite User to Partner"}</span>
                </button>
              </>
            ) : (
              <div className="space-y-7 animate-in slide-in-from-left-4 duration-300 flex-1 flex flex-col">
                <div className="space-y-2.5">
                  <label className="text-[14px] font-normal text-[#777] leading-[21px] font-sans">Email Address (*)</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-5 text-[#3B4AD0]" />
                    <input
                      type="email"
                      placeholder="jane@company.com"
                      value={inviteEmail}
                      onChange={(e) => {
                        setInviteEmail(e.target.value);
                        if (e.target.value) setInviteError(prev => ({ ...prev, email: undefined }));
                      }}
                      className={cn(
                        "w-full h-[48px] pl-11 pr-4 rounded-[10px] border border-border bg-surface text-[15px] outline-none focus:border-primary-300 focus:ring-4 focus:ring-primary-100/20 transition-all",
                        inviteError.email && "border-red-500 focus:border-red-500 focus:ring-red-100/10"
                      )}
                    />
                  </div>
                  {inviteError.email && <p className="text-[14px] text-red-500 font-bold mt-1.5 transition-all">Enter Email address</p>}
                </div>

                <div className="space-y-2.5">
                  <label className="text-[14px] font-normal text-[#777] leading-[21px] font-sans">Username</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-5 text-[#3B4AD0]" />
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      value={inviteUsername}
                      onChange={(e) => setInviteUsername(e.target.value)}
                      className="w-full h-[48px] pl-11 pr-4 rounded-[10px] border border-border bg-surface text-[15px] outline-none focus:border-primary-300 focus:ring-4 focus:ring-primary-100/20 transition-all"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Area: Content (Middle + Right columns if Project Tab) */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 flex overflow-hidden">
              {(!selectedUserId && !isInviting) ? (
                <div className="flex-1 flex flex-col items-center justify-center text-neutral-400 bg-white">
                  <p>Select a user or invite new one to assign permissions</p>
                </div>
              ) : activeTab === "partner" ? (
                /* Partner Permission Detail */
                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-white">
                  <div className="space-y-8">
                    <div className="space-y-4">                      <h6 className="text-[14px] font-medium text-[#3B4AD0]">(Optional) Role to Organization (Org):</h6>
                      <div className="flex gap-6">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <CheckboxInput checked={permissions.orgEdit} onChange={() => updatePerm("orgEdit", !permissions.orgEdit)} />
                          <span className="text-[14px] text-neutral-800 group-hover:text-primary-300 transition-colors">Organization Edit (Create/ Edit/ Delete)</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <CheckboxInput checked={permissions.orgView} onChange={() => updatePerm("orgView", !permissions.orgView)} />
                          <span className="text-[14px] text-neutral-800 group-hover:text-primary-300 transition-colors">View Organization</span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h6 className="text-[14px] font-medium text-[#3B4AD0]">(Optional) Project Management (Manage all Projects):</h6>
                      <div className="flex gap-6">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <CheckboxInput checked={permissions.mqttEdit} onChange={() => updatePerm("mqttEdit", !permissions.mqttEdit)} />
                          <span className="text-[14px] text-neutral-800 group-hover:text-primary-300 transition-colors">Project Edit (Create/ Edit/ Delete)</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <CheckboxInput checked={permissions.mqttView} onChange={() => updatePerm("mqttView", !permissions.mqttView)} />
                          <span className="text-[14px] text-neutral-800 group-hover:text-primary-300 transition-colors">View Project</span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h6 className="text-[14px] font-medium text-[#3B4AD0]">(Optional) IOT Product Development:</h6>
                      <div className="flex gap-6">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <CheckboxInput checked={permissions.prodEdit} onChange={() => updatePerm("prodEdit", !permissions.prodEdit)} />
                          <span className="text-[14px] text-neutral-800 group-hover:text-primary-300 transition-colors">Product Edit (Create/ Edit/ Delete)</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <CheckboxInput checked={permissions.prodView} onChange={() => updatePerm("prodView", !permissions.prodView)} />
                          <span className="text-[14px] text-neutral-800 group-hover:text-primary-300 transition-colors">Product View</span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h6 className="text-[14px] font-medium text-[#3B4AD0]">(Optional) Authorization for Users:</h6>
                      <div className="flex gap-6">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <CheckboxInput checked={permissions.authPartnerEdit} onChange={() => updatePerm("authPartnerEdit", !permissions.authPartnerEdit)} />
                          <span className="text-[14px] text-neutral-800 group-hover:text-primary-300 transition-colors">Authorization Edit (Create/ Edit/ Delete)</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <CheckboxInput checked={permissions.authPartnerView} onChange={() => updatePerm("authPartnerView", !permissions.authPartnerView)} />
                          <span className="text-[14px] text-neutral-800 group-hover:text-primary-300 transition-colors">Authorization View</span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h6 className="text-[14px] font-medium text-[#3B4AD0]">(Optional) Role to Report:</h6>
                      <div className="flex gap-6">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <CheckboxInput checked={permissions.reportPartnerEdit} onChange={() => updatePerm("reportPartnerEdit", !permissions.reportPartnerEdit)} />
                          <span className="text-[14px] text-neutral-800 group-hover:text-primary-300 transition-colors">Report Device Activations</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Project Permission Layout (Middle + Right) */
                <div className="flex-1 flex overflow-hidden divide-x divide-border">
                  {/* Middle: Access Scope Tree */}
                  <div className="w-[280px] flex flex-col bg-surface shrink-0 p-6 overflow-hidden">
                    <h4 className="text-[12px] font-bold text-neutral-400 uppercase tracking-widest mb-6">ORGANIZATION & PROJECT</h4>
                    <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1 mb-4">
                      {orgs.map(org => (
                        <div key={org.orgId} className="space-y-1">
                          <button
                            onClick={() => toggleOrg(org.orgId)}
                            className="w-full flex items-center gap-2 py-1.5 px-2 hover:bg-neutral-50 rounded-md transition-colors text-left"
                          >
                            {expandedOrgs.has(org.orgId) ? <ChevronDown className="size-3.5 text-neutral-400" /> : <ChevronRight className="size-3.5" />}
                            <Building2 className="size-4 text-neutral-500" />
                            <span className="text-[12px] font-bold text-neutral-600 truncate">{org.name}</span>
                          </button>
                          
                          {expandedOrgs.has(org.orgId) && (
                            <div className="pl-6 space-y-1">
                              {(groupedProjects[org.orgId] || []).map(p => (
                                <div
                                  key={p.uuid}
                                  onClick={() => setFocusedProjectId(p.uuid)}
                                  className={cn(
                                    "group flex items-center justify-between py-1.5 pl-2 pr-1 rounded-md cursor-pointer transition-all relative",
                                    focusedProjectId === p.uuid ? "bg-primary-100/20" : "hover:bg-surface-muted"
                                  )}
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <CheckboxInput 
                                      checked={!!projectPermissionsMap[p.uuid]} 
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        toggleProjectSelection(p.uuid);
                                      }}
                                    />
                                    <span className={cn(
                                      "text-[14px] truncate transition-colors",
                                      focusedProjectId === p.uuid ? "text-[#3B4AD0] font-bold" : "text-neutral-500"
                                    )}>
                                      {p.name}
                                    </span>
                                  </div>
                                  {focusedProjectId === p.uuid && (
                                    <div className="absolute right-0 top-1 bottom-1 w-1 bg-[#3B4AD0] rounded-l-full" />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {/* Standalone Projects */}
                      {groupedProjects["standalone"]?.length > 0 && (
                        <div className="space-y-1 pt-2">
                          <div className="flex items-center gap-2 py-1.5 px-2 text-neutral-400">
                            <FolderIcon className="size-4" />
                            <span className="text-[12px] font-bold uppercase tracking-wider">No Organization</span>
                          </div>
                          {groupedProjects["standalone"].map(p => (
                            <div
                              key={p.uuid}
                              onClick={() => setFocusedProjectId(p.uuid)}
                              className={cn(
                                "group flex items-center justify-between py-1.5 pl-2 pr-1 rounded-md cursor-pointer transition-all relative",
                                focusedProjectId === p.uuid ? "bg-primary-100/20" : "hover:bg-surface-muted"
                              )}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <CheckboxInput 
                                  checked={!!projectPermissionsMap[p.uuid]} 
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    toggleProjectSelection(p.uuid);
                                  }}
                                />
                                <span className={cn(
                                  "text-[14px] truncate transition-colors",
                                  focusedProjectId === p.uuid ? "text-[#3B4AD0] font-bold" : "text-neutral-500"
                                )}>
                                  {p.name}
                                </span>
                              </div>
                              {focusedProjectId === p.uuid && (
                                <div className="absolute right-0 top-1 bottom-1 w-1 bg-[#3B4AD0] rounded-l-full" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-border mt-auto">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <CheckboxInput checked={applyToAll} onChange={() => handleApplyToAllChange(!applyToAll)} />
                        <span className="text-[12px] font-bold text-neutral-600 group-hover:text-primary-300 transition-colors">Apply user to all Projects</span>
                      </label>
                    </div>
                  </div>

                  {/* Right: Permission Detail */}
                  <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-white text-[14px]">
                    {focusedProject ? (
                      <div className="space-y-6">
                        <div>                          <h3 className="text-[16px] font-bold text-neutral-500 font-heading">
                            {focusedProjectOrg?.name || "No Organization"} / <span className="text-primary-300">{focusedProject.name}</span>
                          </h3>
                        </div>

                        <div className="space-y-6">
                          <div className="space-y-3">
                            <h6 className="text-[14px] font-medium text-[#3B4AD0]">(Optional) Project Development</h6>
                            <div className="flex flex-col gap-3">
                              <label className="flex items-center gap-3 cursor-pointer group w-fit">
                                <CheckboxInput 
                                  checked={projectPermissionsMap[focusedProjectId!]?.devEdit || false} 
                                  onChange={() => updateProjectPerm(focusedProjectId!, "devEdit", !projectPermissionsMap[focusedProjectId!]?.devEdit)} 
                                />
                                <span className="text-[14px] text-neutral-800 group-hover:text-primary-300 transition-colors">Project Development Edit (Create/ Edit/ Delete)</span>
                              </label>
                              <label className="flex items-center gap-3 cursor-pointer group w-fit">
                                <CheckboxInput 
                                  checked={projectPermissionsMap[focusedProjectId!]?.devView || false} 
                                  onChange={() => updateProjectPerm(focusedProjectId!, "devView", !projectPermissionsMap[focusedProjectId!]?.devView)} 
                              />
                                <span className="text-[14px] text-neutral-800 group-hover:text-primary-300 transition-colors">Project Development View</span>
                              </label>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h6 className="text-[14px] font-medium text-[#3B4AD0]">(Optional) Project Authorization:</h6>
                            <div className="flex flex-col gap-3">
                              <label className="flex items-center gap-3 cursor-pointer group w-fit">
                                <CheckboxInput 
                                  checked={projectPermissionsMap[focusedProjectId!]?.authEdit || false} 
                                  onChange={() => updateProjectPerm(focusedProjectId!, "authEdit", !projectPermissionsMap[focusedProjectId!]?.authEdit)} 
                                />
                                <span className="text-[14px] text-neutral-800 group-hover:text-primary-300 transition-colors">Project Authorization Edit (Create/ Edit/ Delete)</span>
                              </label>
                              <label className="flex items-center gap-3 cursor-pointer group w-fit">
                                <CheckboxInput 
                                  checked={projectPermissionsMap[focusedProjectId!]?.authView || false} 
                                  onChange={() => updateProjectPerm(focusedProjectId!, "authView", !projectPermissionsMap[focusedProjectId!]?.authView)} 
                                />
                                <span className="text-[14px] text-neutral-800 group-hover:text-primary-300 transition-colors">Project Authorization View</span>
                              </label>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h6 className="text-[14px] font-medium text-[#3B4AD0]">(Optional) Project Report:</h6>
                            <div className="flex flex-col gap-3">
                              <label className="flex items-center gap-3 cursor-pointer group w-fit">
                                <CheckboxInput 
                                  checked={projectPermissionsMap[focusedProjectId!]?.report || false} 
                                  onChange={() => updateProjectPerm(focusedProjectId!, "report", !projectPermissionsMap[focusedProjectId!]?.report)} 
                                />
                                <span className="text-[14px] text-neutral-800 group-hover:text-primary-300 transition-colors">Report Project</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-neutral-400">
                        <p className="text-[14px] font-medium text-center">Select a project from the access scope<br/>to configure permissions</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Selection Summary Bar */}
            {activeTab === "project" && numSelectedProjects > 0 && (
              <div className="mx-4 mb-4 h-[56px] bg-[#FFF1F3] border-l-[4px] border-primary-300 rounded-[8px] flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-3 text-[#1F244A]">
                    <LayoutGrid className="size-5 text-[#3B4AD0]" />
                    <span className="text-[12px] font-bold">{numSelectedProjects} Projects Selected</span>
                  </div>
                  <p className="text-[13px] text-neutral-500 font-medium">Permissions above will apply to all selected projects</p>
                </div>
                <button 
                  onClick={clearAllProjects}
                  className="text-primary-300 font-bold text-[12px] hover:text-primary-400 transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex justify-end gap-3 shrink-0 bg-surface">
          <button
            onClick={onClose}
            className="h-[44px] px-8 rounded-full border border-border text-neutral-600 font-bold hover:bg-neutral-50 transition-all"
          >
            Close
          </button>
          <PrimaryButton
            onClick={handleSubmit}
            disabled={(!selectedUserId && !isInviting) || isSubmitting}
            className="h-[44px] px-10 bg-primary-300 hover:bg-primary-400 text-white font-bold rounded-full"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
