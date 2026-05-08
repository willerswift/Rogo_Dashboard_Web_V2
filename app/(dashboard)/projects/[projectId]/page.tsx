import { ProjectDetailPage } from "@/features/projects/project-detail-page";
import { PermissionGate } from "@/lib/components/PermissionGate";

export default async function ProjectDetailRoute({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <PermissionGate action="projectMgmt:view">
      <ProjectDetailPage projectId={projectId} />
    </PermissionGate>
  );
}
