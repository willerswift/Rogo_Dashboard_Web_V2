"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Info, Check, Copy, Pencil, Trash2, LayoutDashboard, Fingerprint, Activity, CalendarDays, Calendar } from "lucide-react";

import { getProjectDetail } from "@/lib/api/project";
import { usePartnerContext } from "@/lib/hooks/usePartnerContext";
import type { Project } from "@/lib/types/partner";
import { LoadingBlock, EmptyState, InlineCode, SecondaryButton, Panel } from "@/features/shared/ui";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/format";
import { RenameProjectDialog } from "@/features/organizations/RenameProjectDialog";
import { DeleteProjectDialog } from "@/features/organizations/DeleteProjectDialog";
import { useRouter } from "next/navigation";

export function ProjectOverview({ projectId }: { projectId: string }) {
  const router = useRouter();
  const { session } = usePartnerContext();
  const partnerId = session.activePartnerId;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // UI state
  const [openUuidId, setOpenUuidId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const uuidRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!partnerId || !projectId) return;
    try {
      setLoading(true);
      const detail = await getProjectDetail(partnerId, projectId);
      setProject(detail.project);
    } catch {
      toast.error("Failed to load project details");
    } finally {
      setLoading(false);
    }
  }, [partnerId, projectId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (uuidRef.current && !uuidRef.current.contains(event.target as Node)) {
        setOpenUuidId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    toast.success("Project ID copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) return <LoadingBlock label="Loading project..." />;
  if (!project) return <EmptyState title="Not found" description="Select a project from the tree." />;

  const displayId = project.uuid || projectId;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-[var(--brand-primary)] to-[color-mix(in srgb, var(--brand-primary), black 10%)] text-white shadow-sm shadow-[var(--brand-primary)]/20">
              <LayoutDashboard className="size-5" />
            </div>
            <h1 className="text-[32px] font-bold font-heading text-neutral-1000 tracking-tight leading-none">{project.name}</h1>
            <div className="flex items-center h-7 px-3 rounded-full bg-[#E1F7F1] text-[11px] font-bold text-[#1FC16B] uppercase tracking-wider leading-none ml-2">
              ACTIVE
            </div>
          </div>
          <p className="text-sm text-neutral-500">
            Manage your project configuration and view essential details.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <SecondaryButton onClick={() => setIsRenameOpen(true)}>
            <Pencil className="size-4" />
            Rename
          </SecondaryButton>
          <SecondaryButton onClick={() => setIsDeleteOpen(true)} className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
            <Trash2 className="size-4" />
            Delete
          </SecondaryButton>
        </div>
      </div>

      {/* Details Card */}
      <Panel title="Project Information">
        <div className="px-6 py-4">
          <dl className="grid gap-4 text-sm md:grid-cols-2 xl:grid-cols-4">
            <div>
              <dt className="flex items-center gap-1.5 text-zinc-500">
                <Fingerprint className="size-4" />
                <span>Project ID</span>
              </dt>
              <dd className="mt-2 flex items-center gap-2">
                <InlineCode value={displayId} />
                <button
                  onClick={() => handleCopy(displayId)}
                  className={cn(
                    "flex items-center justify-center transition-colors shrink-0 p-1.5 rounded-md",
                    copiedId === displayId ? "text-green-600 bg-green-50" : "text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                  )}
                  title="Copy full ID"
                >
                  {copiedId === displayId ? (
                    <Check size={14} strokeWidth={2.5} />
                  ) : (
                    <Copy size={14} strokeWidth={2.5} />
                  )}
                </button>
              </dd>
            </div>

            <div>
              <dt className="flex items-center gap-1.5 text-zinc-500">
                <Activity className="size-4" />
                <span>Status</span>
              </dt>
              <dd className="mt-2 flex items-center gap-2 font-medium text-zinc-900">
                <div className="relative flex items-center justify-center">
                  <div className="absolute h-3 w-3 rounded-full bg-[#1FC16B] opacity-20 animate-ping" />
                  <div className="relative h-2 w-2 rounded-full bg-[#1FC16B] shadow-sm" />
                </div>
                Fully Operational
              </dd>
            </div>

            <div>
              <dt className="flex items-center gap-1.5 text-zinc-500">
                <Calendar className="size-4" />
                <span>Created</span>
              </dt>
              <dd className="mt-2 font-medium text-zinc-900">
                {project.createdAt ? formatDate(project.createdAt) : "—"}
              </dd>
            </div>

            <div>
              <dt className="flex items-center gap-1.5 text-zinc-500">
                <CalendarDays className="size-4" />
                <span>Last Updated</span>
              </dt>
              <dd className="mt-2 font-medium text-zinc-900">
                {project.updatedAt ? formatDate(project.updatedAt) : "—"}
              </dd>
            </div>
          </dl>
        </div>
      </Panel>

      <RenameProjectDialog
        open={isRenameOpen}
        onClose={() => setIsRenameOpen(false)}
        project={project}
        onSuccess={() => {
          void load();
        }}
      />

      <DeleteProjectDialog
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        project={project}
        onSuccess={() => {
          router.push("/");
        }}
      />
    </div>
  );
}


