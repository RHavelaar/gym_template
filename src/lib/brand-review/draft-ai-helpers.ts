import type { GymConfig } from "@/config/types";
import type { AcceptedField } from "@/lib/brand-review/fields";
import { pruneAcceptedOnFieldEdit } from "@/lib/brand-review/accepted-fields";
import type { BrandTextFieldKey } from "@/lib/brand-review/fields";

export const hasExistingBrandCopy = (draft: GymConfig) =>
  Boolean(
    draft.tagline.trim() || draft.description.trim() || draft.seo.metaTitle.trim() || draft.seo.metaDescription.trim(),
  );

export const buildReviewInput = (draft: GymConfig, acceptedFields: AcceptedField[]) => ({
  name: draft.name,
  tagline: draft.tagline,
  description: draft.description,
  logoUrl: draft.logoUrl,
  seo: draft.seo,
  slug: draft.slug,
  acceptedFields,
});

export const patchDraftField = (draft: GymConfig, fieldKey: BrandTextFieldKey, value: string): GymConfig => {
  switch (fieldKey) {
    case "name":
      return { ...draft, name: value };
    case "tagline":
      return { ...draft, tagline: value };
    case "description":
      return { ...draft, description: value };
    case "metaTitle":
      return { ...draft, seo: { ...draft.seo, metaTitle: value } };
    case "metaDescription":
      return { ...draft, seo: { ...draft.seo, metaDescription: value } };
    case "ogTitle":
      return { ...draft, seo: { ...draft.seo, ogTitle: value } };
    case "ogDescription":
      return { ...draft, seo: { ...draft.seo, ogDescription: value } };
    case "twitterCard":
      return {
        ...draft,
        seo: {
          ...draft.seo,
          twitterCard: value as GymConfig["seo"]["twitterCard"],
        },
      };
    default:
      return draft;
  }
};

export const updateDraftTextField = (
  draft: GymConfig,
  acceptedFields: AcceptedField[],
  fieldKey: BrandTextFieldKey,
  value: string,
): { draft: GymConfig; acceptedFields: AcceptedField[] } => ({
  draft: patchDraftField(draft, fieldKey, value),
  acceptedFields: pruneAcceptedOnFieldEdit(acceptedFields, fieldKey),
});

export const scrollToFirstSuggestion = () => {
  const el = document.querySelector("[data-brand-review-suggestion]");
  el?.scrollIntoView({ behavior: "smooth", block: "center" });
};
