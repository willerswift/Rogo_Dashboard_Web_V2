import { apiClient } from "@/lib/api/client";
import type {
  CreatePartnerUserInput,
  DeletePartnerUserInput,
  PermissionRecord,
  SuccessResponse,
  UserAbacResponse,
  UserPartner,
  UserWithNumProject,
} from "@/lib/types/partner";

export function listPartnerUsers(partnerId: string) {
  return apiClient<UserWithNumProject[]>(`/api/partner/user/list/${partnerId}`);
}

export function addPartnerUser(payload: CreatePartnerUserInput) {
  return apiClient<UserPartner[]>("/api/partner/user/add", {
    method: "POST",
    body: payload,
  });
}

export function deletePartnerUser(payload: DeletePartnerUserInput) {
  return apiClient<SuccessResponse>("/api/partner/user/delete", {
    method: "POST",
    body: payload,
  });
}

export function listProjectPermissionUsers(partnerId: string, projectId: string) {
  return apiClient<UserAbacResponse>(`/api/partner/user/permissions/${partnerId}/${projectId}`);
}

export function getUserPermissionRecord(partnerId: string, ownerId: string) {
  return apiClient<PermissionRecord>(`/api/partner/permission/${partnerId}/${ownerId}`);
}
