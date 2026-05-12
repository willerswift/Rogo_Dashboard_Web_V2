"use client";

import type { ReactNode } from "react";
import { Toaster } from "sonner";

import { PartnerProvider } from "@/lib/hooks/usePartnerContext";
import type { PartnerSession } from "@/lib/types/partner";
import { ThemeProvider } from "./ThemeProvider";

export function Providers({
  children,
  initialSession,
}: {
  children: ReactNode;
  initialSession: PartnerSession;
}) {
  return (
    <ThemeProvider>
      <PartnerProvider initialSession={initialSession}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            classNames: {
              toast: "border border-border bg-surface text-foreground shadow-panel",
              description: "text-muted-foreground",
            },
          }}
        />
      </PartnerProvider>
    </ThemeProvider>
  );
}
