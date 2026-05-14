"use client";

import { useEffect, useState, useCallback } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { syncSession } from "@/lib/api/auth";
import { getPermissionRecord, grantPermissions, listPermissionRecords, revokePermissions } from "@/lib/api/permission";
import { usePartnerContext } from "@/lib/hooks/usePartnerContext";
import { usePermission } from "@/lib/hooks/usePermission";
import type { AbacV2Entry, PermissionRecord } from "@/lib/types/partner";
import { parseJsonInput } from "@/lib/utils/parsing";
import {
  EmptyState,
  Field,
  JsonBlock,
  LoadingBlock,
  Modal,
  Panel,
  PrimaryButton,
  SecondaryButton,
  TextArea,
  TextInput,
} from "@/features/shared/ui";

const grantSchema = z.object({
  ownerId: z.string().min(1, "ownerId is required."),
  entries: z.string().min(1, "At least one ABAC entry is required."),
});

const revokeSchema = z.object({
  ownerId: z.string().min(1, "ownerId is required."),
  resources: z.string().min(1, "At least one resource is required."),
  actions: z.string().optional(),
});

type GrantValues = z.infer<typeof grantSchema>;
type RevokeValues = z.infer<typeof revokeSchema>;

function parseMultiline(value: string) {
  return value
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function PermissionsPage() {
  const { session, setSession } = usePartnerContext();
  const canView = usePermission("authorization:view");
  const canEdit = usePermission("authorization:edit");
  const partnerId = session.activePartnerId;
  const [records, setRecords] = useState<PermissionRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<PermissionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGrant, setShowGrant] = useState(false);
  const [showRevoke, setShowRevoke] = useState(false);

  const grantForm = useForm<GrantValues>({
    resolver: zodResolver(grantSchema),
    defaultValues: {
      ownerId: "",
      entries: JSON.stringify(
        [
          {
            resources: ["partner:YOUR_PARTNER_ID"],
            actions: ["organization:view"],
          },
        ],
        null,
        2,
      ),
    },
  });

  const revokeForm = useForm<RevokeValues>({
    resolver: zodResolver(revokeSchema),
    defaultValues: {
      ownerId: "",
      resources: "partner:YOUR_PARTNER_ID",
      actions: "",
    },
  });

  const loadRecords = useCallback(async () => {
    if (!partnerId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setRecords(await listPermissionRecords(partnerId));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load permission records.");
    } finally {
      setLoading(false);
    }
  }, [partnerId]);

  useEffect(() => {
    const run = async () => {
      await Promise.resolve();
      void loadRecords();
    };
    void run();
  }, [loadRecords]);

  const handleSelectRecord = useCallback(async (ownerId: string) => {
    if (!partnerId) {
      return;
    }

    try {
      setSelectedRecord(await getPermissionRecord(partnerId, ownerId));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load permission record.");
    }
  }, [partnerId]);

  async function refreshCurrentSessionIfNeeded(ownerId: string) {
    if (ownerId !== session.userId) {
      return;
    }

    const { session: refreshed } = await syncSession();
    setSession(refreshed);
  }

  const handleGrant = grantForm.handleSubmit(async (values) => {
    if (!partnerId) {
      return;
    }

    try {
      const entries = parseJsonInput<AbacV2Entry[]>(values.entries, []);
      await grantPermissions({ ownerId: values.ownerId, partnerId, entries });
      toast.success("Permissions granted.");
      setShowGrant(false);
      await refreshCurrentSessionIfNeeded(values.ownerId);
      await loadRecords();
      await handleSelectRecord(values.ownerId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to grant permissions.");
    }
  });

  const handleRevoke = revokeForm.handleSubmit(async (values) => {
    if (!partnerId) {
      return;
    }

    try {
      await revokePermissions({
        ownerId: values.ownerId,
        partnerId,
        resources: parseMultiline(values.resources),
        actions: values.actions ? parseMultiline(values.actions) : undefined,
      });
      toast.success("Permissions revoked.");
      setShowRevoke(false);
      await refreshCurrentSessionIfNeeded(values.ownerId);
      await loadRecords();
      await handleSelectRecord(values.ownerId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to revoke permissions.");
    }
  });

  return (
    <div className="space-y-6">
      <Panel
        title="Permission records"
        description="ABAC V2 access records for users in the active partner."
        action={
          canEdit ? (
            <div className="flex gap-2">
              <SecondaryButton type="button" onClick={() => setShowRevoke(true)}>
                Revoke
              </SecondaryButton>
              <PrimaryButton type="button" onClick={() => setShowGrant(true)}>
                + Grant
              </PrimaryButton>
            </div>
          ) : undefined
        }
      >
        <div className="px-6 py-4">
          {loading ? (
            <LoadingBlock label="Loading permission records..." />
          ) : records.length === 0 ? (
            <EmptyState title="No permission records found" description="Grant permissions to a user using the button above." />
          ) : (
            <div className="space-y-3">
              {records.map((record, index) => (
                <div
                  key={record.uuid ?? `${record.ownerId}-${record.partnerId}-${index}`}
                  className="flex flex-col gap-3 rounded-xl border border-zinc-200 px-4 py-3 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <div className="font-medium text-zinc-900 text-sm font-mono">{record.ownerId}</div>
                    <div className="mt-1 text-xs text-zinc-500">{record.abac.length} permission {record.abac.length === 1 ? "entry" : "entries"}</div>
                  </div>
                  {canView ? (
                    <SecondaryButton type="button" onClick={() => void handleSelectRecord(record.ownerId)}>
                      View record
                    </SecondaryButton>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </Panel>

      {selectedRecord ? (
        <Panel title="Permission detail" description={`ABAC record for ${selectedRecord.ownerId}`}>
          <div className="px-6 py-4">
            <JsonBlock value={selectedRecord} />
          </div>
        </Panel>
      ) : null}

      <Modal
        open={showGrant}
        onClose={() => { setShowGrant(false); grantForm.reset(); }}
        title="Grant permissions"
        wide
      >
        <form className="space-y-4" onSubmit={handleGrant}>
          <Field label="User ID (ownerId)" error={grantForm.formState.errors.ownerId?.message}>
            <TextInput
              placeholder="Enter the user's ownerId"
              invalid={Boolean(grantForm.formState.errors.ownerId)}
              {...grantForm.register("ownerId")}
            />
          </Field>
          <Field label="Permission entries (JSON array)" error={grantForm.formState.errors.entries?.message}>
            <TextArea rows={10} invalid={Boolean(grantForm.formState.errors.entries)} {...grantForm.register("entries")} />
          </Field>
          <div className="flex gap-2">
            <PrimaryButton type="submit" loading={grantForm.formState.isSubmitting}>
              Grant permissions
            </PrimaryButton>
            <SecondaryButton type="button" onClick={() => { setShowGrant(false); grantForm.reset(); }}>
              Cancel
            </SecondaryButton>
          </div>
        </form>
      </Modal>

      <Modal
        open={showRevoke}
        onClose={() => { setShowRevoke(false); revokeForm.reset(); }}
        title="Revoke permissions"
        wide
      >
        <form className="space-y-4" onSubmit={handleRevoke}>
          <Field label="User ID (ownerId)" error={revokeForm.formState.errors.ownerId?.message}>
            <TextInput
              placeholder="Enter the user's ownerId"
              invalid={Boolean(revokeForm.formState.errors.ownerId)}
              {...revokeForm.register("ownerId")}
            />
          </Field>
          <Field label="Resources (one per line)" error={revokeForm.formState.errors.resources?.message}>
            <TextArea rows={5} invalid={Boolean(revokeForm.formState.errors.resources)} {...revokeForm.register("resources")} />
          </Field>
          <Field label="Actions (one per line, optional — leave blank to revoke all actions)">
            <TextArea rows={4} {...revokeForm.register("actions")} />
          </Field>
          <div className="flex gap-2">
            <PrimaryButton type="submit" loading={revokeForm.formState.isSubmitting}>
              Revoke permissions
            </PrimaryButton>
            <SecondaryButton type="button" onClick={() => { setShowRevoke(false); revokeForm.reset(); }}>
              Cancel
            </SecondaryButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}
