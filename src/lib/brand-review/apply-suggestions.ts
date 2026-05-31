import type { GymConfig } from "@/config/types";
import type { BrandReviewFieldResult } from "@/lib/brand-review/schema";
import type { BrandTextFieldKey } from "@/lib/brand-review/fields";

export const applyBrandReviewSuggestion = (
  draft: GymConfig,
  fieldKey: BrandTextFieldKey,
  suggestedValue: string,
): GymConfig => {
  switch (fieldKey) {
    case "name":
      return { ...draft, name: suggestedValue };
    case "tagline":
      return { ...draft, tagline: suggestedValue };
    case "description":
      return { ...draft, description: suggestedValue };
    case "metaTitle":
      return { ...draft, seo: { ...draft.seo, metaTitle: suggestedValue } };
    case "metaDescription":
      return { ...draft, seo: { ...draft.seo, metaDescription: suggestedValue } };
    case "ogTitle":
      return { ...draft, seo: { ...draft.seo, ogTitle: suggestedValue } };
    case "ogDescription":
      return { ...draft, seo: { ...draft.seo, ogDescription: suggestedValue } };
    case "twitterCard":
      return {
        ...draft,
        seo: {
          ...draft.seo,
          twitterCard: suggestedValue as GymConfig["seo"]["twitterCard"],
        },
      };
    default:
      return draft;
  }
};

export const applyAllBrandReviewSuggestions = (draft: GymConfig, fields: BrandReviewFieldResult[]): GymConfig => {
  let next = draft;
  for (const field of fields) {
    if (field.status !== "suggestion" || !field.suggestedValue) continue;
    if (
      field.fieldKey === "logoUrl" ||
      field.fieldKey === "ogImageUrl" ||
      field.fieldKey === "faviconUrl" ||
      field.fieldKey === "appleTouchIconUrl"
    ) {
      continue;
    }
    next = applyBrandReviewSuggestion(next, field.fieldKey as BrandTextFieldKey, field.suggestedValue);
  }
  return next;
};

export const getApplicableSuggestions = (fields: BrandReviewFieldResult[]): BrandReviewFieldResult[] =>
  fields.filter((f) => f.status === "suggestion" && Boolean(f.suggestedValue));
