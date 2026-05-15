"use client";

import { useState } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";

import { deleteProject } from "@/lib/api/project";
import { usePartnerContext } from "@/lib/hooks/usePartnerContext";
import type { Project } from "@/lib/types/partner";
import { projectEvents } from "@/lib/utils/events";

interface DeleteProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  project: Project | null;
}

export function DeleteProjectDialog({ open, onClose, onSuccess, project }: DeleteProjectDialogProps) {
  const { session } = usePartnerContext();
  const partnerId = session.activePartnerId;
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!partnerId || !project) {
      toast.error("No active partner or project found.");
      return;
    }

    try {
      setIsDeleting(true);
      const projectId = project.uuid || (project as any)._id;
      if (!projectId) {
         toast.error("Project ID is missing.");
         return;
      }

      await deleteProject(partnerId, projectId);
      toast.success("Project deleted successfully.");

      // Notify components that a project was deleted in this organization
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
      toast.error(error instanceof Error ? error.message : "Failed to delete project.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!open || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <div className="relative w-full max-w-[480px] rounded-[var(--Radius-6,12px)] bg-white border border-dialog-border shadow-dialog animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        <div className="px-8 py-[var(--Spacing-5,20px)] flex items-center justify-between">
          <h5 className="text-[24px] font-bold text-[#1F244A] tracking-tight font-heading">
            Delete Project <span className="text-[var(--brand-primary)]">{project.name}</span>
          </h5>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-neutral-400 hover:bg-neutral-50 transition-colors"
          >
            <X className="size-6" />
          </button>
        </div>

        <div className="px-8 pb-8">
          <div className="mb-10">
            <p className="text-[17px] text-[var(--brand-primary)] font-medium leading-relaxed">
              This action cannot be undone.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-[40px] items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-8 py-2 text-[14px] font-semibold text-[#1F244A] hover:bg-neutral-50 transition-all font-heading"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex h-[40px] items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] px-6 py-2 text-[14px] font-semibold text-white shadow-md shadow-[var(--brand-primary)]/20 hover:bg-[var(--brand-primary-hover)] transition-all disabled:opacity-50 font-heading"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
