import type { JsonValue } from "@/lib/types/partner";

export function decodeJwtPayload(token: string) {
  const payload = token.split(".")[1];

  if (!payload) {
    throw new Error("Invalid JWT payload");
  }

  const json = Buffer.from(payload, "base64url").toString("utf8");
  return JSON.parse(json) as Record<string, JsonValue>;
}

export function parseJsonInput<T>(value: string, fallback: T): T {
  if (!value.trim()) {
    return fallback;
  }

  return JSON.parse(value) as T;
}

export function parseNumberList(value: string) {
  if (!value.trim()) {
    return [] as number[];
  }

  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => Number(entry))
    .filter((entry) => !Number.isNaN(entry));
}

export function stringifyJson(value: unknown) {
  return JSON.stringify(value ?? {}, null, 2);
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
