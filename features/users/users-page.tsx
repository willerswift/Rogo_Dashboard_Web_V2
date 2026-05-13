"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { Plus, UserPlus, Trash2 } from "lucide-react";

import { attachUserToProject, listProjects } from "@/lib/api/project";
import { syncSession } from "@/lib/api/auth";
import { checkUserExists, listOrganizations } from "@/lib/api/organization";
import { addPartnerUser, deletePartnerUser, listPartnerUsers } from "@/lib/api/user";
import { listPermissionRecords } from "@/lib/api/permission";
import { usePartnerContext } from "@/lib/hooks/usePartnerContext";
import { usePermission } from "@/lib/hooks/usePermission";
import type { PermissionRecord, Project, UserWithNumProject, OrgWithOwner } from "@/lib/types/partner";
import {
  Field,
  LoadingBlock,
  Modal,
  PrimaryButton,
  SecondaryButton,
  SelectInput,
  TextInput,
} from "@/features/shared/ui";
import { DataTable, type DataTableColumn } from "@/lib/components/DataTable";
import { Avatar } from "@/lib/components/ui/avatar";
import { cn } from "@/lib/utils/cn";

const addUserSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  projectId: z.string().min(1, "Project is required."),
});

const attachUserSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  projectId: z.string().min(1, "Project is required."),
});

type AddUserValues = z.infer<typeof addUserSchema>;
type AttachUserValues = z.infer<typeof attachUserSchema>;

export function UsersPage() {
  const { session, setSession } = usePartnerContext();
  const searchParams = useSearchParams();
  const orgId = searchParams.get("orgId");
  const projectId = searchParams.get("projectId");

  const canAddUser = usePermission("projectAuth:edit");
  const canDelete = usePermission("authorization:edit");
  const partnerId = session.activePartnerId;

  const [users, setUsers] = useState<UserWithNumProject[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [orgs, setOrgs] = useState<OrgWithOwner[]>([]);
  const [permissionRecords, setPermissionRecords] = useState<PermissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showAttach, setShowAttach] = useState(false);

  const activeOrg = useMemo(() => orgs.find(o => o.orgId === orgId), [orgs, orgId]);
  const activeProject = useMemo(() => projects.find(p => p.uuid === projectId), [projects, projectId]);

  const addUserForm = useForm<AddUserValues>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      projectId: "",
    },
  });

  const attachUserForm = useForm<AttachUserValues>({
    resolver: zodResolver(attachUserSchema),
    defaultValues: {
      email: "",
      projectId: "",
    },
  });

  const loadData = useCallback(async () => {
    if (!partnerId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [nextUsers, nextProjects, nextOrgs, nextPermissions] = await Promise.all([
        listPartnerUsers(partnerId),
        listProjects(partnerId),
        listOrganizations(partnerId),
        listPermissionRecords(partnerId),
      ]);
      setUsers(nextUsers);
      setProjects(nextProjects);
      setOrgs(nextOrgs);
      setPermissionRecords(nextPermissions);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load users data.");
    } finally {
      setLoading(false);
    }
  }, [partnerId]);

  useEffect(() => {
    const run = async () => {
      await Promise.resolve();
      void loadData();
    };
    void run();
  }, [loadData]);

  const handleAddUser = addUserForm.handleSubmit(async (values) => {
    if (!partnerId) {
      return;
    }

    try {
      await addPartnerUser({
        partnerId,
        name: values.name,
        email: values.email,
        password: values.password,
        projectId: values.projectId,
      });
      toast.success("User created.");
      addUserForm.reset();
      setShowCreate(false);
      await loadData();
      const { session: refreshed } = await syncSession();
      setSession(refreshed);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create partner user.");
    }
  });

  const handleDeleteUser = async (uuid: string) => {
    if (!partnerId || !window.confirm(`Delete partner user?`)) {
      return;
    }

    try {
      await deletePartnerUser({ partnerId, uuid });
      toast.success("User deleted.");
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete user.");
    }
  };

  const handleAttachUser = attachUserForm.handleSubmit(async (values) => {
    if (!partnerId) {
      return;
    }

    const project = projects.find((entry) => entry.uuid === values.projectId);

    if (!project?.orgId) {
      toast.error("The selected project does not expose an orgId, so attach cannot be verified.");
      return;
    }

    try {
      const user = await checkUserExists({
        email: values.email,
        partnerId,
        projectId: values.projectId,
      });

      await attachUserToProject({
        partnerId,
        orgId: project.orgId,
        projectId: values.projectId,
        userId: user.ownerId,
      });

      toast.success("User attached to project.");
      attachUserForm.reset();
      setShowAttach(false);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to attach user to project.");
    }
  });

  const columns: DataTableColumn<UserWithNumProject>[] = [
    {
      id: "user",
      header: "USER",
      headerClassName: "text-[11px] font-bold text-neutral-400 uppercase tracking-wider",
      cell: ({ user }) => (
        <div className="flex items-center gap-3">
          <Avatar name={user.name} email={user.email} />
          <div className="flex flex-col">
            <span className="text-[14px] font-bold text-neutral-900 leading-tight">{user.name}</span>
            <span className="text-[12px] text-neutral-500 leading-tight mt-0.5">{user.email}</span>
          </div>
        </div>
      ),
    },
    {
      id: "permissions",
      header: "PERMISSION",
      headerClassName: "text-[11px] font-bold text-neutral-400 uppercase tracking-wider",
      cell: ({ user }) => {
        const record = permissionRecords.find(r => r.ownerId === user.ownerId);
        if (!record || !record.abac || !record.abac.length) return <span className="text-neutral-300 text-[12px] italic">No permissions</span>;
        
        // 1. Mapping for short resource names - Distinguish between global and project resources
        const resMap: Record<string, string> = {
          "organization": "ORG",
          "authorization": "AUTH",
          "projectAuth": "PRJ AUTH",
          "projectMgmt": "PRJ MQTT",
          "productDev": "PROD",
          "projectDev": "PRJ PROD",
          "report": "REPORT",
          "projectReport": "PRJ REPORT",
        };

        // 2. Extract and group by SHORT NAME to prevent duplicates (e.g., authorization & projectAuth both map to AUTH)
        const rawActions = record.abac.flatMap(entry => entry.actions);
        const uniqueRawActions = Array.from(new Set(rawActions.map(a => a.trim()))).filter(Boolean);

        if (uniqueRawActions.includes("*")) {
          return <PermissionBadge label="ADMIN" isAdmin />;
        }

        const shortNameGroups: Record<string, Set<string>> = {};
        uniqueRawActions.forEach(action => {
          const [resource, act] = action.split(":");
          const shortName = resMap[resource] || resource.toUpperCase();
          const effectiveAction = act || "*";
          
          if (!shortNameGroups[shortName]) shortNameGroups[shortName] = new Set();
          shortNameGroups[shortName].add(effectiveAction);
        });

        // 3. Apply priority logic per SHORT NAME: * or edit -> EDIT badge, view -> VIEW badge
        const finalBadges: { label: string; isAdmin: boolean }[] = [];
        Object.entries(shortNameGroups).forEach(([shortName, acts]) => {
          const hasFullAccess = acts.has("*") || acts.has("edit");
          const hasViewAccess = acts.has("view");

          if (hasFullAccess) {
            finalBadges.push({ label: `${shortName} EDIT`, isAdmin: true });
          } else if (hasViewAccess) {
            finalBadges.push({ label: `${shortName} VIEW`, isAdmin: false });
          }
        });
        
        return (
          <div className="flex flex-wrap gap-1.5">
            {finalBadges.sort((a, b) => a.label.localeCompare(b.label)).map(badge => (
              <PermissionBadge key={badge.label} label={badge.label} isAdmin={badge.isAdmin} />
            ))}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "",
      className: "text-right",
      cell: ({ user }) => (
        <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
          {canDelete ? (
            <button
              onClick={() => void handleDeleteUser(user.uuid)}
              className="p-2 text-neutral-400 hover:text-red-500 transition-colors"
              title="Remove user"
            >
              <Trash2 className="size-4" />
            </button>
          ) : null}
        </div>
      ),
    },
  ];

  const pageTitle = useMemo(() => {
    if (activeProject) return `${activeOrg?.name || "Organization"} / ${activeProject.name}`;
    if (activeOrg) return activeOrg.name;
    return "Partner Users";
  }, [activeOrg, activeProject]);

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-neutral-900 tracking-tight font-heading">
            {pageTitle}
            {projectId && (
              <span className="ml-2 inline-flex items-center rounded-full bg-primary-100/50 px-2 py-0.5 text-[10px] font-bold text-primary-300 font-sans">
                ID: {projectId.slice(0, 8)}
              </span>
            )}
          </h1>
          <p className="text-[13px] text-neutral-500 mt-0.5">Users with access to this {activeProject ? "project" : activeOrg ? "organization" : "partner"}.</p>
        </div>

        {canAddUser && (
          <div className="flex items-center gap-2">
            <SecondaryButton 
              type="button" 
              onClick={() => setShowAttach(true)}
              className="border-neutral-200 hover:border-neutral-300 shadow-sm"
            >
              <Plus className="size-4" />
              Attach existing
            </SecondaryButton>
            <PrimaryButton 
              type="button" 
              onClick={() => setShowCreate(true)}
              className="shadow-md shadow-primary-300/20"
            >
              <UserPlus className="size-4" />
              Add user
            </PrimaryButton>
          </div>
        )}
      </div>

      {loading ? (
        <LoadingBlock label="Loading users..." />
      ) : (
        <DataTable
          title="Users with access"
          columns={columns}
          data={users}
          emptyTitle="No users found"
          emptyDescription="Add or attach a user to grant them access."
        />
      )}

      <Modal
        open={showCreate}
        onClose={() => { setShowCreate(false); addUserForm.reset(); }}
        title="Add user to partner"
      >
        <form className="grid gap-5 md:grid-cols-2" onSubmit={handleAddUser}>
          <Field label="Name" error={addUserForm.formState.errors.name?.message}>
            <TextInput invalid={Boolean(addUserForm.formState.errors.name)} {...addUserForm.register("name")} placeholder="Full name" />
          </Field>
          <Field label="Email" error={addUserForm.formState.errors.email?.message}>
            <TextInput type="email" invalid={Boolean(addUserForm.formState.errors.email)} {...addUserForm.register("email")} placeholder="email@example.com" />
          </Field>
          <Field label="Temporary password" error={addUserForm.formState.errors.password?.message}>
            <TextInput type="password" invalid={Boolean(addUserForm.formState.errors.password)} {...addUserForm.register("password")} placeholder="••••••••" />
          </Field>
          <Field label="Initial Project" error={addUserForm.formState.errors.projectId?.message}>
            <SelectInput invalid={Boolean(addUserForm.formState.errors.projectId)} {...addUserForm.register("projectId")}>
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project.uuid} value={project.uuid}>
                  {project.name}
                </option>
              ))}
            </SelectInput>
          </Field>
          <div className="md:col-span-2 flex justify-end gap-3 mt-4">
            <SecondaryButton type="button" onClick={() => { setShowCreate(false); addUserForm.reset(); }}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" loading={addUserForm.formState.isSubmitting}>
              Create user
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      <Modal
        open={showAttach}
        onClose={() => { setShowAttach(false); attachUserForm.reset(); }}
        title="Attach existing user"
      >
        <form className="space-y-5" onSubmit={handleAttachUser}>
          <Field label="User email" error={attachUserForm.formState.errors.email?.message}>
            <TextInput
              type="email"
              placeholder="user@example.com"
              invalid={Boolean(attachUserForm.formState.errors.email)}
              {...attachUserForm.register("email")}
            />
          </Field>
          <Field label="Target Project" error={attachUserForm.formState.errors.projectId?.message}>
            <SelectInput invalid={Boolean(attachUserForm.formState.errors.projectId)} {...attachUserForm.register("projectId")}>
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project.uuid} value={project.uuid}>
                  {project.name}
                </option>
              ))}
            </SelectInput>
          </Field>
          <div className="flex justify-end gap-3 mt-6">
            <SecondaryButton type="button" onClick={() => { setShowAttach(false); attachUserForm.reset(); }}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" loading={attachUserForm.formState.isSubmitting}>
              Attach user
            </PrimaryButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function PermissionBadge({ label, isAdmin }: { label: string; isAdmin: boolean }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold tracking-tight border whitespace-nowrap transition-colors",
      isAdmin 
        ? "bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]" // Purple for Admin/Edit/Full access
        : "bg-neutral-100 text-neutral-600 border-neutral-200" // Neutral for View only
    )}>
      {label}
    </span>
  );
}
