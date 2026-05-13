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
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <div className="relative w-full max-w-[640px] rounded-[24px] bg-white p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-[28px] font-bold text-[#1F244A] tracking-tight">Create New Organization</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-neutral-400 hover:bg-neutral-50 transition-colors"
          >
            <X className="size-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[15px] font-bold text-[#1F244A]">
              Organization Name<span className="text-[#FD3566] ml-1">*</span>
            </label>
            <input
              {...register("name")}
              placeholder="Enter Project name"
              className={cn(
                "h-[52px] w-full rounded-xl border bg-white px-5 text-[15px] outline-none transition-all placeholder:text-neutral-300",
                errors.name ? "border-[#FD3566]" : "border-neutral-200 focus:border-[#FD3566]"
              )}
            />
            {errors.name && (
              <p className="text-[13px] font-bold text-[#FD3566]">{errors.name.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-[40px] items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-2 text-[16px] font-semibold text-[#1F244A] hover:bg-neutral-50 transition-all font-heading"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-[40px] items-center justify-center gap-2 rounded-full bg-[#FD3566] px-3 py-2 text-[16px] font-semibold text-white shadow-md shadow-[#FD3566]/20 hover:bg-[#E62E5F] transition-all disabled:opacity-50 font-heading"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
