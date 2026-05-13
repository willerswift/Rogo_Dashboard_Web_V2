"use client";

import { useState, useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import { PartnerProvider } from "@/lib/hooks/usePartnerContext";
import type { PartnerSession } from "@/lib/types/partner";
import { sessionEvents } from "@/lib/utils/events";
import { SessionTimeoutDialog } from "./SessionTimeoutDialog";
import { ThemeProvider } from "./ThemeProvider";

export function Providers({
  children,
  initialSession,
}: {
  children: ReactNode;
  initialSession: PartnerSession;
}) {
  const [isTimeoutModalOpen, setIsTimeoutModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = sessionEvents.on("sessionExpired", () => {
      setIsTimeoutModalOpen(true);
    });
    return () => unsubscribe();
  }, []);

  const handleLogoutAndRedirect = () => {
    setIsTimeoutModalOpen(false);
    // Perform the logout action and then redirect
    fetch("/api/auth/logout", { method: "POST" }).finally(() => {
      window.location.assign("/login");
    });
  };

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
        <SessionTimeoutDialog open={isTimeoutModalOpen} onConfirm={handleLogoutAndRedirect} />
      </PartnerProvider>
    </ThemeProvider>
  );
}
