import { PermissionsPage as PermissionsPageContent } from "@/features/permissions/permissions-page";
import { PermissionGate } from "@/lib/components/PermissionGate";

export default function PermissionsPage() {
  return (
    <PermissionGate action="authorization:view">
      <PermissionsPageContent />
    </PermissionGate>
  );
}
