"use client";

import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { X } from "lucide-react";

import { updateProject } from "@/lib/api/project";
import { usePartnerContext } from "@/lib/hooks/usePartnerContext";
import type { Project } from "@/lib/types/partner";
import { cn } from "@/lib/utils/cn";
import { projectEvents } from "@/lib/utils/events";

const renameSchema = z.object({
  name: z.string().min(1, "Enter Project Name"),
});

type RenameProjectValues = z.infer<typeof renameSchema>;

interface RenameProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  project: Project | null;
}

export function RenameProjectDialog({ open, onClose, onSuccess, project }: RenameProjectDialogProps) {
  const { session } = usePartnerContext();
  const partnerId = session.activePartnerId;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RenameProjectValues>({
    resolver: zodResolver(renameSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (open && project) {
      reset({
        name: project.name,
      });
    }
  }, [open, project, reset]);

  const onSubmit = handleSubmit(async (values) => {
    if (!partnerId || !project) {
      toast.error("No active partner or project found.");
      return;
    }

    try {
      const projectId = project.uuid || (project as any)._id;
      if (!projectId) {
         toast.error("Project ID is missing.");
         return;
      }
      
      await updateProject(partnerId, projectId, {
        name: values.name,
      });
      toast.success("Project renamed successfully.");
      
      // Notify components that a project was updated in this organization
      if (project.orgId) {
        projectEvents.emit("projectCreated", project.orgId);
      } else {
        // For standalone projects
        projectEvents.emit("projectCreated", "null");
      }

      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to rename project.");
    }
  });

  if (!open || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <div className="relative w-full max-w-[480px] rounded-[var(--Radius-6,12px)] bg-white border border-dialog-border shadow-dialog animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        <div className="px-8 py-[var(--Spacing-5,20px)] flex items-center justify-between">
          <h5 className="text-[24px] font-bold text-[#1F244A] tracking-tight font-heading">
            Rename Project <span className="text-[var(--brand-primary)]">{project.name}</span>
          </h5>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-neutral-400 hover:bg-neutral-50 transition-colors"
          >
            <X className="size-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="px-8 pb-8 space-y-8">
          <div className="space-y-3">
            <label className="text-[15px] font-bold text-[#1F244A]">
              Project Name<span className="text-[var(--brand-primary)] ml-1">*</span>
            </label>
            <input
              {...register("name")}
              placeholder="Project Name"
              className={cn(
                "h-[52px] w-full rounded-xl border bg-white px-5 text-[15px] outline-none transition-all placeholder:text-neutral-300",
                errors.name ? "border-[var(--brand-primary)]" : "border-neutral-200 focus:border-[var(--brand-primary)]"
              )}
            />
            {errors.name && (
              <p className="text-[13px] font-bold text-[var(--brand-primary)]">{errors.name.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-[40px] items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-6 py-2 text-[14px] font-semibold text-[#1F244A] hover:bg-neutral-50 transition-all font-heading"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-[40px] items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] px-8 py-2 text-[14px] font-semibold text-white shadow-md shadow-[var(--brand-primary)]/20 hover:bg-[var(--brand-primary-hover)] transition-all disabled:opacity-50 font-heading"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
