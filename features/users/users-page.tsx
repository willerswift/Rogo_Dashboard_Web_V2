"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { attachUserToProject, listProjects } from "@/lib/api/project";
import { syncSession } from "@/lib/api/auth";
import { checkUserExists } from "@/lib/api/organization";
import { addPartnerUser, deletePartnerUser, getUserPermissionRecord, listPartnerUsers } from "@/lib/api/user";
import { usePartnerContext } from "@/lib/hooks/usePartnerContext";
import { usePermission } from "@/lib/hooks/usePermission";
import type { PermissionRecord, Project, UserWithNumProject } from "@/lib/types/partner";
import {
  EmptyState,
  Field,
  JsonBlock,
  LoadingBlock,
  Modal,
  Notice,
  Panel,
  PrimaryButton,
  SecondaryButton,
  SelectInput,
  TextInput,
} from "@/features/shared/ui";

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
  const canAddUser = usePermission("projectAuth:edit");
  const canView = usePermission("authorization:view");
  const canDelete = usePermission("authorization:edit");
  const partnerId = session.activePartnerId;
  const [users, setUsers] = useState<UserWithNumProject[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(null);
  const [selectedPermissionRecord, setSelectedPermissionRecord] = useState<PermissionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showAttach, setShowAttach] = useState(false);

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

  async function loadUsers() {
    if (!partnerId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [nextUsers, nextProjects] = await Promise.all([
        listPartnerUsers(partnerId),
        listProjects(partnerId),
      ]);
      setUsers(nextUsers);
      setProjects(nextProjects);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  async function loadPermissionRecord(ownerId: string) {
    if (!partnerId) {
      return;
    }

    try {
      setSelectedOwnerId(ownerId);
      setSelectedPermissionRecord(await getUserPermissionRecord(partnerId, ownerId));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load permission record.");
    }
  }

  useEffect(() => {
    void loadUsers();
  }, [partnerId]);

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
      await loadUsers();
      const { session: refreshed } = await syncSession();
      setSession(refreshed);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create partner user.");
    }
  });

  const handleDeleteUser = async (uuid: string) => {
    if (!partnerId || !window.confirm(`Delete partner user ${uuid}?`)) {
      return;
    }

    try {
      await deletePartnerUser({ partnerId, uuid });
      toast.success("User deleted.");
      await loadUsers();
      if (selectedOwnerId) {
        setSelectedPermissionRecord(null);
      }
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
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to attach user to project.");
    }
  });

  return (
    <div className="space-y-6">
      <Panel
        title="Partner users"
        description="All users in the active partner and their project memberships."
        action={
          canAddUser ? (
            <div className="flex gap-2">
              <SecondaryButton type="button" onClick={() => setShowAttach(true)}>
                Attach existing
              </SecondaryButton>
              <PrimaryButton type="button" onClick={() => setShowCreate(true)}>
                + Add user
              </PrimaryButton>
            </div>
          ) : undefined
        }
      >
        {loading ? (
          <LoadingBlock label="Loading users..." />
        ) : users.length === 0 ? (
          <EmptyState title="No users found" description="Add a user using the button above." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500">
                  <th className="pb-3 pr-4 font-medium">Email</th>
                  <th className="pb-3 pr-4 font-medium">Name</th>
                  <th className="pb-3 pr-4 font-medium">Projects</th>
                  <th className="pb-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(({ user, numOfProject }) => (
                  <tr key={user.uuid} className="border-b border-zinc-100 align-top">
                    <td className="py-3 pr-4 font-medium text-zinc-900">{user.email}</td>
                    <td className="py-3 pr-4 text-zinc-600">{user.name}</td>
                    <td className="py-3 pr-4 text-zinc-600">{numOfProject}</td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {canView ? (
                          <SecondaryButton type="button" onClick={() => void loadPermissionRecord(user.ownerId)}>
                            Permissions
                          </SecondaryButton>
                        ) : null}
                        {canDelete ? (
                          <SecondaryButton type="button" onClick={() => void handleDeleteUser(user.uuid)}>
                            Remove
                          </SecondaryButton>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {canView && selectedPermissionRecord ? (
        <Panel
          title={`Permissions for ${users.find((u) => u.user.ownerId === selectedOwnerId)?.user.email ?? selectedOwnerId}`}
          description="ABAC V2 permission record for this user."
        >
          <JsonBlock value={selectedPermissionRecord} />
        </Panel>
      ) : null}

      <Modal
        open={showCreate}
        onClose={() => { setShowCreate(false); addUserForm.reset(); }}
        title="Add user to partner"
      >
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleAddUser}>
          <Field label="Name" error={addUserForm.formState.errors.name?.message}>
            <TextInput invalid={Boolean(addUserForm.formState.errors.name)} {...addUserForm.register("name")} />
          </Field>
          <Field label="Email" error={addUserForm.formState.errors.email?.message}>
            <TextInput type="email" invalid={Boolean(addUserForm.formState.errors.email)} {...addUserForm.register("email")} />
          </Field>
          <Field label="Temporary password" error={addUserForm.formState.errors.password?.message}>
            <TextInput type="password" invalid={Boolean(addUserForm.formState.errors.password)} {...addUserForm.register("password")} />
          </Field>
          <Field label="Project" error={addUserForm.formState.errors.projectId?.message}>
            <SelectInput invalid={Boolean(addUserForm.formState.errors.projectId)} {...addUserForm.register("projectId")}>
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project.uuid} value={project.uuid}>
                  {project.name}
                </option>
              ))}
            </SelectInput>
          </Field>
          <div className="md:col-span-2 flex gap-2">
            <PrimaryButton type="submit" loading={addUserForm.formState.isSubmitting}>
              Create user
            </PrimaryButton>
            <SecondaryButton type="button" onClick={() => { setShowCreate(false); addUserForm.reset(); }}>
              Cancel
            </SecondaryButton>
          </div>
        </form>
      </Modal>

      <Modal
        open={showAttach}
        onClose={() => { setShowAttach(false); attachUserForm.reset(); }}
        title="Attach existing user to project"
      >
        <form className="space-y-4" onSubmit={handleAttachUser}>
          <Field label="User email" error={attachUserForm.formState.errors.email?.message}>
            <TextInput
              type="email"
              placeholder="user@example.com"
              invalid={Boolean(attachUserForm.formState.errors.email)}
              {...attachUserForm.register("email")}
            />
          </Field>
          <Field label="Project" error={attachUserForm.formState.errors.projectId?.message}>
            <SelectInput invalid={Boolean(attachUserForm.formState.errors.projectId)} {...attachUserForm.register("projectId")}>
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project.uuid} value={project.uuid}>
                  {project.name}
                </option>
              ))}
            </SelectInput>
          </Field>
          <div className="flex gap-2">
            <PrimaryButton type="submit" loading={attachUserForm.formState.isSubmitting}>
              Attach user
            </PrimaryButton>
            <SecondaryButton type="button" onClick={() => { setShowAttach(false); attachUserForm.reset(); }}>
              Cancel
            </SecondaryButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}
