import { NextResponse } from "next/server";
import { z } from "zod";

import { toErrorResponse } from "@/lib/server/http";
import { getSessionCookie, ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/server/session";
import type { PartnerSession } from "@/lib/types/partner";
import { cookies } from "next/headers";

const schema = z.object({
  activePartnerId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const { activePartnerId } = schema.parse(await request.json());
    const session = await getSessionCookie();

    if (!session) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    // Validate that the user actually has access to this partner
    if (!session.partnerIds.includes(activePartnerId)) {
      return NextResponse.json({ message: "Forbidden: No access to this partner" }, { status: 403 });
    }

    // Update the active partner ID
    const updatedSession: PartnerSession = {
      ...session,
      activePartnerId,
    };

    const response = NextResponse.json({ session: updatedSession });

    // We need the tokens to re-set the cookies.
    // They are already in the browser cookies, so we can just pass them back if they exist.
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

    if (accessToken && refreshToken) {
        // Construct a partial TokenBundle for setSessionCookies
        // Note: expires_in is not easily available from the cookie unless we decode it, 
        // but setSessionCookies uses it for maxAge.
        // For simplicity, we can assume the existing cookies are still valid.
        
        // Actually, setSessionCookies requires a full TokenBundle. 
        // Let's see if we can just update the SESSION_COOKIE specifically.
        
        const SESSION_COOKIE_NAME = "rogo_session";
        response.cookies.set({
            name: SESSION_COOKIE_NAME,
            value: JSON.stringify(updatedSession),
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24 * 14,
        });
    } else {
        return NextResponse.json({ message: "Tokens missing" }, { status: 401 });
    }

    return response;
  } catch (error) {
    return toErrorResponse(error, 400);
  }
}
