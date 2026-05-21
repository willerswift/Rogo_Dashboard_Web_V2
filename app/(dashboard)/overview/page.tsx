"use client";

import { useSearchParams } from "next/navigation";
import { OrganizationOverview } from "@/features/organizations/organization-overview";
import { PartnerOverview } from "@/features/organizations/partner-overview";
import { ProjectOverview } from "@/features/projects/project-overview";
import { Sparkles, Rocket, ArrowRight } from "lucide-react";
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
  const view = searchParams.get("view");

  if (view === "partner") {
    return <PartnerOverview />;
  }

  if (orgId && !projectId) {
    return <OrganizationOverview orgId={orgId} />;
  }

  if (projectId) {
    return <ProjectOverview projectId={projectId} />;
  }

  return <PartnerOverview />;
}
