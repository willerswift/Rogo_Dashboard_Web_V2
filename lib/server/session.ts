import "server-only";

import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

import type {
  JwtPayload,
  PartnerSession,
  TokenBundle,
  UserResourcesResponse,
} from "@/lib/types/partner";
import { decodeJwtPayload } from "@/lib/utils/parsing";
import { isSecureCookie } from "@/lib/server/env";

export const ACCESS_TOKEN_COOKIE = "rogo_access_token";
export const REFRESH_TOKEN_COOKIE = "rogo_refresh_token";
export const SESSION_COOKIE = "rogo_session";

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: isSecureCookie(),
  path: "/",
};

export async function getAccessTokenCookie() {
  return (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export async function getRefreshTokenCookie() {
  return (await cookies()).get(REFRESH_TOKEN_COOKIE)?.value ?? null;
}

export async function getSessionCookie() {
  const value = (await cookies()).get(SESSION_COOKIE)?.value;

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as PartnerSession;
  } catch {
    return null;
  }
}

export function readJwt(token: string) {
  return decodeJwtPayload(token) as JwtPayload;
}

export function derivePartnerIds(resources: UserResourcesResponse) {
  const collected = new Set<string>();

  for (const resource of resources.partnerResources) {
    const partnerId = resource.split(":").at(-1);
    if (partnerId) {
      collected.add(partnerId);
    }
  }

  for (const entry of resources.projectResources) {
    for (const resource of entry.resources) {
      const match = resource.match(/^partner:([^:]+)/);
      if (match?.[1]) {
        collected.add(match[1]);
      }
    }
  }

  return Array.from(collected);
}

export function createSession(resources: UserResourcesResponse, tokenBundle?: TokenBundle) {
  const partnerIds = derivePartnerIds(resources);
  const payload = tokenBundle?.access_token ? readJwt(tokenBundle.access_token) : undefined;
  const expiresAt = tokenBundle?.expires_in
    ? Date.now() + tokenBundle.expires_in * 1000
    : undefined;

  return {
    userId: resources.userId || String(payload?.uid || payload?.user_id || ""),
    email: resources.email || String(payload?.email || ""),
    partnerIds,
    activePartnerId: partnerIds[0] ?? null,
    partnerResources: resources.partnerResources,
    projectResources: resources.projectResources,
    accessTokenExpiresAt: expiresAt,
  } satisfies PartnerSession;
}

export function setSessionCookies(
  response: NextResponse,
  tokenBundle: TokenBundle,
  session: PartnerSession,
) {
  response.cookies.set({
    ...COOKIE_OPTIONS,
    name: ACCESS_TOKEN_COOKIE,
    value: tokenBundle.access_token,
    maxAge: tokenBundle.expires_in,
  });

  response.cookies.set({
    ...COOKIE_OPTIONS,
    name: REFRESH_TOKEN_COOKIE,
    value: tokenBundle.refresh_token,
    maxAge: 60 * 60 * 24 * 14,
  });

  response.cookies.set({
    ...COOKIE_OPTIONS,
    name: SESSION_COOKIE,
    value: JSON.stringify(session),
    maxAge: 60 * 60 * 24 * 14,
  });
}

export function clearSessionCookies(response: NextResponse) {
  response.cookies.set({ ...COOKIE_OPTIONS, name: ACCESS_TOKEN_COOKIE, value: "", maxAge: 0 });
  response.cookies.set({ ...COOKIE_OPTIONS, name: REFRESH_TOKEN_COOKIE, value: "", maxAge: 0 });
  response.cookies.set({ ...COOKIE_OPTIONS, name: SESSION_COOKIE, value: "", maxAge: 0 });
}
