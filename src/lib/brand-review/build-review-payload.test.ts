import { describe, expect, it } from "vitest";
import { buildReviewPayload, formatPayloadForPrompt } from "@/lib/brand-review/build-review-payload";
import { DEFAULT_BRAND_SEO } from "@/config/types";

describe("build-review-payload", () => {
  it("uses resolveSeo fallbacks in formatted payload", () => {
    const input = {
      name: "Iron Asylum",
      tagline: "Train",
      description: "Best gym in Austin.",
      logoUrl: "/logo.png",
      seo: { ...DEFAULT_BRAND_SEO, metaTitle: "", metaDescription: "" },
      slug: "iron-asylum",
      images: { hero: "" },
    };
    const payload = buildReviewPayload(input, []);
    const formatted = formatPayloadForPrompt(payload);
    expect(formatted.effectiveMetaTitle).toBe("Iron Asylum");
    expect(formatted.effectiveMetaDescription).toBe("Best gym in Austin.");
  });

  it("excludes stable accepted fields from llm list", () => {
    const input = {
      name: "Gym",
      tagline: "T",
      description: "D",
      logoUrl: "",
      seo: DEFAULT_BRAND_SEO,
      images: { hero: "" },
    };
    const payload = buildReviewPayload(input, [{ fieldKey: "description", value: "D" }]);
    expect(payload.fieldsForLlm).not.toContain("description");
  });
});
