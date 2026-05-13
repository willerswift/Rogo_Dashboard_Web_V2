import { sessionEvents } from "@/lib/utils/events";
import type { ApiErrorShape } from "@/lib/types/partner";

export class ApiClientError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export async function apiClient<T>(path: string, options: RequestOptions = {}) {
  const headers = new Headers(options.headers);
  const hasBody = options.body !== undefined;

  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(path, {
    ...options,
    headers,
    cache: "no-store",
    body: hasBody
      ? headers.get("Content-Type")?.includes("application/json")
        ? JSON.stringify(options.body)
        : (options.body as BodyInit)
      : undefined,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const error = payload as ApiErrorShape;
    const message = Array.isArray(error?.message)
      ? error.message.join(", ")
      : error?.message || error?.error || response.statusText;

    if (response.status === 401 && typeof window !== "undefined") {
      // Don't throw for 401 on the client, as we're handling it with a logout redirect.
      // This prevents unhandled promise rejections in the console.
      // Call the logout API to clear server-side httpOnly cookies, then redirect.
      fetch("/api/auth/logout", { method: "POST" }).finally(() => {
        window.location.assign("/login");
      });
      // Return a pending promise that will never resolve to prevent further processing
      return new Promise<T>(() => {});
    }

    throw new ApiClientError(message, response.status, payload);
  }

  return payload as T;
}
