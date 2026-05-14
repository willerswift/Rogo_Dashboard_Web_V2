"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useCallback } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  createOrganization,
  deleteOrganization,
  listOrganizations,
  updateOrganization,
} from "@/lib/api/organization";
import { usePartnerContext } from "@/lib/hooks/usePartnerContext";
import { usePermission } from "@/lib/hooks/usePermission";
import type { OrgWithOwner } from "@/lib/types/partner";
import { formatOwnerEmail } from "@/lib/utils/format";
import { slugify } from "@/lib/utils/parsing";
import { CreateOrganizationDialog } from "./CreateOrganizationDialog";
import {
  EmptyState,
  Field,
  InlineCode,
  LoadingBlock,
  Modal,
  Notice,
  Panel,
  PrimaryButton,
  SecondaryButton,
  SelectInput,
  StatusBadge,
  TextArea,
  TextInput,
} from "@/features/shared/ui";

const editSchema = z.object({
  orgId: z.string().min(1),
  name: z.string().min(1, "Name is required."),
  description: z.string().optional(),
  status: z.string().min(1, "Status is required."),
});

type EditValues = z.infer<typeof editSchema>;

export function OrganizationsPage() {
  const { session } = usePartnerContext();
  const canEdit = usePermission("organization:edit");
  const [organizations, setOrganizations] = useState<OrgWithOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<OrgWithOwner | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const partnerId = session.activePartnerId;

  const editForm = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      orgId: "",
      name: "",
      description: "",
      status: "ACTIVE",
    },
  });

  const sortedOrganizations = useMemo(
    () => [...organizations].sort((left, right) => left.name.localeCompare(right.name)),
    [organizations],
  );

  const loadOrganizations = useCallback(async () => {
    if (!partnerId) {
      setOrganizations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setOrganizations(await listOrganizations(partnerId));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load organizations.");
    } finally {
      setLoading(false);
    }
  }, [partnerId]);

  useEffect(() => {
    const run = async () => {
      await Promise.resolve();
      void loadOrganizations();
    };
    void run();
  }, [loadOrganizations]);

  const handleEdit = editForm.handleSubmit(async (values) => {
    if (!partnerId) {
      return;
    }

    try {
      await updateOrganization({
        partnerId,
        orgId: values.orgId,
        name: values.name,
        description: values.description,
        status: values.status,
      });
      toast.success("Organization updated.");
      setEditing(null);
      await loadOrganizations();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update organization.");
    }
  });

  const startEditing = (organization: OrgWithOwner) => {
    setEditing(organization);
    editForm.reset({
      orgId: organization.orgId,
      name: organization.name,
      description: organization.description ?? "",
      status: organization.status,
    });
  };

  const handleDelete = async (orgId: string) => {
    if (!partnerId || !window.confirm(`Delete organization ${orgId}?`)) {
      return;
    }

    try {
      await deleteOrganization(partnerId, orgId);
      toast.success("Organization deleted.");
      await loadOrganizations();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete organization.");
    }
  };

  return (
    <div className="space-y-6">
      {!partnerId ? (
        <Notice tone="warn">No active partner was found in the current session.</Notice>
      ) : null}

      <Panel
        title="Organizations"
        description="Manage organizations linked to the active partner."
        action={
          canEdit ? (
            <PrimaryButton type="button" onClick={() => setShowCreate(true)}>
              + Create
            </PrimaryButton>
          ) : undefined
        }
      >
        {loading ? (
          <LoadingBlock label="Loading organizations..." />
        ) : sortedOrganizations.length === 0 ? (
          <EmptyState
            title="No organizations found"
            description="Create your first organization using the button above."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-[12px] font-bold uppercase tracking-wider text-neutral-800 leading-[18px] font-sans">
                  <th className="px-6 py-4 text-left">Name</th>
                  <th className="px-6 py-4 text-left">Org ID</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Owner</th>
                  <th className="px-6 py-4 text-left">Created</th>
                  <th className="py-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedOrganizations.map((organization) => (
                  <tr key={organization.uuid ?? organization.orgId} className="border-b border-zinc-100 align-top">
                    <td className="px-6 py-4">
                      <div className="font-medium text-zinc-900">{organization.name}</div>
                      {organization.description ? (
                        <div className="mt-1 text-xs text-zinc-500">{organization.description}</div>
                      ) : null}
                    </td>
                    <td className="px-6 py-4 text-zinc-600">
                      <InlineCode value={organization.orgId} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge value={organization.status} />
                    </td>
                    <td className="px-6 py-4 text-zinc-600">
                      {formatOwnerEmail(organization.owner, "—")}
                    </td>
                    <td className="px-6 py-4 text-zinc-500 text-xs">
                      {organization.createdDate ? new Date(organization.createdDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-4 pr-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/organizations/${organization.orgId}`}
                          className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-300 px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                        >
                          Detail
                        </Link>
                        {canEdit ? (
                          <>
                            <SecondaryButton type="button" onClick={() => startEditing(organization)}>
                              Edit
                            </SecondaryButton>
                            <SecondaryButton type="button" onClick={() => void handleDelete(organization.orgId)}>
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

      <CreateOrganizationDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={() => {
          void loadOrganizations();
        }}
      />

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing ? `Edit ${editing.name}` : "Edit organization"}
      >
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleEdit}>
          <Field label="Org ID">
            <TextInput readOnly {...editForm.register("orgId")} />
          </Field>
          <Field label="Status" error={editForm.formState.errors.status?.message}>
            <SelectInput invalid={Boolean(editForm.formState.errors.status)} {...editForm.register("status")}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="DISABLED">DISABLED</option>
            </SelectInput>
          </Field>
          <Field label="Name" error={editForm.formState.errors.name?.message}>
            <TextInput invalid={Boolean(editForm.formState.errors.name)} {...editForm.register("name")} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Description">
              <TextArea rows={3} {...editForm.register("description")} />
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
