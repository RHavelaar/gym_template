import type { GymConfig } from "@/config/types";
import { BRAND_IDENTITY_HELP, BRAND_SEO_FIELD_LABELS } from "@/lib/brand-help";

export const BRAND_TEXT_FIELD_KEYS = [
  "name",
  "tagline",
  "description",
  "metaTitle",
  "metaDescription",
  "ogTitle",
  "ogDescription",
  "twitterCard",
] as const;

export const BRAND_ASSET_FIELD_KEYS = ["logoUrl", "ogImageUrl", "faviconUrl", "appleTouchIconUrl"] as const;

export type BrandTextFieldKey = (typeof BRAND_TEXT_FIELD_KEYS)[number];
export type BrandAssetFieldKey = (typeof BRAND_ASSET_FIELD_KEYS)[number];
export type BrandReviewFieldKey = BrandTextFieldKey | BrandAssetFieldKey;

export const BRAND_FIELD_LABELS: Record<BrandReviewFieldKey, string> = {
  name: "Gym name",
  tagline: "Tagline",
  description: "Site description",
  metaTitle: BRAND_SEO_FIELD_LABELS.searchTitle,
  metaDescription: BRAND_SEO_FIELD_LABELS.searchDescription,
  ogTitle: BRAND_SEO_FIELD_LABELS.socialShareTitle,
  ogDescription: BRAND_SEO_FIELD_LABELS.socialShareDescription,
  twitterCard: BRAND_SEO_FIELD_LABELS.twitterCard,
  logoUrl: "Logo",
  ogImageUrl: BRAND_SEO_FIELD_LABELS.socialShareImage,
  faviconUrl: BRAND_SEO_FIELD_LABELS.favicon,
  appleTouchIconUrl: BRAND_SEO_FIELD_LABELS.appleTouchIcon,
};

export type AcceptedField = {
  fieldKey: BrandTextFieldKey;
  value: string;
  acceptedAt: number;
};

export const getFieldValueFromDraft = (draft: GymConfig, fieldKey: BrandReviewFieldKey): string => {
  switch (fieldKey) {
    case "name":
      return draft.name;
    case "tagline":
      return draft.tagline;
    case "description":
      return draft.description;
    case "metaTitle":
      return draft.seo.metaTitle;
    case "metaDescription":
      return draft.seo.metaDescription;
    case "ogTitle":
      return draft.seo.ogTitle;
    case "ogDescription":
      return draft.seo.ogDescription;
    case "twitterCard":
      return draft.seo.twitterCard;
    case "logoUrl":
      return draft.logoUrl;
    case "ogImageUrl":
      return draft.seo.ogImageUrl;
    case "faviconUrl":
      return draft.seo.faviconUrl;
    case "appleTouchIconUrl":
      return draft.seo.appleTouchIconUrl;
    default:
      return "";
  }
};

export const IDENTITY_FIELD_HELP = BRAND_IDENTITY_HELP;
