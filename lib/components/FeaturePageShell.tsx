import type { ReactNode } from "react";

import { DataTable, type DataTableColumn } from "@/lib/components/DataTable";
import { PermissionGate } from "@/lib/components/PermissionGate";
import { Badge } from "@/lib/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/lib/components/ui/card";

export function FeaturePageShell<T>({
  title,
  description,
  permission,
  columns,
  tableTitle,
  tableDescription,
  emptyTitle,
  emptyDescription,
  eyebrow = "Ready for integration",
  meta,
}: {
  title: string;
  description: string;
  permission: string;
  columns: DataTableColumn<T>[];
  tableTitle: string;
  tableDescription: string;
  emptyTitle: string;
  emptyDescription: string;
  eyebrow?: string;
  meta?: ReactNode;
}) {
  return (
    <PermissionGate action={permission}>
      <section className="space-y-6">
        <Card>
          <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <Badge variant="accent" className="w-fit">{eyebrow}</Badge>
              <div className="space-y-2">
                <CardTitle className="text-2xl">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </div>
            </div>
            {meta ? <div className="flex flex-wrap items-center gap-2">{meta}</div> : null}
          </CardHeader>
          <CardContent>
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              This page shell is intentionally light on behavior so the upcoming route handlers and data hooks can plug into a stable layout without reworking the visual structure.
            </p>
          </CardContent>
        </Card>

        <DataTable
          title={tableTitle}
          description={tableDescription}
          columns={columns}
          data={[]}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
          caption={`${title} table shell`}
        />
      </section>
    </PermissionGate>
  );
}
