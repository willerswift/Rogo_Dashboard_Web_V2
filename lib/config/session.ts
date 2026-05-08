import type { PartnerSession } from "@/lib/types/partner";

export const EMPTY_PARTNER_SESSION: PartnerSession = {
  userId: "",
  email: "",
  partnerIds: [],
  activePartnerId: null,
  partnerResources: [],
  projectResources: [],
};
