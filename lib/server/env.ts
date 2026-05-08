import "server-only";

const baseUrl = process.env.ROGO_API_BASE_URL?.trim() || "https://staging.openapi.rogo.com.vn/api/v2.0";

export function getApiBaseUrl() {
  return baseUrl.replace(/\/$/, "");
}

export function isSecureCookie() {
  return process.env.NODE_ENV === "production";
}
