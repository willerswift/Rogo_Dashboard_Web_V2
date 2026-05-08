import "server-only";

import { NextResponse } from "next/server";

import type { ApiErrorShape, TokenBundle, UserResourcesResponse } from "@/lib/types/partner";
import { getApiBaseUrl } from "@/lib/server/env";
import {
  clearSessionCookies,
  createSession,
  getAccessTokenCookie,
  getRefreshTokenCookie,
  getSessionCookie,
  setSessionCookies,
} from "@/lib/server/session";

const JSON_HEADERS = {
  "Content-Type": "application/json",
};

export class UpstreamError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function parseResponseBody(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

export async function fetchJsonFromUpstream<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      ...JSON_HEADERS,
      ...(init?.headers ?? {}),
    },
  });

  const body = await parseResponseBody(response);

  if (!response.ok) {
    const error = body as ApiErrorShape;
    throw new UpstreamError(
      Array.isArray(error?.message)
        ? error.message.join(", ")
        : error?.message || error?.error || response.statusText,
      response.status,
      body,
    );
  }

  return body as T;
}

export async function refreshAccessToken(refreshToken: string) {
  return fetchJsonFromUpstream<TokenBundle>("/partner/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

export async function getResourcesWithAccessToken(accessToken: string) {
  return fetchJsonFromUpstream<UserResourcesResponse>("/partner/user/resources", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function createAuthenticatedHeaders() {
  const accessToken = await getAccessTokenCookie();
  const refreshToken = await getRefreshTokenCookie();

  return {
    accessToken,
    refreshToken,
  };
}

export async function withUpstreamAuthRetry(input: {
  path: string;
  method: string;
  search?: string;
  body?: string;
  contentType?: string | null;
}) {
  const { accessToken, refreshToken } = await createAuthenticatedHeaders();

  if (!accessToken || !refreshToken) {
    throw new UpstreamError("Missing authenticated session", 401);
  }

  const url = `${getApiBaseUrl()}${input.path}${input.search ?? ""}`;

  const perform = async (token: string) => {
    return fetch(url, {
      method: input.method,
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        ...(input.contentType ? { "Content-Type": input.contentType } : {}),
      },
      body: input.body,
    });
  };

  let response = await perform(accessToken);
  let rotatedBundle: TokenBundle | null = null;

  if (response.status === 401) {
    try {
      rotatedBundle = await refreshAccessToken(refreshToken);
      response = await perform(rotatedBundle.access_token);
    } catch {
      const unauthorizedResponse = NextResponse.json(
        { message: "Session expired. Please log in again." },
        { status: 401 },
      );
      clearSessionCookies(unauthorizedResponse);
      return unauthorizedResponse;
    }
  }

  const payload = await response.text();
  const proxiedResponse = new NextResponse(payload, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") ?? "application/json",
      "cache-control": "no-store",
    },
  });

  if (rotatedBundle) {
    try {
      const resources = await getResourcesWithAccessToken(rotatedBundle.access_token);
      const session = createSession(resources, rotatedBundle);
      setSessionCookies(proxiedResponse, rotatedBundle, session);
    } catch {
      const existingSession = await getSessionCookie();

      if (existingSession) {
        setSessionCookies(proxiedResponse, rotatedBundle, {
          ...existingSession,
          accessTokenExpiresAt: Date.now() + rotatedBundle.expires_in * 1000,
        });
      } else {
        proxiedResponse.cookies.set({
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          name: "rogo_access_token",
          value: rotatedBundle.access_token,
          maxAge: rotatedBundle.expires_in,
        });
        proxiedResponse.cookies.set({
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          name: "rogo_refresh_token",
          value: rotatedBundle.refresh_token,
          maxAge: 60 * 60 * 24 * 14,
        });
      }
    }
  }

  return proxiedResponse;
}
