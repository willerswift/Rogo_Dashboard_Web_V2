"use client";

import { useMemo } from "react";

import { usePartnerContext } from "@/lib/hooks/usePartnerContext";
import { isPartnerAdmin } from "@/lib/utils/permissions";

/**
 * Hook để kiểm tra user hiện tại có phải partner admin không.
 * Admin = có action `*`, `projectMgmt:*` hoặc `authorization:*` trên resource partner.
 * Non-admin = chỉ có quyền view/edit trên các org/project cụ thể.
 */
export function useIsAdmin(): boolean {
  const { session } = usePartnerContext();
  return useMemo(() => isPartnerAdmin(session), [session]);
}
