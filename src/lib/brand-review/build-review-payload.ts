import type { GymConfig } from "@/config/types";
import { resolveSeo } from "@/lib/brand-settings";
import type { BrandReviewInput } from "@/lib/brand-review/schema";
import type { BrandTextFieldKey } from "@/lib/brand-review/fields";

export type ReviewPayload = {
  slug: string;
  identity: {
    name: string;
    tagline: string;
    description: string;
  };
  resolvedSeo: ReturnType<typeof resolveSeo>;
  rawSeo: GymConfig["seo"];
  logoUrl: string;
  fieldsForLlm: BrandTextFieldKey[];
  stableAccepted: { fieldKey: BrandTextFieldKey; value: string }[];
};

export const buildReviewPayload = (
  input: BrandReviewInput,
  stableAccepted: { fieldKey: BrandTextFieldKey; value: string }[],
): ReviewPayload => {
  const draft = input as GymConfig;
  const resolvedSeo = resolveSeo(draft);
  const excludeKeys = stableAccepted.map((a) => a.fieldKey);
  const allTextKeys = [
    "name",
    "tagline",
    "description",
    "metaTitle",
    "metaDescription",
    "ogTitle",
    "ogDescription",
    "twitterCard",
  ] as BrandTextFieldKey[];

  return {
    slug: input.slug ?? "gym",
    identity: {
      name: input.name,
      tagline: input.tagline,
      description: input.description,
    },
    resolvedSeo,
    rawSeo: input.seo,
    logoUrl: input.logoUrl,
    fieldsForLlm: allTextKeys.filter((k) => !excludeKeys.includes(k)),
    stableAccepted,
  };
};

export const formatPayloadForPrompt = (payload: ReviewPayload) => {
  const { identity, resolvedSeo, rawSeo } = payload;
  return {
    gymName: identity.name,
    tagline: identity.tagline,
    description: identity.description,
    effectiveMetaTitle: resolvedSeo.metaTitle,
    effectiveMetaDescription: resolvedSeo.metaDescription,
    effectiveOgTitle: resolvedSeo.ogTitle,
    effectiveOgDescription: resolvedSeo.ogDescription,
    rawOverrides: {
      metaTitle: rawSeo.metaTitle.trim() || null,
      metaDescription: rawSeo.metaDescription.trim() || null,
      ogTitle: rawSeo.ogTitle.trim() || null,
      ogDescription: rawSeo.ogDescription.trim() || null,
    },
    twitterCard: rawSeo.twitterCard,
    hasOgImage: Boolean(rawSeo.ogImageUrl.trim() || payload.logoUrl),
    hasLogo: Boolean(payload.logoUrl.trim()),
    hasFavicon: Boolean(rawSeo.faviconUrl.trim() || payload.logoUrl),
  };
};
