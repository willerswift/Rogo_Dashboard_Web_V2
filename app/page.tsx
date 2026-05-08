import Link from "next/link";
import { redirect } from "next/navigation";

import { buttonVariants } from "@/lib/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/lib/components/ui/card";
import { getSessionCookie } from "@/lib/server/session";
import { cn } from "@/lib/utils/cn";
import { getFirstAccessibleHref } from "@/lib/utils/permissions";

export default async function Home() {
  const session = await getSessionCookie();

  if (!session) {
    redirect("/login");
  }

  const destination = getFirstAccessibleHref(session);

  if (destination) {
    redirect(destination);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>No accessible dashboard sections</CardTitle>
          <CardDescription>
            Your session is active, but none of the configured partner navigation items are available for the current permission set.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row">
          <Link href="/login" className={cn(buttonVariants({ variant: "outline" }), "justify-center")}>
            Return to login
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
