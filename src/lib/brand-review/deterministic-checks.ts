import type { GymConfig } from "@/config/types";
import { resolveSeo } from "@/lib/brand-settings";
import type { BrandReviewFieldResult } from "@/lib/brand-review/schema";
import type { BrandReviewFieldKey } from "@/lib/brand-review/fields";

const META_TITLE_MAX = 60;
const META_DESC_MAX = 160;

export const runDeterministicChecks = (draft: GymConfig): BrandReviewFieldResult[] => {
  const resolved = resolveSeo(draft);
  const results: BrandReviewFieldResult[] = [];

  if (resolved.metaTitle.length > META_TITLE_MAX) {
    results.push({
      fieldKey: "metaTitle",
      status: "suggestion",
      score: 2,
      reason: `Search titles over ${META_TITLE_MAX} characters may get cut off in Google results.`,
      suggestedValue: resolved.metaTitle.slice(0, META_TITLE_MAX).trim(),
    });
  }

  if (resolved.metaDescription.length > META_DESC_MAX) {
    results.push({
      fieldKey: "metaDescription",
      status: "suggestion",
      score: 2,
      reason: `Search descriptions over ${META_DESC_MAX} characters are often truncated in results.`,
      suggestedValue: resolved.metaDescription.slice(0, META_DESC_MAX).trim(),
    });
  }

  const metaTitle = draft.seo.metaTitle.trim();
  const ogTitle = draft.seo.ogTitle.trim();
  if (metaTitle && ogTitle && metaTitle.toLowerCase() === ogTitle.toLowerCase()) {
    results.push({
      fieldKey: "ogTitle",
      status: "info",
      score: 4,
      reason: "Social share title matches your search title — that is fine, or you can make social copy punchier.",
    });
  }

  const metaDesc = draft.seo.metaDescription.trim();
  const ogDesc = draft.seo.ogDescription.trim();
  if (metaDesc && ogDesc && metaDesc.toLowerCase() === ogDesc.toLowerCase()) {
    results.push({
      fieldKey: "ogDescription",
      status: "info",
      score: 4,
      reason: "Social description matches your search description — works well for consistency.",
    });
  }

  if (!draft.seo.metaTitle.trim()) {
    results.push({
      fieldKey: "metaTitle",
      status: "info",
      score: 4,
      reason: "Blank here, so your gym name is used as the search title — that works if your name is clear and local.",
    });
  }

  if (!draft.seo.metaDescription.trim()) {
    results.push({
      fieldKey: "metaDescription",
      status: "info",
      score: 4,
      reason: "Blank here, so your site description is used in search results — make sure that description is strong.",
    });
  }

  if (!draft.seo.ogImageUrl.trim() && !draft.images?.hero) {
    results.push({
      fieldKey: "ogImageUrl",
      status: "info",
      score: 3,
      reason:
        "A dedicated social share image (1200×630) makes links look professional when members share your site — upload one when you have a strong gym photo or graphic.",
    });
  }

  if (!draft.logoUrl.trim()) {
    results.push({
      fieldKey: "logoUrl",
      status: "info",
      score: 2,
      reason: "A logo appears in your header, sign-in screen, and brand kit — upload one when you are ready.",
    });
  }

  if (!draft.seo.faviconUrl.trim() && !draft.logoUrl.trim()) {
    results.push({
      fieldKey: "faviconUrl",
      status: "info",
      score: 3,
      reason: "A favicon helps members spot your site among open browser tabs — upload a simple square mark.",
    });
  }

  return results;
};

export const getDeterministicForField = (
  draft: GymConfig,
  fieldKey: BrandReviewFieldKey,
): BrandReviewFieldResult | undefined => runDeterministicChecks(draft).find((r) => r.fieldKey === fieldKey);
