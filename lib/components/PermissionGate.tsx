"use client";

import type { ReactNode } from "react";
import { ShieldAlert } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/lib/components/ui/card";
import { usePermission } from "@/lib/hooks/usePermission";

export function PermissionGate({
  action,
  children,
  fallback,
  title = "You don’t have access to this section",
  message = "Your current partner permissions don’t include the action required to view this page.",
}: {
  action: string;
  children: ReactNode;
  fallback?: ReactNode;
  title?: string;
  message?: string;
}) {
  const canAccess = usePermission(action);

  if (canAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex size-11 items-center justify-center rounded-full bg-surface-subtle text-accent">
          <ShieldAlert className="size-5" aria-hidden="true" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Required action: {action}</p>
      </CardContent>
    </Card>
  );
}
