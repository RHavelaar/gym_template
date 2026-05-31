import { DEFAULT_CONTACT_PAGE_SETTINGS, type ContactPageFaqItem, type ContactPageSettings } from "@/config/types";

const normalizeFaqItems = (items: unknown): ContactPageFaqItem[] => {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      if (typeof item !== "object" || item === null) return null;
      const row = item as Record<string, unknown>;
      const question = typeof row.question === "string" ? row.question.trim() : "";
      const answer = typeof row.answer === "string" ? row.answer.trim() : "";
      if (!question || !answer) return null;
      return { question, answer };
    })
    .filter((item): item is ContactPageFaqItem => item !== null);
};

export const mergeContactPageSettings = (
  base: ContactPageSettings,
  overlay?: Partial<ContactPageSettings> | Record<string, unknown> | null,
): ContactPageSettings => {
  if (!overlay || typeof overlay !== "object") return base;

  const partial = overlay as Partial<ContactPageSettings>;
  return {
    headline: partial.headline?.trim() || base.headline,
    subtitle: partial.subtitle?.trim() || base.subtitle,
    formHeadline: partial.formHeadline?.trim() || base.formHeadline,
    formSubtitle: partial.formSubtitle?.trim() || base.formSubtitle,
    showForm: partial.showForm ?? base.showForm,
    showDirectionsLink: partial.showDirectionsLink ?? base.showDirectionsLink,
    faqItems: partial.faqItems ? normalizeFaqItems(partial.faqItems) : base.faqItems,
    metaDescription: partial.metaDescription?.trim() ?? base.metaDescription,
  };
};

export const normalizeContactPageSettings = (
  overlay?: Partial<ContactPageSettings> | Record<string, unknown> | null,
): ContactPageSettings => mergeContactPageSettings(DEFAULT_CONTACT_PAGE_SETTINGS, overlay);
