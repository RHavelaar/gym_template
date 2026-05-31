import { describe, expect, it } from "vitest";
import { runDeterministicChecks } from "@/lib/brand-review/deterministic-checks";
import type { GymConfig } from "@/config/types";
import { DEFAULT_BRAND_SEO, DEFAULT_BRAND_TYPOGRAPHY } from "@/config/types";

const makeDraft = (overrides: Partial<GymConfig> = {}): GymConfig =>
  ({
    name: "Iron Asylum",
    tagline: "Train",
    description: "A".repeat(170),
    logoUrl: "",
    seo: {
      ...DEFAULT_BRAND_SEO,
      metaTitle: "X".repeat(65),
      metaDescription: "",
      ogImageUrl: "",
    },
    typography: DEFAULT_BRAND_TYPOGRAPHY,
    images: { hero: "" },
    ...overrides,
  }) as GymConfig;

describe("deterministic-checks", () => {
  it("flags meta title over 60 chars", () => {
    const results = runDeterministicChecks(makeDraft());
    const meta = results.find((r) => r.fieldKey === "metaTitle");
    expect(meta?.status).toBe("suggestion");
    expect(meta?.suggestedValue?.length).toBeLessThanOrEqual(60);
  });

  it("notes missing og image", () => {
    const results = runDeterministicChecks(makeDraft());
    const og = results.find((r) => r.fieldKey === "ogImageUrl");
    expect(og?.status).toBe("info");
    expect(og?.reason).toMatch(/upload/i);
  });

  it("flags missing logo", () => {
    const results = runDeterministicChecks(makeDraft({ logoUrl: "" }));
    expect(results.some((r) => r.fieldKey === "logoUrl")).toBe(true);
  });
});
