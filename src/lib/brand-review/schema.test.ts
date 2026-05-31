import { describe, expect, it } from "vitest";
import { brandReviewResultSchema, llmReviewOutputSchema } from "@/lib/brand-review/schema";

describe("brand-review schema", () => {
  it("accepts valid llm output with reasons", () => {
    const result = llmReviewOutputSchema.safeParse({
      overallScore: 80,
      overallLabel: "good",
      summary: "Solid copy overall.",
      categories: [{ id: "search", label: "Search", score: 80, summary: "Titles look good." }],
      fields: [
        {
          fieldKey: "tagline",
          status: "good",
          score: 5,
          reason: "Clear and punchy.",
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects field missing reason", () => {
    const result = llmReviewOutputSchema.safeParse({
      overallScore: 80,
      overallLabel: "good",
      summary: "Ok",
      categories: [],
      fields: [
        {
          fieldKey: "tagline",
          status: "good",
          score: 5,
          reason: "",
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("parses full review result with asset fields", () => {
    const result = brandReviewResultSchema.safeParse({
      overallScore: 70,
      overallLabel: "good",
      summary: "Summary",
      categories: [],
      fields: [
        {
          fieldKey: "ogImageUrl",
          status: "info",
          score: 3,
          reason: "Add a share image.",
        },
      ],
    });
    expect(result.success).toBe(true);
  });
});
