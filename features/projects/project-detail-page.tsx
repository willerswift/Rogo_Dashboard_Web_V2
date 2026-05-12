"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  deactivateProjectService,
  deleteProject,
  generateProjectKey,
  getProjectDetail,
} from "@/lib/api/project";
import { usePartnerContext } from "@/lib/hooks/usePartnerContext";
import { usePermission } from "@/lib/hooks/usePermission";
import type { GeneratedProjectKey, ProjectDetailResponse } from "@/lib/types/partner";
import { JsonBlock, LoadingBlock, Notice, Panel, PrimaryButton, SecondaryButton } from "@/features/shared/ui";

export function ProjectDetailPage({ projectId }: { projectId: string }) {
  const { session } = usePartnerContext();
  const canEdit = usePermission("projectMgmt:edit");
  const partnerId = session.activePartnerId;
  const router = useRouter();
  const [detail, setDetail] = useState<ProjectDetailResponse | null>(null);
  const [generatedKey, setGeneratedKey] = useState<GeneratedProjectKey | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingKey, setGeneratingKey] = useState(false);

  const loadDetail = useCallback(async () => {
    if (!partnerId) {
      return;
    }

    try {
      setLoading(true);
      setDetail(await getProjectDetail(partnerId, projectId));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load project detail.");
    } finally {
      setLoading(false);
    }
  }, [partnerId, projectId]);

  useEffect(() => {
    const run = async () => {
      await Promise.resolve();
      void loadDetail();
    };
    void run();
  }, [loadDetail]);

  const handleDeactivate = async (uuid: string) => {
    if (!partnerId) {
      return;
    }

    try {
      await deactivateProjectService(partnerId, projectId, uuid);
      toast.success("Service deactivated.");
      await loadDetail();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to deactivate service.");
    }
  };

  const handleGenerateKey = async () => {
    if (!partnerId || !detail) {
      return;
    }

    if (!window.confirm("Generate key credentials? The backend only allows this once.")) {
      return;
    }

    try {
      setGeneratingKey(true);
      const nextKey = await generateProjectKey({
        name: detail.project.name,
        partnerId,
        projectId,
        authorizedServices: detail.project.authorizedServices ?? [],
      });
      setGeneratedKey(nextKey);
      toast.success("Key generated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate key.");
    } finally {
      setGeneratingKey(false);
    }
  };

  const handleDownload = () => {
    if (!generatedKey) {
      return;
    }

    const blob = new Blob([JSON.stringify(generatedKey, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${projectId}-service-account.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async () => {
    if (!partnerId || !window.confirm(`Delete project ${projectId}?`)) {
      return;
    }

    try {
      await deleteProject(partnerId, projectId);
      toast.success("Project deleted.");
      router.push("/projects");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete project.");
    }
  };

  if (loading) {
    return <LoadingBlock label="Loading project detail..." />;
  }

  if (!detail) {
    return <Notice tone="error">Project detail was not returned for the current partner.</Notice>;
  }

  return (
    <div className="space-y-6">
      <Panel title={detail.project.name} description={`Project ${projectId} in partner ${detail.project.partnerId}`}>
        <dl className="grid gap-4 text-sm md:grid-cols-2 xl:grid-cols-4">
          <div>
            <dt className="text-zinc-500">UUID</dt>
            <dd className="mt-1 font-medium text-zinc-900">{detail.project.uuid}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Org ID</dt>
            <dd className="mt-1 font-medium text-zinc-900">{detail.project.orgId ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">IP whitelist count</dt>
            <dd className="mt-1 font-medium text-zinc-900">{detail.numOfIps}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Need verify email</dt>
            <dd className="mt-1 font-medium text-zinc-900">{detail.project.needVerifyEmail ? "Yes" : "No"}</dd>
          </div>
        </dl>
        {detail.keyInfos ? (
          <div className="mt-4 rounded-xl bg-zinc-50 p-4 text-sm text-zinc-600">
            Existing key info: {detail.keyInfos.name ?? "Unnamed key"}
          </div>
        ) : null}
      </Panel>

      <Panel title="Authorized services" description="PATCH /partner/project/edit/:partnerId/:projectId with { uuid } removes a service.">
        {detail.project.authorizedServices?.length ? (
          <div className="space-y-3">
            {detail.project.authorizedServices.map((service, index) => {
              const serviceUuid = typeof service.uuid === "string" ? service.uuid : null;

              return (
              <div key={String(service.uuid ?? index)} className="rounded-xl border border-zinc-200 p-4">
                <JsonBlock value={service} />
                {canEdit && serviceUuid ? (
                  <div className="mt-3">
                    <SecondaryButton type="button" onClick={() => void handleDeactivate(serviceUuid)}>
                      Deactivate service
                    </SecondaryButton>
                  </div>
                ) : null}
              </div>
            )})}
          </div>
        ) : (
          <Notice>No active authorized services were returned for this project.</Notice>
        )}
      </Panel>

      {canEdit ? (
        <Panel
          title="Generate key"
          description="The OpenAPI schema is empty here, so this dashboard sends the code-backed payload using the current project snapshot."
        >
          <div className="flex flex-wrap gap-3">
            <PrimaryButton type="button" loading={generatingKey} onClick={() => void handleGenerateKey()}>
              Generate key JSON
            </PrimaryButton>
            <SecondaryButton type="button" onClick={() => void handleDelete()}>
              Delete project
            </SecondaryButton>
          </div>

          {generatedKey ? (
            <div className="mt-4 space-y-3">
              <JsonBlock value={generatedKey} />
              <SecondaryButton type="button" onClick={handleDownload}>
                Download JSON
              </SecondaryButton>
            </div>
          ) : null}
        </Panel>
      ) : null}
    </div>
  );
}
