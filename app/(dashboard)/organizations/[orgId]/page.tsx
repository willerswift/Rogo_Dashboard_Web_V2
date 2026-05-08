import { OrganizationDetailPage } from "@/features/organizations/organization-detail-page";
import { PermissionGate } from "@/lib/components/PermissionGate";

export default async function OrganizationDetailRoute({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;

  return (
    <PermissionGate action="organization:view">
      <OrganizationDetailPage orgId={orgId} />
    </PermissionGate>
  );
}
