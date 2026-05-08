import "server-only";

import { NextResponse } from "next/server";

import { UpstreamError } from "@/lib/server/upstream";

export function toErrorMessage(error: unknown) {
  if (error instanceof UpstreamError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected server error";
}

export function toErrorResponse(error: unknown, fallbackStatus = 500) {
  if (error instanceof UpstreamError) {
    return NextResponse.json(
      { message: error.message, details: error.details },
      { status: error.status },
    );
  }

  return NextResponse.json({ message: toErrorMessage(error) }, { status: fallbackStatus });
}
