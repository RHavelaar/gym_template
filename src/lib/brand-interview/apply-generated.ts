import type { GymConfig } from "@/config/types";
import type { BrandGeneratedCopy, InterviewAnswers } from "@/lib/brand-interview/schema";
import type { BrandTextFieldKey } from "@/lib/brand-review/fields";
import { applyBrandReviewSuggestion } from "@/lib/brand-review/apply-suggestions";

export const applyGeneratedCopy = (
  draft: GymConfig,
  generated: BrandGeneratedCopy,
  selectedFieldKeys?: BrandTextFieldKey[],
): GymConfig => {
  const keys = selectedFieldKeys ?? generated.fields.map((f) => f.fieldKey as BrandTextFieldKey);

  let next = draft;
  for (const field of generated.fields) {
    if (!keys.includes(field.fieldKey as BrandTextFieldKey)) continue;
    if (!field.value.trim()) continue;
    next = applyBrandReviewSuggestion(next, field.fieldKey as BrandTextFieldKey, field.value);
  }
  return next;
};

export const generatedFieldsToAccepted = (generated: BrandGeneratedCopy, selectedFieldKeys?: BrandTextFieldKey[]) => {
  const keys = selectedFieldKeys ?? generated.fields.map((f) => f.fieldKey as BrandTextFieldKey);

  return generated.fields
    .filter((f) => keys.includes(f.fieldKey as BrandTextFieldKey) && f.value.trim())
    .map((f) => ({
      fieldKey: f.fieldKey as BrandTextFieldKey,
      value: f.value,
      acceptedAt: Date.now(),
    }));
};

export const formatInterviewForPrompt = (answers: InterviewAnswers) => ({
  gymName: answers.gymName,
  city: answers.city,
  differentiator: answers.differentiator,
  idealMember: answers.idealMember === "other" ? (answers.idealMemberOther ?? "general members") : answers.idealMember,
  vibe: answers.vibe,
  offerings: answers.offerings,
  extras: answers.extras ?? "",
});

export const BRAND_COPY_GENERATION_SYSTEM_PROMPT = `You are an expert copywriter for independent gyms and fitness studios.

Write brand copy from the owner's interview answers. Output all requested fields with clear, owner-friendly reasons.

Rules:
- Use only facts from the interview — do not invent cities, services, or claims.
- Meta title ≤60 characters; meta description ≤160 characters.
- Tagline: one short punchy line for the homepage hero area.
- Description: 150–160 characters ideal for Google snippets; mention city when provided.
- ogTitle/ogDescription may be blank with reason explaining inheritance from meta fields.
- twitterCard: use summary_large_image when a social share image is likely; otherwise summary.
- Every field must include a non-empty reason explaining your wording choices.
- Match tone to vibe chips (hardcore, welcoming, etc.).`;
