"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { X } from "lucide-react";

import { createOrganization } from "@/lib/api/organization";
import { usePartnerContext } from "@/lib/hooks/usePartnerContext";
import { slugify } from "@/lib/utils/parsing";
import { cn } from "@/lib/utils/cn";
import { TextInput } from "@/features/shared/ui";

const orgSchema = z.object({
  name: z.string().min(1, "Enter Organization Name"),
});

type OrgValues = z.infer<typeof orgSchema>;

interface CreateOrganizationDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (orgId: string) => void;
}

export function CreateOrganizationDialog({ open, onClose, onSuccess }: CreateOrganizationDialogProps) {
  const { session } = usePartnerContext();
  const partnerId = session.activePartnerId;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OrgValues>({
    resolver: zodResolver(orgSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (!partnerId) {
      toast.error("No active partner found.");
      return;
    }

    try {
      const orgId = slugify(values.name);
      await createOrganization({
        partnerId,
        orgId,
        name: values.name,
      });
      toast.success("Organization created successfully.");
      reset();
      onSuccess?.(orgId);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create organization.");
    }
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/40 p-4 transition-colors duration-500">
      <div className="relative w-full max-w-[640px] rounded-[var(--Radius-6,12px)] bg-surface border border-dialog-border animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        <div className="px-8 py-[var(--Spacing-5,20px)] flex items-center justify-between">
          <h5 className="text-[24px] font-bold text-foreground tracking-tight font-heading">Create New Organization</h5>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-neutral-400 hover:bg-surface-muted transition-colors"
          >
            <X className="size-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="px-8 pb-8 space-y-8">
          <div className="space-y-3">
            <label className="text-[15px] font-bold text-foreground">
              Organization Name<span className="text-primary-300 ml-1">*</span>
            </label>
            <TextInput
              {...register("name")}
              placeholder="Enter Organization name"
              invalid={Boolean(errors.name)}
              className="w-full"
            />
            {errors.name && (
              <p className="text-[13px] font-bold text-primary-300">{errors.name.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-[40px] items-center justify-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-[14px] font-semibold text-foreground hover:bg-surface-muted transition-all font-heading"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-[40px] items-center justify-center gap-2 rounded-full bg-primary-300 px-3 py-2 text-[14px] font-semibold text-white hover:bg-primary-400 transition-all disabled:opacity-50 font-heading"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
