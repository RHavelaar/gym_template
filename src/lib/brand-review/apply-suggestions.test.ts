import { describe, expect, it } from "vitest";
import { applyAllBrandReviewSuggestions, applyBrandReviewSuggestion } from "@/lib/brand-review/apply-suggestions";
import type { BrandReviewFieldResult } from "@/lib/brand-review/schema";
import type { GymConfig } from "@/config/types";
import { DEFAULT_BRAND_SEO, DEFAULT_BRAND_TYPOGRAPHY } from "@/config/types";

const draft = (): GymConfig =>
  ({
    name: "Gym",
    tagline: "Old",
    description: "Old desc",
    logoUrl: "",
    seo: { ...DEFAULT_BRAND_SEO },
    typography: DEFAULT_BRAND_TYPOGRAPHY,
  }) as GymConfig;

describe("apply-suggestions", () => {
  it("applies single field", () => {
    const next = applyBrandReviewSuggestion(draft(), "tagline", "New tagline");
    expect(next.tagline).toBe("New tagline");
  });

  it("applies all suggestion fields", () => {
    const fields: BrandReviewFieldResult[] = [
      {
        fieldKey: "tagline",
        status: "suggestion",
        score: 3,
        reason: "Better",
        suggestedValue: "Train bold",
      },
      {
        fieldKey: "description",
        status: "good",
        score: 5,
        reason: "Fine",
      },
    ];
    const next = applyAllBrandReviewSuggestions(draft(), fields);
    expect(next.tagline).toBe("Train bold");
    expect(next.description).toBe("Old desc");
  });
});
