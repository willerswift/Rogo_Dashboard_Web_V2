import { apiClient } from "@/lib/api/client";
import type {
  CreateProjectInput,
  GeneratedProjectKey,
  GenerateProjectKeyInput,
  Project,
  ProjectDetailResponse,
  SuccessResponse,
  UpdateProjectInput,
  UserPartner,
} from "@/lib/types/partner";

export function listProjects(partnerId: string, orgId?: string) {
  const params = new URLSearchParams();
  if (orgId) {
    params.set("orgId", orgId);
  }

  const query = params.toString();
  return apiClient<Project[]>(`/api/partner/project/list/${partnerId}${query ? `?${query}` : ""}`);
}

export function createProject(payload: CreateProjectInput) {
  return apiClient<Project>("/api/partner/project/create", {
    method: "POST",
    body: payload,
  });
}

export function getProjectDetail(partnerId: string, projectId: string) {
  return apiClient<ProjectDetailResponse>(`/api/partner/project/get/${partnerId}/${projectId}`);
}

export function updateProject(partnerId: string, projectId: string, payload: UpdateProjectInput) {
  return apiClient<Project>(`/api/partner/project/edit/${partnerId}/${projectId}`, {
    method: "POST",
    body: payload,
  });
}

export function deactivateProjectService(partnerId: string, projectId: string, uuid: string) {
  return apiClient<Project>(`/api/partner/project/edit/${partnerId}/${projectId}`, {
    method: "PATCH",
    body: { uuid },
  });
}

export function generateProjectKey(payload: GenerateProjectKeyInput) {
  return apiClient<GeneratedProjectKey>("/api/partner/project/generate-key", {
    method: "POST",
    body: payload,
  });
}

export function deleteProject(partnerId: string, projectId: string) {
  return apiClient<Project>("/api/partner/project/delete", {
    method: "POST",
    body: { partnerId, projectId },
  });
}

export function listProjectUsers(partnerId: string, projectId: string) {
  return apiClient<UserPartner[]>(`/api/partner/user/list/${partnerId}/${projectId}`);
}

export function attachUserToProject(payload: {
  partnerId: string;
  orgId: string;
  projectId: string;
  userId: string;
}) {
  return apiClient<SuccessResponse>("/api/partner/project/user/attach", {
    method: "POST",
    body: payload,
  });
}
