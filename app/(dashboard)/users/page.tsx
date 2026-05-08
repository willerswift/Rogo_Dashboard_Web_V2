import { UsersPage as UsersPageContent } from "@/features/users/users-page";
import { PermissionGate } from "@/lib/components/PermissionGate";

export default function UsersPage() {
  return (
    <PermissionGate action="authorization:view">
      <UsersPageContent />
    </PermissionGate>
  );
}
