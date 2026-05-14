"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Info, Copy, Check } from "lucide-react";

import { listOrganizations } from "@/lib/api/organization";
import { createProject, deleteProject, listProjects, updateProject } from "@/lib/api/project";
import { usePartnerContext } from "@/lib/hooks/usePartnerContext";
import { usePermission } from "@/lib/hooks/usePermission";
import type { OrgWithOwner, Project } from "@/lib/types/partner";
import { parseJsonInput, stringifyJson } from "@/lib/utils/parsing";
import { CreateProjectDialog } from "@/features/organizations/CreateProjectDialog";
import {
  CheckboxInput,
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
import { cn } from "@/lib/utils/cn";

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
  const [openUuidId, setOpenUuidId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const uuidRef = useRef<HTMLDivElement>(null);

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

  // Handle outside click for UUID popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (uuidRef.current && !uuidRef.current.contains(event.target as Node)) {
        setOpenUuidId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopy = (uuid: string) => {
    void navigator.clipboard.writeText(uuid);
    setCopiedId(uuid);
    setTimeout(() => setCopiedId(null), 2000);
  };

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
        <div className="px-6 py-4 max-w-sm">
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
          <div className="px-6 py-4">
            <LoadingBlock label="Loading projects..." />
          </div>
        ) : visibleProjects.length === 0 ? (
          <div className="px-6 py-8 text-center border-t border-neutral-100">
            <h3 className="font-bold text-neutral-900">No projects found</h3>
            <p className="mt-2 text-sm text-neutral-500 max-w-sm mx-auto">Create a project using the button above, or clear the organization filter.</p>
          </div>
        ) : (
<<<<<<< Updated upstream
          <div className="overflow-visible">
=======
          <div className="overflow-x-auto border-t border-neutral-100">
>>>>>>> Stashed changes
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-[12px] font-bold uppercase tracking-wider text-neutral-800 leading-[18px] font-sans">
                  <th className="px-6 py-4 text-left">Name</th>
                  <th className="px-6 py-4 text-left">Project ID</th>
                  <th className="px-6 py-4 text-left">Organization</th>
                  <th className="px-6 py-4 text-left">Email verify</th>
                  <th className="px-6 py-4 text-left">Services</th>
                  <th className="py-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleProjects.map((project) => (
                  <tr key={project.uuid} className="border-b border-zinc-100 align-top">
<<<<<<< Updated upstream
                    <td className="py-3 pr-4 font-medium text-zinc-900">{project.name}</td>
                    <td className="py-3 pr-4 text-zinc-600">
                      <div className="flex items-center gap-1.5 leading-none relative">
                        <InlineCode value={project.uuid.slice(0, 8)} />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenUuidId(openUuidId === project.uuid ? null : project.uuid);
                          }}
                          className={cn(
                            "flex items-center justify-center transition-colors shrink-0 p-0 outline-none -mt-[1px]",
                            openUuidId === project.uuid ? "text-primary-300" : "text-neutral-400 hover:text-primary-300"
                          )}
                          title="View full ID"
                        >
                          <Info size={13} strokeWidth={2.5} />
                        </button>

                        {openUuidId === project.uuid && (
                          <div 
                            ref={uuidRef}
                            className="absolute bottom-full mb-3 left-0 z-[100] w-[280px] rounded-xl border border-neutral-200 bg-white p-3 shadow-2xl animate-in fade-in zoom-in duration-200"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest leading-none">
                                  Project ID
                                </span>
                                <button
                                  onClick={() => handleCopy(project.uuid)}
                                  className={cn(
                                    "flex h-6 items-center gap-1.5 rounded-md px-2 text-[10px] font-bold transition-all shrink-0",
                                    copiedId === project.uuid
                                      ? "bg-[#FD3566]/10 text-[#FD3566]"
                                      : "bg-[#FD3566] text-white hover:bg-[#EA023B]"
                                  )}
                                >
                                  {copiedId === project.uuid ? (
                                    <>
                                      <Check size={11} strokeWidth={3} />
                                      <span>Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy size={11} strokeWidth={3} />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>
                              </div>

                              <div className="rounded-lg border border-[#E6E8F4] bg-[#E6E8F4]/30 p-2">
                                <div className="text-[12px] font-medium text-[#393984] break-all leading-relaxed font-mono tracking-tight">
                                  {project.uuid}
                                </div>
                              </div>
                            </div>
                            {/* Little arrow */}
                            <div className="absolute top-full left-3 -mt-1.5 h-3 w-3 rotate-45 border-b border-r border-neutral-200 bg-white" />
                          </div>
                        )}
                      </div>
=======
                    <td className="px-6 py-4 font-medium text-zinc-900">{project.name}</td>
                    <td className="px-6 py-4 text-zinc-600">
                      <InlineCode value={project.uuid} />
>>>>>>> Stashed changes
                    </td>
                    <td className="px-6 py-4 text-zinc-600">
                      {project.orgId ? (orgNameById[project.orgId] ?? project.orgId) : "—"}
                    </td>
                    <td className="px-6 py-4 text-zinc-600">{project.needVerifyEmail ? "Required" : "Optional"}</td>
                    <td className="px-6 py-4 text-zinc-600">{project.authorizedServices?.length ?? 0}</td>
                    <td className="py-4 pr-6 text-right">
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
              <CheckboxInput {...editForm.register("needVerifyEmail")} />
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
