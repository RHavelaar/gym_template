import { describe, expect, it } from "vitest";
import { applyGeneratedCopy, generatedFieldsToAccepted } from "@/lib/brand-interview/apply-generated";
import type { BrandGeneratedCopy } from "@/lib/brand-interview/schema";
import type { GymConfig } from "@/config/types";
import { DEFAULT_BRAND_SEO, DEFAULT_BRAND_TYPOGRAPHY } from "@/config/types";

const draft = (): GymConfig =>
  ({
    name: "Gym",
    tagline: "",
    description: "",
    logoUrl: "",
    seo: { ...DEFAULT_BRAND_SEO },
    typography: DEFAULT_BRAND_TYPOGRAPHY,
  }) as GymConfig;

const generated: BrandGeneratedCopy = {
  summary: "Done",
  fields: [
    { fieldKey: "tagline", value: "Train bold", reason: "Punchy hero line." },
    { fieldKey: "description", value: "Best gym.", reason: "Local SEO." },
  ],
};

describe("apply-generated", () => {
  it("applies all generated fields", () => {
    const next = applyGeneratedCopy(draft(), generated);
    expect(next.tagline).toBe("Train bold");
    expect(next.description).toBe("Best gym.");
  });

  it("applies partial selection", () => {
    const next = applyGeneratedCopy(draft(), generated, ["tagline"]);
    expect(next.tagline).toBe("Train bold");
    expect(next.description).toBe("");
  });

  it("builds accepted field records", () => {
    const accepted = generatedFieldsToAccepted(generated);
    expect(accepted).toHaveLength(2);
    expect(accepted[0]?.fieldKey).toBe("tagline");
  });
});
