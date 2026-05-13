"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useCallback } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { listOrganizations } from "@/lib/api/organization";
import { createProject, deleteProject, listProjects, updateProject } from "@/lib/api/project";
import { usePartnerContext } from "@/lib/hooks/usePartnerContext";
import { usePermission } from "@/lib/hooks/usePermission";
import type { OrgWithOwner, Project } from "@/lib/types/partner";
import { parseJsonInput, stringifyJson } from "@/lib/utils/parsing";
import { CreateProjectDialog } from "@/features/organizations/CreateProjectDialog";
import {
  EmptyState,
  Field,
  InlineCode,
  LoadingBlock,
  Modal,
  Panel,
  PrimaryButton,
  SecondaryButton,
  SelectInput,
  TextArea,
  TextInput,
} from "@/features/shared/ui";

const editProjectSchema = z.object({
  name: z.string().min(1, "Name is required."),
  needVerifyEmail: z.boolean().optional(),
  authorizedServices: z.string().optional(),
});

type EditProjectValues = z.infer<typeof editProjectSchema>;

export function ProjectsPage() {
  const { session } = usePartnerContext();
  const canEdit = usePermission("projectMgmt:edit");
  const partnerId = session.activePartnerId;
  const [projects, setProjects] = useState<Project[]>([]);
  const [organizations, setOrganizations] = useState<OrgWithOwner[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Project | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const editForm = useForm<EditProjectValues>({
    resolver: zodResolver(editProjectSchema),
    defaultValues: { name: "", needVerifyEmail: true, authorizedServices: "[]" },
  });

  const visibleProjects = useMemo(() => {
    if (!selectedOrgId) {
      return projects;
    }

    return projects.filter((project) => project.orgId === selectedOrgId);
  }, [projects, selectedOrgId]);

  const loadProjects = useCallback(async () => {
    if (!partnerId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [nextOrganizations, nextProjects] = await Promise.all([
        listOrganizations(partnerId),
        listProjects(partnerId, selectedOrgId || undefined),
      ]);
      setOrganizations(nextOrganizations);
      setProjects(nextProjects);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load projects.");
    } finally {
      setLoading(false);
    }
  }, [partnerId, selectedOrgId]);

  useEffect(() => {
    const run = async () => {
      await Promise.resolve();
      void loadProjects();
    };
    void run();
  }, [loadProjects]);

  const startEditing = (project: Project) => {
    setEditing(project);
    editForm.reset({
      name: project.name,
      needVerifyEmail: project.needVerifyEmail,
      authorizedServices: stringifyJson(project.authorizedServices ?? []),
    });
  };

  const handleEdit = editForm.handleSubmit(async (values) => {
    if (!partnerId || !editing) {
      return;
    }

    try {
      await updateProject(partnerId, editing.uuid, {
        name: values.name,
        needVerifyEmail: values.needVerifyEmail,
        authorizedServices: parseJsonInput(values.authorizedServices || "[]", []),
      });
      toast.success("Project updated.");
      setEditing(null);
      await loadProjects();

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update project.");
    }
  });

  const handleDelete = async (projectId: string) => {
    if (!partnerId || !window.confirm(`Delete project ${projectId}?`)) {
      return;
    }

    try {
      await deleteProject(partnerId, projectId);
      toast.success("Project deleted.");
      await loadProjects();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete project.");
    }
  };

  const orgNameById = Object.fromEntries(organizations.map((o) => [o.orgId, o.name]));

  return (
    <div className="space-y-6">
      <Panel
        title="Projects"
        description="Manage projects for the active partner."
        action={
          canEdit ? (
            <PrimaryButton type="button" onClick={() => setShowCreate(true)}>
              + Create
            </PrimaryButton>
          ) : undefined
        }
      >
        <div className="mb-4 max-w-sm">
          <Field label="Filter by organization">
            <SelectInput value={selectedOrgId} onChange={(event) => setSelectedOrgId(event.target.value)}>
              <option value="">All organizations</option>
              {organizations.map((organization) => (
                <option key={organization.uuid ?? organization.orgId} value={organization.orgId}>
                  {organization.name}
                </option>
              ))}
            </SelectInput>
          </Field>
        </div>

        {loading ? (
          <LoadingBlock label="Loading projects..." />
        ) : visibleProjects.length === 0 ? (
          <EmptyState title="No projects found" description="Create a project using the button above, or clear the organization filter." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-[12px] font-bold uppercase tracking-wider text-[#606060] leading-[18px] font-sans">
                  <th className="pb-3 pr-4 text-left">Name</th>
                  <th className="pb-3 pr-4 text-left">Project ID</th>
                  <th className="pb-3 pr-4 text-left">Organization</th>
                  <th className="pb-3 pr-4 text-left">Email verify</th>
                  <th className="pb-3 pr-4 text-left">Services</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleProjects.map((project) => (
                  <tr key={project.uuid} className="border-b border-zinc-100 align-top">
                    <td className="py-3 pr-4 font-medium text-zinc-900">{project.name}</td>
                    <td className="py-3 pr-4 text-zinc-600">
                      <InlineCode value={project.uuid} />
                    </td>
                    <td className="py-3 pr-4 text-zinc-600">
                      {project.orgId ? (orgNameById[project.orgId] ?? project.orgId) : "—"}
                    </td>
                    <td className="py-3 pr-4 text-zinc-600">{project.needVerifyEmail ? "Required" : "Optional"}</td>
                    <td className="py-3 pr-4 text-zinc-600">{project.authorizedServices?.length ?? 0}</td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/projects/${project.uuid}`}
                          className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-300 px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                        >
                          Detail
                        </Link>
                        {canEdit ? (
                          <>
                            <SecondaryButton type="button" onClick={() => startEditing(project)}>
                              Edit
                            </SecondaryButton>
                            <SecondaryButton type="button" onClick={() => void handleDelete(project.uuid)}>
                              Delete
                            </SecondaryButton>
                          </>
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

      <CreateProjectDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={() => {
          void loadProjects();
        }}
      />

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing ? `Edit ${editing.name}` : "Edit project"}
        wide
      >
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleEdit}>
          <Field label="Name" error={editForm.formState.errors.name?.message}>
            <TextInput invalid={Boolean(editForm.formState.errors.name)} {...editForm.register("name")} />
          </Field>
          <div className="flex items-center">
            <label className="inline-flex items-center gap-3 text-sm text-zinc-700">
              <input type="checkbox" className="flex flex-col items-center justify-center w-[22px] h-[22px] rounded-[8px] border border-neutral-500 bg-neutral-100" {...editForm.register("needVerifyEmail")} />
              Require email verification
            </label>
          </div>
          <div className="md:col-span-2">
            <Field label="Authorized services (JSON array)">
              <TextArea rows={6} {...editForm.register("authorizedServices")} />
            </Field>
          </div>
          <div className="md:col-span-2 flex gap-2">
            <PrimaryButton type="submit" loading={editForm.formState.isSubmitting}>
              Save changes
            </PrimaryButton>
            <SecondaryButton type="button" onClick={() => setEditing(null)}>
              Cancel
            </SecondaryButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}
