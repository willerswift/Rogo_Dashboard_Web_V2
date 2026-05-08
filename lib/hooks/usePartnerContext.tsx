"use client";

import { createContext, useContext, useMemo, useState } from "react";

import type { PartnerSession } from "@/lib/types/partner";

type PartnerContextValue = {
  session: PartnerSession;
  setSession: (session: PartnerSession) => void;
};

const PartnerContext = createContext<PartnerContextValue | null>(null);

export function PartnerProvider({
  children,
  initialSession,
}: {
  children: React.ReactNode;
  initialSession: PartnerSession;
}) {
  const [session, setSession] = useState(initialSession);
  const value = useMemo(() => ({ session, setSession }), [session]);

  return <PartnerContext.Provider value={value}>{children}</PartnerContext.Provider>;
}

export function usePartnerContext() {
  const context = useContext(PartnerContext);

  if (!context) {
    throw new Error("usePartnerContext must be used within a PartnerProvider");
  }

  return context;
}
