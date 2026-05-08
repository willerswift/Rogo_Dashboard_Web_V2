import { describe, expect, it } from "vitest";

import { decodeJwtPayload, parseNumberList, slugify } from "@/lib/utils/parsing";

describe("parsing utilities", () => {
  it("decodes a jwt payload", () => {
    const payload = Buffer.from(JSON.stringify({ uid: "user-1", email: "test@example.com" })).toString(
      "base64url",
    );
    const token = `header.${payload}.signature`;

    expect(decodeJwtPayload(token)).toEqual({ uid: "user-1", email: "test@example.com" });
  });

  it("parses comma-separated number lists", () => {
    expect(parseNumberList("1, 2,foo, 3")).toEqual([1, 2, 3]);
  });

  it("slugifies human-readable text", () => {
    expect(slugify("My Demo Org")).toBe("my-demo-org");
  });
});
