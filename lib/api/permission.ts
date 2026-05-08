import { apiClient } from "@/lib/api/client";
import type {
  GrantPermissionInput,
  PermissionRecord,
  RevokePermissionInput,
  SuccessResponse,
} from "@/lib/types/partner";

export function listPermissionRecords(partnerId: string) {
  return apiClient<PermissionRecord[]>(`/api/partner/permission/${partnerId}`);
}

export function getPermissionRecord(partnerId: string, ownerId: string) {
  return apiClient<PermissionRecord>(`/api/partner/permission/${partnerId}/${ownerId}`);
}

export function grantPermissions(payload: GrantPermissionInput) {
  return apiClient<SuccessResponse>("/api/partner/permission/grant", {
    method: "POST",
    body: payload,
  });
}

export function revokePermissions(payload: RevokePermissionInput) {
  return apiClient<SuccessResponse>("/api/partner/permission/revoke", {
    method: "POST",
    body: payload,
  });
}
