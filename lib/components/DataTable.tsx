import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/lib/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/lib/components/ui/table";

export type DataTableColumn<T> = {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
};

export function DataTable<T>({
  title,
  description,
  columns,
  data,
  toolbar,
  caption,
  emptyTitle = "No records yet",
  emptyDescription = "The layout is ready for data once the API wiring lands.",
}: {
  title: string;
  description?: string;
  columns: DataTableColumn<T>[];
  data: T[];
  toolbar?: ReactNode;
  caption?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  return (
    <Card className="rounded-xl border-neutral-200 shadow-sm">
      <CardHeader className="p-5 gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-0.5">
          <CardTitle className="text-[16px] font-bold text-neutral-900">{title}</CardTitle>
          {description ? <CardDescription className="text-[13px]">{description}</CardDescription> : null}
        </div>
        {toolbar ? <div className="flex items-center gap-2">{toolbar}</div> : null}
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="overflow-x-auto">
          <Table>
            {caption ? <TableCaption className="sr-only">{caption}</TableCaption> : null}
            <TableHeader>
              <TableRow className="hover:bg-transparent border-neutral-100">
                {columns.map((column) => (
                  <TableHead key={column.id} className={cn("px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-neutral-400", column.headerClassName)}>
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? (
                data.map((row, rowIndex) => (
                  <TableRow key={rowIndex} className="group hover:bg-neutral-50/50 border-neutral-50">
                    {columns.map((column) => (
                      <TableCell key={column.id} className={cn("px-5 py-3 text-[13px]", column.className)}>
                        {column.cell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="py-12">
                    <div className="mx-auto flex max-w-md flex-col items-center gap-1.5 px-4 text-center">
                      <p className="text-[14px] font-bold text-neutral-900">{emptyTitle}</p>
                      <p className="text-[12px] text-neutral-500">{emptyDescription}</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
