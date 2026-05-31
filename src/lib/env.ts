import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_GYM_SLUG: z.string().default("iron-asylum"),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),
  CLERK_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  /** Current Supabase key (publishable). Legacy anon key still accepted as fallback. */
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  /** Legacy server-only key (JWT). Prefer SUPABASE_SECRET_KEY. */
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  /** Current Supabase secret key (`sb_secret_...`) — server-only, bypasses RLS. */
  SUPABASE_SECRET_KEY: z.string().optional(),
  /** From Clerk Dashboard → Webhooks → endpoint Signing secret (`whsec_...`). */
  CLERK_WEBHOOK_SIGNING_SECRET: z.string().optional(),
  /** Vercel AI Gateway — server-only static key (optional if OIDC is set). */
  AI_GATEWAY_API_KEY: z.string().optional(),
  /** Short-lived JWT from `vercel env pull` — preferred for local AI Gateway auth. */
  VERCEL_OIDC_TOKEN: z.string().optional(),
  /** `development` (default) or `production` — selects model preset pair. */
  AI_MODEL_TIER: z.enum(["development", "production"]).optional(),
  /** Override review model for any tier (wins over tier presets). */
  BRAND_REVIEW_MODEL: z.string().optional(),
  BRAND_REVIEW_MODEL_DEVELOPMENT: z.string().optional(),
  BRAND_REVIEW_MODEL_PRODUCTION: z.string().optional(),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_GYM_SLUG: process.env.NEXT_PUBLIC_GYM_SLUG,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
  CLERK_WEBHOOK_SIGNING_SECRET: process.env.CLERK_WEBHOOK_SIGNING_SECRET ?? process.env.CLERK_WEBHOOK_SECRET,
  AI_GATEWAY_API_KEY: process.env.AI_GATEWAY_API_KEY,
  VERCEL_OIDC_TOKEN: process.env.VERCEL_OIDC_TOKEN,
  AI_MODEL_TIER: process.env.AI_MODEL_TIER?.trim() || undefined,
  BRAND_REVIEW_MODEL: process.env.BRAND_REVIEW_MODEL,
  BRAND_REVIEW_MODEL_DEVELOPMENT: process.env.BRAND_REVIEW_MODEL_DEVELOPMENT,
  BRAND_REVIEW_MODEL_PRODUCTION: process.env.BRAND_REVIEW_MODEL_PRODUCTION,
});

/** Supabase Data API key for browser and server clients (publishable preferred). */
export const getSupabasePublicKey = () =>
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? null;

export const hasSupabase = Boolean(env.NEXT_PUBLIC_SUPABASE_URL) && Boolean(getSupabasePublicKey());

export const hasClerk = Boolean(env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

/** Supabase elevated key for trusted server code (webhooks). Never expose publicly. */
export const getSupabaseSecretKey = () => env.SUPABASE_SECRET_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY ?? null;

export const hasSupabaseSecretKey = () => Boolean(getSupabaseSecretKey());

export const hasAiGateway = Boolean(env.AI_GATEWAY_API_KEY ?? env.VERCEL_OIDC_TOKEN);

export {
  getAiModelTier,
  getBrandAiModelConfig,
  resolveBrandReviewModel,
  type AiModelTier,
  type BrandAiModelConfig,
} from "@/lib/ai/model-tiers";
