import { describe, expect, it } from "vitest";

import { createSession, derivePartnerIds } from "@/lib/server/session";
import type { UserResourcesResponse } from "@/lib/types/partner";

const resources: UserResourcesResponse = {
  userId: "user-123",
  email: "tester@example.com",
  partnerResources: ["authorization:partner-123"],
  projectResources: [
    {
      resources: ["partner:partner-123", "partner:partner-123:project/*"],
      actions: ["authorization:view"],
    },
  ],
};

describe("session helpers", () => {
  it("derives partner ids from permission resources", () => {
    expect(derivePartnerIds(resources)).toEqual(["partner-123"]);
  });

  it("creates an app session from resources", () => {
    const session = createSession(resources, {
      access_token: [
        "header",
        Buffer.from(JSON.stringify({ uid: "user-123", email: "tester@example.com" })).toString(
          "base64url",
        ),
        "signature",
      ].join("."),
      refresh_token: "refresh",
      token_type: "Bearer",
      expires_in: 3600,
    });

    expect(session.userId).toBe("user-123");
    expect(session.activePartnerId).toBe("partner-123");
  });
});
