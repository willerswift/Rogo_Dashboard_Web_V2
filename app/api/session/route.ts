import { NextResponse } from "next/server";

import { toErrorResponse } from "@/lib/server/http";
import {
  createSession,
  getAccessTokenCookie,
  getRefreshTokenCookie,
  getSessionCookie,
  setSessionCookies,
} from "@/lib/server/session";
import { getResourcesWithAccessToken } from "@/lib/server/upstream";

export async function GET() {
  const session = await getSessionCookie();

  if (!session) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({ session });
}

export async function POST() {
  try {
    const accessToken = await getAccessTokenCookie();
    const refreshToken = await getRefreshTokenCookie();

    if (!accessToken || !refreshToken) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const resources = await getResourcesWithAccessToken(accessToken);
    const session = createSession(resources);
    const response = NextResponse.json({ session });

    response.cookies.set({
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      name: "rogo_session",
      value: JSON.stringify(session),
      maxAge: 60 * 60 * 24 * 14,
    });

    return response;
  } catch (error) {
    return toErrorResponse(error, 500);
  }
}
