import { z } from "zod";
import { BRAND_ASSET_FIELD_KEYS, BRAND_TEXT_FIELD_KEYS, type BrandTextFieldKey } from "@/lib/brand-review/fields";

export const acceptedFieldSchema = z.object({
  fieldKey: z.enum(BRAND_TEXT_FIELD_KEYS),
  value: z.string(),
  acceptedAt: z.number(),
});

export const brandReviewInputSchema = z.object({
  name: z.string(),
  tagline: z.string(),
  description: z.string(),
  logoUrl: z.string(),
  seo: z.object({
    metaTitle: z.string(),
    metaDescription: z.string(),
    ogTitle: z.string(),
    ogDescription: z.string(),
    ogImageUrl: z.string(),
    twitterCard: z.enum(["summary", "summary_large_image"]),
    faviconUrl: z.string(),
    appleTouchIconUrl: z.string(),
  }),
  slug: z.string().optional(),
  acceptedFields: z.array(acceptedFieldSchema).optional(),
});

export type BrandReviewInput = z.infer<typeof brandReviewInputSchema>;

export const brandReviewFieldResultSchema = z.object({
  fieldKey: z.enum([...BRAND_TEXT_FIELD_KEYS, ...BRAND_ASSET_FIELD_KEYS]),
  status: z.enum(["good", "suggestion", "info"]),
  score: z.number().min(1).max(5),
  reason: z.string().min(1),
  suggestedValue: z.string().optional(),
});

export const brandReviewResultSchema = z.object({
  overallScore: z.number().min(0).max(100),
  overallLabel: z.enum(["excellent", "good", "needs_work", "weak"]),
  summary: z.string().min(1),
  categories: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      score: z.number().min(0).max(100),
      summary: z.string().min(1),
    }),
  ),
  fields: z.array(brandReviewFieldResultSchema),
});

export type BrandReviewFieldResult = z.infer<typeof brandReviewFieldResultSchema>;
export type BrandReviewResult = z.infer<typeof brandReviewResultSchema>;

export const llmReviewOutputSchema = z.object({
  overallScore: z.number().min(0).max(100),
  overallLabel: z.enum(["excellent", "good", "needs_work", "weak"]),
  summary: z.string().min(1),
  categories: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      score: z.number().min(0).max(100),
      summary: z.string().min(1),
    }),
  ),
  fields: z.array(
    z.object({
      fieldKey: z.enum(BRAND_TEXT_FIELD_KEYS),
      status: z.enum(["good", "suggestion", "info"]),
      score: z.number().min(1).max(5),
      reason: z.string().min(1),
      suggestedValue: z.string().optional(),
    }),
  ),
});

export type LlmReviewOutput = z.infer<typeof llmReviewOutputSchema>;

export const TEXT_FIELD_KEYS = BRAND_TEXT_FIELD_KEYS satisfies readonly BrandTextFieldKey[];
