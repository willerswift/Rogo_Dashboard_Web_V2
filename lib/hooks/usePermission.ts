"use client";

import { useMemo } from "react";

import { usePartnerContext } from "@/lib/hooks/usePartnerContext";
import { hasPermission } from "@/lib/utils/permissions";

export function usePermission(action: string) {
  const { session } = usePartnerContext();

  return useMemo(() => hasPermission(session, action), [action, session]);
}
