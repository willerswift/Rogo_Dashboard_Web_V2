"use client";

import { useEffect, useState, useCallback } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  addUserToOrganization,
  checkUserExists,
  getOrganization,
  listOrganizationUsers,
  removeUserFromOrganization,
  transferOrganizationOwner,
} from "@/lib/api/organization";
import { usePartnerContext } from "@/lib/hooks/usePartnerContext";
import { usePermission } from "@/lib/hooks/usePermission";
import type { OrganizationMember, OrgWithOwner } from "@/lib/types/partner";
import { formatDate } from "@/lib/utils/format";
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
  StatusBadge,
  TextInput,
} from "@/features/shared/ui";

const addMemberSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

export function OrganizationDetailPage({ orgId }: { orgId: string }) {
  const { session } = usePartnerContext();
  const canEdit = usePermission("organization:edit");
  const [organization, setOrganization] = useState<OrgWithOwner | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const partnerId = session.activePartnerId;

  const addMemberForm = useForm<z.infer<typeof addMemberSchema>>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: { email: "" },
  });

  const loadDetail = useCallback(async () => {
    if (!partnerId) {
      return;
    }

    try {
      setLoading(true);
      const [nextOrganization, nextMembers] = await Promise.all([
        getOrganization(partnerId, orgId),
        listOrganizationUsers(partnerId, orgId),
      ]);
      setOrganization(nextOrganization);
      setMembers(nextMembers);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load organization detail.");
    } finally {
      setLoading(false);
    }
  }, [partnerId, orgId]);

  useEffect(() => {
    const run = async () => {
      await Promise.resolve();
      void loadDetail();
    };
    void run();
  }, [loadDetail]);

  const handleAddMember = addMemberForm.handleSubmit(async ({ email }) => {
    if (!partnerId) {
      return;
    }

    try {
      const user = await checkUserExists({ email, partnerId });
      await addUserToOrganization({ partnerId, orgId, userId: user.ownerId });
      toast.success(`Added ${email} to ${orgId}.`);
      addMemberForm.reset();
      setShowAddMember(false);
      await loadDetail();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add member.");
    }
  });

  const handleRemove = async (userId: string) => {
    if (!partnerId || !window.confirm(`Remove ${userId} from ${orgId}?`)) {
      return;
    }

    try {
      await removeUserFromOrganization({ partnerId, orgId, userId });
      toast.success("Member removed.");
      await loadDetail();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove member.");
    }
  };

  const handleTransferOwner = async (userId: string) => {
    if (!partnerId || !window.confirm(`Transfer ownership to ${userId}?`)) {
      return;
    }

    try {
      await transferOrganizationOwner({ partnerId, orgId, newOwnerId: userId });
      toast.success("Ownership transferred.");
      await loadDetail();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to transfer ownership.");
    }
  };

  if (!partnerId) {
    return <Notice tone="warn">No active partner is available in the current session.</Notice>;
  }

  if (loading) {
    return <LoadingBlock label="Loading organization detail..." />;
  }

  if (!organization) {
    return (
      <EmptyState
        title="Organization not found"
        description="Confirm the orgId exists for the active partner in staging."
      />
    );
  }

  return (
    <div className="space-y-6">
      <Panel title={organization.name} description={organization.description ?? `Organization · ${organization.orgId}`}>
        <dl className="grid gap-4 text-sm md:grid-cols-2 xl:grid-cols-4">
          <div>
            <dt className="text-zinc-500">Org ID</dt>
            <dd className="mt-1">
              <InlineCode value={organization.orgId} />
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">Status</dt>
            <dd className="mt-1">
              <StatusBadge value={organization.status} />
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">Owner</dt>
            <dd className="mt-1 font-medium text-zinc-900">
              {organization.owner?.email ?? organization.owner?.name ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">Created</dt>
            <dd className="mt-1 font-medium text-zinc-900">
              {organization.createdDate ? new Date(organization.createdDate).toLocaleDateString() : "—"}
            </dd>
          </div>
        </dl>
      </Panel>

      <Panel
        title="Members"
        description="Users who belong to this organization."
        action={
          canEdit ? (
            <PrimaryButton type="button" onClick={() => setShowAddMember(true)}>
              + Add member
            </PrimaryButton>
          ) : undefined
        }
      >
        {members.length === 0 ? (
          <EmptyState title="No members yet" description="Add a user by email using the button above." />
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.uuid ?? member.userId}
                className="flex flex-col gap-3 rounded-xl border border-zinc-200 px-4 py-3 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-zinc-900">{member.user?.email ?? member.user?.name ?? "Unknown user"}</span>
                    {member.isOwner ? (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">Owner</span>
                    ) : null}
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">
                    Joined {formatDate(member.joinedAt)}
                  </div>
                </div>
                {canEdit && !member.isOwner ? (
                  <div className="flex gap-2">
                    <SecondaryButton type="button" onClick={() => void handleTransferOwner(member.userId)}>
                      Make owner
                    </SecondaryButton>
                    <SecondaryButton type="button" onClick={() => void handleRemove(member.userId)}>
                      Remove
                    </SecondaryButton>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Modal
        open={showAddMember}
        onClose={() => { setShowAddMember(false); addMemberForm.reset(); }}
        title="Add member"
      >
        <form className="space-y-4" onSubmit={handleAddMember}>
          <Field label="User email" error={addMemberForm.formState.errors.email?.message}>
            <TextInput
              type="email"
              placeholder="user@example.com"
              invalid={Boolean(addMemberForm.formState.errors.email)}
              {...addMemberForm.register("email")}
            />
          </Field>
          <div className="flex gap-2">
            <PrimaryButton type="submit" loading={addMemberForm.formState.isSubmitting}>
              Add member
            </PrimaryButton>
            <SecondaryButton type="button" onClick={() => { setShowAddMember(false); addMemberForm.reset(); }}>
              Cancel
            </SecondaryButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}
