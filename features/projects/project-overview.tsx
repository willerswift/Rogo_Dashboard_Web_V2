"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Info, Check, Copy, Pencil, Trash2, LayoutDashboard, Fingerprint, Activity, CalendarDays, Calendar } from "lucide-react";

import { getProjectDetail } from "@/lib/api/project";
import { getOrganization } from "@/lib/api/organization";
import { usePartnerContext } from "@/lib/hooks/usePartnerContext";
import type { Project, OrgWithOwner } from "@/lib/types/partner";
import { LoadingBlock, EmptyState, InlineCode, SecondaryButton, Panel } from "@/features/shared/ui";
import { BreadcrumbHeader } from "@/features/shared/breadcrumb-header";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/format";
import { RenameProjectDialog } from "@/features/organizations/RenameProjectDialog";
import { DeleteProjectDialog } from "@/features/organizations/DeleteProjectDialog";
import { useRouter } from "next/navigation";

export function ProjectOverview({ projectId }: { projectId: string }) {
  const router = useRouter();
  const { session } = usePartnerContext();
  const partnerId = session.activePartnerId;
  const partnerName = session.activePartnerId || "ROGO";

  const [project, setProject] = useState<Project | null>(null);
  const [org, setOrg] = useState<OrgWithOwner | null>(null);
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
      
      if (detail.project.orgId) {
        const orgDetail = await getOrganization(partnerId, detail.project.orgId);
        setOrg(orgDetail);
      }
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700 transition-colors duration-500">
      <BreadcrumbHeader
        items={[
          { label: partnerName, href: "/overview?view=partner" },
          ...(project.orgId && org && org.orgId === project.orgId
            ? [{ label: org.name, href: `/overview?orgId=${org.orgId}` }]
            : [{ label: "No Organization" }]),
          { label: project.name, active: true }
        ]}
        backHref={project.orgId && org && org.orgId === project.orgId ? `/overview?orgId=${org.orgId}` : "/overview?view=partner"}
        breadcrumbAddon={
          <div className="flex items-center h-8 px-3 rounded-full bg-primary-100/20 text-[12px] font-bold text-primary-300 uppercase tracking-tight">
            ID: {displayId.slice(0, 8)}
          </div>
        }
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center h-7 px-3 rounded-full bg-green-100/20 text-[11px] font-bold text-[#1FC16B] uppercase tracking-wider">
            ACTIVE
          </div>
        </div>
      </BreadcrumbHeader>

      {/* Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-sm text-neutral-500">
          Manage your project configuration and view essential details.
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <SecondaryButton onClick={() => setIsRenameOpen(true)}>
            <Pencil className="size-4" />
            Rename
          </SecondaryButton>
          <SecondaryButton onClick={() => setIsDeleteOpen(true)} className="text-red-600 hover:text-red-700 hover:bg-red-500/10 border-red-200 dark:border-red-900/50">
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
              <dt className="flex items-center gap-1.5 text-neutral-500">
                <Fingerprint className="size-4" />
                <span>Project ID</span>
              </dt>
              <dd className="mt-2 flex items-center gap-2">
                <InlineCode value={displayId} />
                <button
                  onClick={() => handleCopy(displayId)}
                  className={cn(
                    "flex items-center justify-center transition-colors shrink-0 p-1.5 rounded-md",
                    copiedId === displayId ? "text-green-600 bg-green-500/10" : "text-neutral-400 hover:bg-surface-muted hover:text-foreground"
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
              <dt className="flex items-center gap-1.5 text-neutral-500">
                <Activity className="size-4" />
                <span>Status</span>
              </dt>
              <dd className="mt-2 flex items-center gap-2 font-medium text-foreground">
                <div className="relative flex items-center justify-center">
                  <div className="absolute h-3 w-3 rounded-full bg-[#1FC16B] opacity-20 animate-ping" />
                  <div className="relative h-2 w-2 rounded-full bg-[#1FC16B]" />
                </div>
                Fully Operational
              </dd>
            </div>

            <div>
              <dt className="flex items-center gap-1.5 text-neutral-500">
                <Calendar className="size-4" />
                <span>Created</span>
              </dt>
              <dd className="mt-2 font-medium text-foreground">
                {project.createdAt ? formatDate(project.createdAt) : "—"}
              </dd>
            </div>

            <div>
              <dt className="flex items-center gap-1.5 text-neutral-500">
                <CalendarDays className="size-4" />
                <span>Last Updated</span>
              </dt>
              <dd className="mt-2 font-medium text-foreground">
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


