import { apiClient } from "@/lib/api/client";
import type { LoginInput, PartnerSession } from "@/lib/types/partner";

export function login(payload: LoginInput) {
  return apiClient<{ session: PartnerSession }>("/api/auth/login", {
    method: "POST",
    body: payload,
  });
}

export function logout() {
  return apiClient<{ success: boolean }>("/api/auth/logout", {
    method: "POST",
  });
}

export function getSession() {
  return apiClient<{ session: PartnerSession }>("/api/session");
}

export function syncSession() {
  return apiClient<{ session: PartnerSession }>("/api/session", {
    method: "POST",
  });
}
