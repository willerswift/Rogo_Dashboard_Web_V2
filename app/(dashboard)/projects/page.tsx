import { ProjectsPage as ProjectsPageContent } from "@/features/projects/projects-page";
import { PermissionGate } from "@/lib/components/PermissionGate";

export default function ProjectsPage() {
  return (
    <PermissionGate action="projectMgmt:view">
      <ProjectsPageContent />
    </PermissionGate>
  );
}
