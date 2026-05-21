"use client";
import { useState, useMemo, useEffect } from "react";
import { X } from "lucide-react";
import { usePartnerContext } from "@/lib/hooks/usePartnerContext";
import type { UserWithNumProject, PermissionRecord, UserPartner } from "@/lib/types/partner";
import { Avatar } from "@/lib/components/ui/avatar";
import { CheckboxInput, PrimaryButton, SecondaryButton, SearchInput } from "@/features/shared/ui";
import { cn } from "@/lib/utils/cn";

interface GrantAccessDialogProps {
  open: boolean;
  onClose: () => void;
  users: UserWithNumProject[];
  permissionRecords?: PermissionRecord[];
  initialUserId?: string | null;
  onGrant?: (userId: string, projectIds: string[], permissions: string[]) => Promise<void>;
}

export function GrantAccessDialog({
  open,
  onClose,
  users,
  permissionRecords = [],
  initialUserId = null,
  onGrant
}: GrantAccessDialogProps) {
  const { session } = usePartnerContext();
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(initialUserId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Project Permissions
  const [permDevEdit, setPermDevEdit] = useState(false);
  const [permDevView, setPermDevView] = useState(false);
  const [permAuthEdit, setPermAuthEdit] = useState(false);
  const [permAuthView, setPermAuthView] = useState(false);
  const [permReportEdit, setPermReportEdit] = useState(false);
  const [permReportView, setPermReportView] = useState(false);
  const [permMqttEdit, setPermMqttEdit] = useState(false);
  const [permMqttView, setPermMqttView] = useState(false);

  // Partner Permissions
  const [permOrgEdit, setPermOrgEdit] = useState(false);
  const [permOrgView, setPermOrgView] = useState(false);
  const [permAuthPartnerEdit, setPermAuthPartnerEdit] = useState(false);
  const [permAuthPartnerView, setPermAuthPartnerView] = useState(false);
  const [permProdEdit, setPermProdEdit] = useState(false);
  const [permProdView, setPermProdView] = useState(false);
  const [permReportPartnerEdit, setPermReportPartnerEdit] = useState(false);
  const [permReportPartnerView, setPermReportPartnerView] = useState(false);

  // Sync selectedUserId with initialUserId when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedUserId(initialUserId);
      setSearch("");
    }
  }, [open, initialUserId]);

  // Load existing permissions when selectedUserId changes
  useEffect(() => {
    if (!selectedUserId) {
      const reset = (val: boolean) => {
        setPermDevEdit(val); setPermDevView(val); setPermAuthEdit(val); setPermAuthView(val);
        setPermReportEdit(val); setPermReportView(val); setPermMqttEdit(val); setPermMqttView(val);
        setPermOrgEdit(val); setPermOrgView(val); setPermAuthPartnerEdit(val); setPermAuthPartnerView(val);
        setPermProdEdit(val); setPermProdView(val); setPermReportPartnerEdit(val); setPermReportPartnerView(val);
      };
      reset(false);
      return;
    }

    const record = permissionRecords.find(r => r.ownerId === selectedUserId);
    if (!record || !record.abac) {
      const reset = (val: boolean) => {
        setPermDevEdit(val); setPermDevView(val); setPermAuthEdit(val); setPermAuthView(val);
        setPermReportEdit(val); setPermReportView(val); setPermMqttEdit(val); setPermMqttView(val);
        setPermOrgEdit(val); setPermOrgView(val); setPermAuthPartnerEdit(val); setPermAuthPartnerView(val);
        setPermProdEdit(val); setPermProdView(val); setPermReportPartnerEdit(val); setPermReportPartnerView(val);
      };
      reset(false);
      return;
    }

    let devEdit = false; let devView = false;
    let authEdit = false; let authView = false;
    let reportEdit = false; let reportView = false;
    let mqttEdit = false; let mqttView = false;
    let orgEdit = false; let orgView = false;
    let authPartnerEdit = false; let authPartnerView = false;
    let prodEdit = false; let prodView = false;
    let reportPartnerEdit = false; let reportPartnerView = false;

    record.abac.forEach(entry => {
      const hasAction = (action: string) => entry.actions.some(a => a === action || a === "*");
      
      if (hasAction("projectDev:edit")) devEdit = true;
      if (hasAction("projectDev:view")) devView = true;
      if (hasAction("projectAuth:edit")) authEdit = true;
      if (hasAction("projectAuth:view")) authView = true;
      if (hasAction("projectReport:edit")) reportEdit = true;
      if (hasAction("projectReport:view")) reportView = true;
      if (hasAction("projectMgmt:edit")) mqttEdit = true;
      if (hasAction("projectMgmt:view")) mqttView = true;

      if (hasAction("organization:edit")) orgEdit = true;
      if (hasAction("organization:view")) orgView = true;
      if (hasAction("authorization:edit")) authPartnerEdit = true;
      if (hasAction("authorization:view")) authPartnerView = true;
      if (hasAction("productDev:edit")) prodEdit = true;
      if (hasAction("productDev:view")) prodView = true;
      if (hasAction("report:edit")) reportPartnerEdit = true;
      if (hasAction("report:view")) reportPartnerView = true;
    });

    setPermDevEdit(devEdit); setPermDevView(devView);
    setPermAuthEdit(authEdit); setPermAuthView(authView);
    setPermReportEdit(reportEdit); setPermReportView(reportView);
    setPermMqttEdit(mqttEdit); setPermMqttView(mqttView);
    setPermOrgEdit(orgEdit); setPermOrgView(orgView);
    setPermAuthPartnerEdit(authPartnerEdit); setPermAuthPartnerView(authPartnerView);
    setPermProdEdit(prodEdit); setPermProdView(prodView);
    setPermReportPartnerEdit(reportPartnerEdit); setPermReportPartnerView(reportPartnerView);

  }, [selectedUserId, permissionRecords]);

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
    if (!selectedUserId) return;
    setIsSubmitting(true);
    try {
      if (onGrant) {
        const permissions: string[] = [];
        // Project
        if (permDevEdit) permissions.push("projectDev:edit");
        if (permDevView) permissions.push("projectDev:view");
        if (permAuthEdit) permissions.push("projectAuth:edit");
        if (permAuthView) permissions.push("projectAuth:view");
        if (permReportEdit) permissions.push("projectReport:edit");
        if (permReportView) permissions.push("projectReport:view");
        if (permMqttEdit) permissions.push("projectMgmt:edit");
        if (permMqttView) permissions.push("projectMgmt:view");

        // Partner
        if (permOrgEdit) permissions.push("organization:edit");
        if (permOrgView) permissions.push("organization:view");
        if (permAuthPartnerEdit) permissions.push("authorization:edit");
        if (permAuthPartnerView) permissions.push("authorization:view");
        if (permProdEdit) permissions.push("productDev:edit");
        if (permProdView) permissions.push("productDev:view");
        if (permReportPartnerEdit) permissions.push("report:edit");
        if (permReportPartnerView) permissions.push("report:view");
        
        await onGrant(selectedUserId, ["*"], permissions);
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4 transition-colors duration-500">
      <div className="relative w-full max-w-[800px] h-[600px] flex flex-col rounded-[var(--Radius-6,12px)] bg-surface border border-dialog-border animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Header */}
        <div className="relative px-8 py-[var(--Spacing-5,20px)] border-b border-border shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h5 className="text-[24px] font-bold tracking-tight font-heading">
                  <span className="text-neutral-800">Give permission within </span>
                  <span className="text-primary-300">{session.activePartnerId || "ROGO"}</span>
                </h5>
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
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
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
              {filteredUsers.map(({ user }: { user: UserPartner }) => (
                <button
                  key={user.ownerId}
                  onClick={() => setSelectedUserId(user.ownerId)}
                  className={cn(
                    "w-full flex items-center gap-3 p-1 rounded-[8px] transition-all text-left self-stretch",
                    selectedUserId === user.ownerId 
                      ? "bg-primary-100/20" 
                      : "hover:bg-surface-muted"
                  )}
                >
                  <Avatar name={user.name} email={user.email} className="size-10" />
                  <div className="overflow-hidden flex-1">
                    <p className={cn(
                      "text-[14px] font-bold truncate leading-[21px] font-sans text-foreground", 
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
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            {!selectedUserId ? (
              <div className="h-full flex flex-col items-center justify-center text-neutral-400">
                <p>Select a user to assign permissions</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Project Permissions */}
                <div className="space-y-6">
                  <h4 className="text-[16px] font-bold text-neutral-800 uppercase tracking-tight">Project Access</h4>
                  
                  <div className="space-y-4">
                    <h6 className="text-[14px] font-medium text-neutral-600">(Optional) Project Development</h6>
                    <div className="flex gap-8 pl-1">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <CheckboxInput checked={permDevEdit} onChange={() => setPermDevEdit(!permDevEdit)} />
                        <span className="text-[14px] text-neutral-600 dark:text-neutral-400">Edit</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <CheckboxInput checked={permDevView} onChange={() => setPermDevView(!permDevView)} />
                        <span className="text-[14px] text-neutral-600 dark:text-neutral-400">View</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h6 className="text-[14px] font-medium text-neutral-600">(Optional) Project Authorization</h6>
                    <div className="flex gap-8 pl-1">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <CheckboxInput checked={permAuthEdit} onChange={() => setPermAuthEdit(!permAuthEdit)} />
                        <span className="text-[14px] text-neutral-600 dark:text-neutral-400">Edit</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <CheckboxInput checked={permAuthView} onChange={() => setPermAuthView(!permAuthView)} />
                        <span className="text-[14px] text-neutral-600 dark:text-neutral-400">View</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h6 className="text-[14px] font-medium text-neutral-600">(Optional) Project MQTT</h6>
                    <div className="flex gap-8 pl-1">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <CheckboxInput checked={permMqttEdit} onChange={() => setPermMqttEdit(!permMqttEdit)} />
                        <span className="text-[14px] text-neutral-600 dark:text-neutral-400">Edit</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <CheckboxInput checked={permMqttView} onChange={() => setPermMqttView(!permMqttView)} />
                        <span className="text-[14px] text-neutral-600 dark:text-neutral-400">View</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h6 className="text-[14px] font-medium text-neutral-600">(Optional) Project Report</h6>
                    <div className="flex gap-8 pl-1">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <CheckboxInput checked={permReportEdit} onChange={() => setPermReportEdit(!permReportEdit)} />
                        <span className="text-[14px] text-neutral-600 dark:text-neutral-400">Edit</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <CheckboxInput checked={permReportView} onChange={() => setPermReportView(!permReportView)} />
                        <span className="text-[14px] text-neutral-600 dark:text-neutral-400">View</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="w-full h-px bg-border border-t border-dashed" />

                {/* Partner Permissions */}
                <div className="space-y-6">
                  <h4 className="text-[16px] font-bold text-neutral-800 uppercase tracking-tight">Partner Access</h4>

                  <div className="space-y-4">
                    <h6 className="text-[14px] font-medium text-neutral-600">(Optional) Organization</h6>
                    <div className="flex gap-8 pl-1">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <CheckboxInput checked={permOrgEdit} onChange={() => setPermOrgEdit(!permOrgEdit)} />
                        <span className="text-[14px] text-neutral-600 dark:text-neutral-400">Edit</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <CheckboxInput checked={permOrgView} onChange={() => setPermOrgView(!permOrgView)} />
                        <span className="text-[14px] text-neutral-600 dark:text-neutral-400">View</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h6 className="text-[14px] font-medium text-neutral-600">(Optional) Authorization</h6>
                    <div className="flex gap-8 pl-1">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <CheckboxInput checked={permAuthPartnerEdit} onChange={() => setPermAuthPartnerEdit(!permAuthPartnerEdit)} />
                        <span className="text-[14px] text-neutral-600 dark:text-neutral-400">Edit</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <CheckboxInput checked={permAuthPartnerView} onChange={() => setPermAuthPartnerView(!permAuthPartnerView)} />
                        <span className="text-[14px] text-neutral-600 dark:text-neutral-400">View</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h6 className="text-[14px] font-medium text-neutral-600">(Optional) Product</h6>
                    <div className="flex gap-8 pl-1">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <CheckboxInput checked={permProdEdit} onChange={() => setPermProdEdit(!permProdEdit)} />
                        <span className="text-[14px] text-neutral-600 dark:text-neutral-400">Edit</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <CheckboxInput checked={permProdView} onChange={() => setPermProdView(!permProdView)} />
                        <span className="text-[14px] text-neutral-600 dark:text-neutral-400">View</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h6 className="text-[14px] font-medium text-neutral-600">(Optional) Report</h6>
                    <div className="flex gap-8 pl-1">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <CheckboxInput checked={permReportPartnerEdit} onChange={() => setPermReportPartnerEdit(!permReportPartnerEdit)} />
                        <span className="text-[14px] text-neutral-600 dark:text-neutral-400">Edit</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <CheckboxInput checked={permReportPartnerView} onChange={() => setPermReportPartnerView(!permReportPartnerView)} />
                        <span className="text-[14px] text-neutral-600 dark:text-neutral-400">View</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex justify-end gap-3 shrink-0 bg-surface rounded-b-[var(--Radius-6,12px)]">
          <SecondaryButton onClick={onClose} className="px-6">
            Close
          </SecondaryButton>
          <PrimaryButton onClick={handleSubmit} disabled={!selectedUserId || isSubmitting} className="px-8">
            Save
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
