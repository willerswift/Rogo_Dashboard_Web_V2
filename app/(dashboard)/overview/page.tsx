"use client";

import { useSearchParams } from "next/navigation";
import { OrganizationOverview } from "@/features/organizations/organization-overview";
import { ProjectOverview } from "@/features/projects/project-overview";
import { EmptyState } from "@/features/shared/ui";
import { Suspense } from "react";

export default function OverviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OverviewContent />
    </Suspense>
  );
}

function OverviewContent() {
  const searchParams = useSearchParams();
  const orgId = searchParams.get("orgId");
  const projectId = searchParams.get("projectId");

  if (orgId && !projectId) {
    return <OrganizationOverview orgId={orgId} />;
  }

  if (projectId) {
    return <ProjectOverview projectId={projectId} />;
  }

  return (
    <div className="flex h-[60vh] flex-col items-center justify-center text-center">
      <h2 className="text-2xl font-bold text-neutral-1000">Welcome to Rogo Dashboard</h2>
      <p className="mt-2 text-neutral-500">Select an organization or project from the access tree to get started.</p>
    </div>
  );
}
