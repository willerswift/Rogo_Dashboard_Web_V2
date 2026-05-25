import { MyPermissionsPage } from "@/features/permissions/my-permissions-page";

export const metadata = {
  title: "My Permissions - Rogo Dashboard",
  description: "View your current access levels and roles across organizations and projects.",
};

export default function Page() {
  return <MyPermissionsPage />;
}
