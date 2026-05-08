import { z } from "zod";
import { NextResponse } from "next/server";

import { toErrorResponse } from "@/lib/server/http";
import { createSession, setSessionCookies } from "@/lib/server/session";
import { fetchJsonFromUpstream, getResourcesWithAccessToken } from "@/lib/server/upstream";
import type { TokenBundle } from "@/lib/types/partner";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = loginSchema.parse(await request.json());
    const tokenBundle = await fetchJsonFromUpstream<TokenBundle>("/partner/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const resources = await getResourcesWithAccessToken(tokenBundle.access_token);
    const session = createSession(resources, tokenBundle);
    const response = NextResponse.json({ session });

    setSessionCookies(response, tokenBundle, session);
    return response;
  } catch (error) {
    return toErrorResponse(error, 400);
  }
}
