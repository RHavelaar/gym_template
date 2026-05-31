import { env } from "@/lib/env";

/** Which preset model brand AI copy features use. */
export const AI_MODEL_TIERS = ["development", "production"] as const;

export type AiModelTier = (typeof AI_MODEL_TIERS)[number];

/**
 * Curated defaults on Vercel AI Gateway (May 2026).
 *
 * Review / copy generation — structured JSON, short outputs:
 * - development: gpt-4o-mini — cheapest strong option (~$0.15/$0.60 per 1M tokens)
 * - production: gemini-2.5-flash — better instruction-following, still economical
 */
export const DEFAULT_BRAND_REVIEW_MODELS: Record<AiModelTier, string> = {
  development: "openai/gpt-4o-mini",
  production: "google/gemini-2.5-flash",
};

export const parseAiModelTier = (value: string | undefined): AiModelTier =>
  value === "production" ? "production" : "development";

export const getAiModelTier = (): AiModelTier => parseAiModelTier(env.AI_MODEL_TIER);

const tierReviewOverride = (tier: AiModelTier): string | undefined =>
  tier === "production" ? env.BRAND_REVIEW_MODEL_PRODUCTION : env.BRAND_REVIEW_MODEL_DEVELOPMENT;

/** Global override → tier override → tier default. */
export const resolveBrandReviewModel = (tier: AiModelTier = getAiModelTier()): string =>
  env.BRAND_REVIEW_MODEL?.trim() || tierReviewOverride(tier)?.trim() || DEFAULT_BRAND_REVIEW_MODELS[tier];

export type BrandAiModelConfig = {
  tier: AiModelTier;
  reviewModel: string;
};

export const getBrandAiModelConfig = (): BrandAiModelConfig => {
  const tier = getAiModelTier();
  return {
    tier,
    reviewModel: resolveBrandReviewModel(tier),
  };
};
