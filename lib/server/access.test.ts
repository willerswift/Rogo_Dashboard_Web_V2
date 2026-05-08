import { describe, expect, it } from "vitest";

import { getAllowedNavigation, sessionHasPermission } from "@/lib/server/access";
import type { PartnerSession } from "@/lib/types/partner";

const session: PartnerSession = {
  userId: "owner-1",
  email: "owner@example.com",
  partnerIds: ["partner-1"],
  activePartnerId: "partner-1",
  partnerResources: ["authorization:partner-1"],
  projectResources: [
    {
      resources: ["partner:partner-1", "partner:partner-1:project/*"],
      actions: ["organization:view", "projectMgmt:*", "authorization:view"],
    },
  ],
};

describe("access helpers", () => {
  it("matches direct and wildcard permissions", () => {
    expect(sessionHasPermission(session, "organization:view")).toBe(true);
    expect(sessionHasPermission(session, "projectMgmt:edit")).toBe(true);
    expect(sessionHasPermission(session, "productDev:view")).toBe(false);
  });

  it("filters navigation from permissions", () => {
    expect(getAllowedNavigation(session).map((item) => item.title)).toEqual([
      "Organizations",
      "Projects",
      "Users",
      "Permissions",
    ]);
  });
});
