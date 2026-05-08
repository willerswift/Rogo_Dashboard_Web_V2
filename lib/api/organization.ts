import { apiClient } from "@/lib/api/client";
import type {
  CreateOrganizationInput,
  OrganizationUserInput,
  OrgWithOwner,
  OrganizationMember,
  SuccessResponse,
  TransferOrganizationOwnerInput,
  UpdateOrganizationInput,
  UserPartner,
} from "@/lib/types/partner";

export function listOrganizations(partnerId: string) {
  return apiClient<OrgWithOwner[]>(`/api/partner/organization/list/${partnerId}`);
}

export function getOrganization(partnerId: string, orgId: string) {
  return apiClient<OrgWithOwner>(`/api/partner/organization/${partnerId}/${orgId}`);
}

export function createOrganization(payload: CreateOrganizationInput) {
  return apiClient<OrgWithOwner>("/api/partner/organization/create", {
    method: "POST",
    body: payload,
  });
}

export function updateOrganization(payload: UpdateOrganizationInput) {
  return apiClient<OrgWithOwner>("/api/partner/organization/update", {
    method: "PATCH",
    body: payload,
  });
}

export function deleteOrganization(partnerId: string, orgId: string) {
  return apiClient<SuccessResponse>("/api/partner/organization/delete", {
    method: "DELETE",
    body: { partnerId, orgId },
  });
}

export function listOrganizationUsers(partnerId: string, orgId: string) {
  return apiClient<OrganizationMember[]>(`/api/partner/organization/${partnerId}/${orgId}/users`);
}

export function checkUserExists(payload: { email: string; partnerId: string; projectId?: string }) {
  return apiClient<UserPartner>("/api/partner/user/check-exist", {
    method: "POST",
    body: payload,
  });
}

export function addUserToOrganization(payload: OrganizationUserInput) {
  return apiClient<SuccessResponse>("/api/partner/organization/user/add", {
    method: "POST",
    body: payload,
  });
}

export function removeUserFromOrganization(payload: OrganizationUserInput) {
  return apiClient<SuccessResponse>("/api/partner/organization/user/remove", {
    method: "POST",
    body: payload,
  });
}

export function transferOrganizationOwner(payload: TransferOrganizationOwnerInput) {
  return apiClient<SuccessResponse>("/api/partner/organization/transfer-owner", {
    method: "PATCH",
    body: payload,
  });
}
