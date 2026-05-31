import { describe, expect, it, vi, afterEach } from "vitest";

describe("model-tiers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("defaults to development tier", async () => {
    vi.stubEnv("AI_MODEL_TIER", "");
    const { getAiModelTier, resolveBrandReviewModel } = await import("@/lib/ai/model-tiers");
    expect(getAiModelTier()).toBe("development");
    expect(resolveBrandReviewModel()).toBe("openai/gpt-4o-mini");
  });

  it("uses production defaults when tier is production", async () => {
    vi.stubEnv("AI_MODEL_TIER", "production");
    const { resolveBrandReviewModel } = await import("@/lib/ai/model-tiers");
    expect(resolveBrandReviewModel()).toBe("google/gemini-2.5-flash");
  });

  it("prefers global override over tier defaults", async () => {
    vi.stubEnv("AI_MODEL_TIER", "development");
    vi.stubEnv("BRAND_REVIEW_MODEL", "openai/gpt-4o");
    const { resolveBrandReviewModel } = await import("@/lib/ai/model-tiers");
    expect(resolveBrandReviewModel()).toBe("openai/gpt-4o");
  });

  it("uses tier-specific overrides when global override is unset", async () => {
    vi.stubEnv("AI_MODEL_TIER", "production");
    vi.stubEnv("BRAND_REVIEW_MODEL_PRODUCTION", "openai/gpt-4.1-mini");
    const { resolveBrandReviewModel } = await import("@/lib/ai/model-tiers");
    expect(resolveBrandReviewModel()).toBe("openai/gpt-4.1-mini");
  });
});
