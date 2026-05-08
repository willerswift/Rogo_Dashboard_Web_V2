import { NextRequest, NextResponse } from "next/server";

import { toErrorResponse } from "@/lib/server/http";
import { getAccessTokenCookie, getRefreshTokenCookie } from "@/lib/server/session";
import { withUpstreamAuthRetry } from "@/lib/server/upstream";

const ALLOWED_TOP_LEVEL_PATHS = new Set([
  "organization",
  "project",
  "product",
  "product-admin",
  "user",
  "permission",
]);

async function handleProxy(request: NextRequest, segments: string[]) {
  try {
    const topLevelPath = segments[0];

    if (!topLevelPath || !ALLOWED_TOP_LEVEL_PATHS.has(topLevelPath)) {
      return NextResponse.json({ message: "Unsupported partner route" }, { status: 404 });
    }

    const accessToken = await getAccessTokenCookie();
    const refreshToken = await getRefreshTokenCookie();

    if (!accessToken || !refreshToken) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const body = ["GET", "HEAD"].includes(request.method) ? undefined : await request.text();

    return await withUpstreamAuthRetry({
      path: `/partner/${segments.join("/")}`,
      method: request.method,
      search: request.nextUrl.search,
      body,
      contentType: request.headers.get("content-type"),
    });
  } catch (error) {
    return toErrorResponse(error, 500);
  }
}

type ProxyRouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

export async function GET(request: NextRequest, context: ProxyRouteContext) {
  return handleProxy(request, (await context.params).path);
}

export async function POST(request: NextRequest, context: ProxyRouteContext) {
  return handleProxy(request, (await context.params).path);
}

export async function PATCH(request: NextRequest, context: ProxyRouteContext) {
  return handleProxy(request, (await context.params).path);
}

export async function DELETE(request: NextRequest, context: ProxyRouteContext) {
  return handleProxy(request, (await context.params).path);
}
