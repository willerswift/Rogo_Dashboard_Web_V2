import { OrganizationsPage as OrganizationsPageContent } from "@/features/organizations/organizations-page";
import { PermissionGate } from "@/lib/components/PermissionGate";

export default function OrganizationsPage() {
  return (
    <PermissionGate action="organization:view">
      <OrganizationsPageContent />
    </PermissionGate>
  );
}
