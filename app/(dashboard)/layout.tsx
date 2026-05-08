import { redirect } from "next/navigation";

import { DashboardShell } from "@/lib/components/DashboardShell";
import { getSessionCookie } from "@/lib/server/session";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSessionCookie();

  if (!session) {
    redirect("/login");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
