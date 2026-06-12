"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useCallback } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, Pencil, Trash2 } from "lucide-react";


import {
  deleteOrganization,
  listOrganizations,
  updateOrganization,
  getOrganization,
} from "@/lib/api/organization";
import { usePartnerContext } from "@/lib/hooks/usePartnerContext";
import { usePermission } from "@/lib/hooks/usePermission";
import { useIsAdmin } from "@/lib/hooks/useIsAdmin";
import { getUserAccessibleOrgIds } from "@/lib/utils/permissions";
import type { OrgWithOwner } from "@/lib/types/partner";
import { formatOwnerEmail } from "@/lib/utils/format";
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
  const isAdmin = useIsAdmin();
  const hasGlobalOrgAccess = usePermission("organization:*");
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
      if (isAdmin || hasGlobalOrgAccess) {
         setOrganizations(await listOrganizations(partnerId));
      } else {
        const accessibleOrgIds = getUserAccessibleOrgIds(session);
        const orgs = await Promise.all(
          accessibleOrgIds.map((orgId) =>
            getOrganization(partnerId, orgId).catch((e) => {
              console.warn(`Cannot load org ${orgId}:`, e);
              return null;
            }),
          ),
        );
        setOrganizations(orgs.filter((org): org is OrgWithOwner => org !== null));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load organizations.");
    } finally {
      setLoading(false);
    }
  }, [partnerId, isAdmin, hasGlobalOrgAccess, session]);

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
                <tr className="border-b border-border text-[12px] font-bold uppercase tracking-wider text-neutral-500 leading-[18px] font-sans">
                  <th className="px-4 sm:px-6 py-4 text-left">Name</th>
                  <th className="px-4 sm:px-6 py-4 text-left hidden md:table-cell">Org ID</th>
                  <th className="px-4 sm:px-6 py-4 text-left">Status</th>
                  <th className="px-4 sm:px-6 py-4 text-left hidden md:table-cell">Owner</th>
                  <th className="px-4 sm:px-6 py-4 text-left hidden md:table-cell">Created</th>
                  <th className="py-4 pr-4 sm:pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedOrganizations.map((organization) => (
                  <tr key={organization.uuid ?? organization.orgId} className="border-b border-border-muted align-top hover:bg-surface-muted transition-colors">
                    <td className="px-4 sm:px-6 py-4">
                      <div className="font-medium text-foreground">{organization.name}</div>
                      {organization.description ? (
                        <div className="mt-1 text-xs text-neutral-500">{organization.description}</div>
                      ) : null}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-neutral-500 hidden md:table-cell">
                      <InlineCode value={organization.orgId} />
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <StatusBadge value={organization.status} />
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-neutral-500 hidden md:table-cell">
                      {formatOwnerEmail(organization.owner, "—")}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-neutral-500 text-xs hidden md:table-cell">
                      {organization.createdDate ? new Date(organization.createdDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-4 pr-4 sm:pr-6 text-right">
                      {/* Desktop View (Unchanged) */}
                      <div className="hidden md:flex justify-end gap-2">
                        <Link
                          href={`/organizations/${organization.orgId}`}
                          className="inline-flex h-[40px] items-center justify-center rounded-full border border-border bg-surface px-4 py-2 text-[14px] font-semibold text-foreground transition hover:bg-surface-muted font-heading"
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

                      {/* Mobile View (Icons only) */}
                      <div className="flex md:hidden justify-end gap-1.5">
                        <Link
                          href={`/organizations/${organization.orgId}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-foreground transition hover:bg-surface-muted shrink-0"
                          title="Detail"
                        >
                          <Eye className="size-4" />
                        </Link>
                        {canEdit ? (
                          <>
                            <SecondaryButton
                              type="button"
                              onClick={() => startEditing(organization)}
                              className="h-9 w-9 p-0 flex items-center justify-center shrink-0"
                              title="Edit"
                            >
                              <Pencil className="size-4" />
                            </SecondaryButton>
                            <SecondaryButton
                              type="button"
                              onClick={() => void handleDelete(organization.orgId)}
                              className="h-9 w-9 p-0 flex items-center justify-center text-primary-300 hover:text-primary-400 shrink-0"
                              title="Delete"
                            >
                              <Trash2 className="size-4" />
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
