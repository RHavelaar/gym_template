import { describe, expect, it } from "vitest";
import type { GymBusinessInfo } from "@/config/types";
import { DEFAULT_BUSINESS_VISIBILITY, normalizeBusinessInfo, resolveHelpEmail } from "@/lib/business-info";

const baseBusiness: GymBusinessInfo = {
  hours: [{ day: "Mon", open: "9 AM", close: "5 PM" }],
  membershipBlurb: "Join us.",
  generalEmail: "info@example.com",
  helpEmail: "help@example.com",
  contactPhone: "(555) 555-0100",
  address: { line1: "1 Main St", line2: "", city: "Town", state: "TX", zip: "75001" },
  links: [],
  visibility: DEFAULT_BUSINESS_VISIBILITY,
};

describe("normalizeBusinessInfo", () => {
  it("maps legacy contactEmail to generalEmail", () => {
    const result = normalizeBusinessInfo(baseBusiness, {
      contactEmail: "legacy@example.com",
      generalEmail: undefined,
    } as Parameters<typeof normalizeBusinessInfo>[1]);

    expect(result.generalEmail).toBe("legacy@example.com");
  });

  it("falls back help email to general when help is blank", () => {
    const result = normalizeBusinessInfo(baseBusiness, { helpEmail: "" });
    expect(resolveHelpEmail(result)).toBe("info@example.com");
  });

  it("prefers gym row phone and email when overlay omits them", () => {
    const result = normalizeBusinessInfo(
      { ...baseBusiness, generalEmail: "", contactPhone: "" },
      {},
      { phone: "(111) 111-1111", email: "gym@example.com" },
    );

    expect(result.contactPhone).toBe("(111) 111-1111");
    expect(result.generalEmail).toBe("gym@example.com");
  });
});
