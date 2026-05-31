import { z } from "zod";
import { BRAND_TEXT_FIELD_KEYS } from "@/lib/brand-review/fields";

export const interviewAnswersSchema = z.object({
  gymName: z.string().min(1),
  city: z.string().min(1),
  differentiator: z.string().min(1),
  idealMember: z.string().min(1),
  idealMemberOther: z.string().optional(),
  vibe: z.array(z.string()).min(1),
  offerings: z.array(z.string()).min(1),
  extras: z.string().optional(),
});

export type InterviewAnswers = z.infer<typeof interviewAnswersSchema>;

export const brandGeneratedFieldSchema = z.object({
  fieldKey: z.enum(BRAND_TEXT_FIELD_KEYS),
  value: z.string(),
  reason: z.string().min(1),
});

export const brandGeneratedCopySchema = z.object({
  summary: z.string().min(1),
  fields: z.array(brandGeneratedFieldSchema),
});

export const llmGeneratedCopySchema = brandGeneratedCopySchema;

export type BrandGeneratedCopy = z.infer<typeof brandGeneratedCopySchema>;
export type BrandGeneratedField = z.infer<typeof brandGeneratedFieldSchema>;

export const generateBrandCopyInputSchema = z.object({
  answers: interviewAnswersSchema,
  existingDraft: z
    .object({
      name: z.string(),
      tagline: z.string(),
      description: z.string(),
      hasOgImage: z.boolean().optional(),
    })
    .optional(),
});

export type GenerateBrandCopyInput = z.infer<typeof generateBrandCopyInputSchema>;
