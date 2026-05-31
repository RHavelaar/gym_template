import { describe, expect, it } from "vitest";
import { DEFAULT_BRAND_FONT_SCALE } from "@/config/types";
import { DEFAULT_BUSINESS_VISIBILITY } from "@/lib/business-info";
import {
  brandFontScaleSchema,
  businessSchema,
  contactPageSettingsSchema,
  pricingPageSettingsSchema,
  pricingPlanSchema,
  siteMenuSchema,
} from "@/lib/validation/content";

describe("siteMenuSchema", () => {
  const validPages = [
    { id: "home", enabled: true, label: "Home" },
    { id: "leaderboards", enabled: true, label: "Leaderboards" },
    { id: "competitions", enabled: false, label: "Competitions" },
    { id: "contact", enabled: true, label: "Contact" },
    { id: "pricing", enabled: true, label: "Pricing" },
    { id: "dashboard", enabled: true, label: "My Dashboard" },
    { id: "prSubmit", enabled: true, label: "Log PR" },
    { id: "feed", enabled: true, label: "Gym Feed" },
    { id: "achievements", enabled: true, label: "Achievements" },
    { id: "prModeration", enabled: true, label: "PR moderation" },
  ];

  it("accepts valid site menu payload", () => {
    const result = siteMenuSchema.safeParse({
      pages: validPages,
      externalLinks: [{ label: "Book", href: "https://example.com/book" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects external links without https", () => {
    const result = siteMenuSchema.safeParse({
      pages: validPages,
      externalLinks: [{ label: "Book", href: "http://example.com/book" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects more than two external links", () => {
    const result = siteMenuSchema.safeParse({
      pages: validPages,
      externalLinks: [
        { label: "One", href: "https://one.example" },
        { label: "Two", href: "https://two.example" },
        { label: "Three", href: "https://three.example" },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty page labels", () => {
    const result = siteMenuSchema.safeParse({
      pages: [{ id: "home", enabled: true, label: "" }],
      externalLinks: [],
    });
    expect(result.success).toBe(false);
  });
});

const validBusiness = {
  hours: [{ day: "Mon", open: "9 AM", close: "5 PM" }],
  membershipBlurb: "Membership info",
  generalEmail: "info@example.com",
  helpEmail: "help@example.com",
  contactPhone: "(555) 555-0100",
  address: { line1: "1 Main St", city: "Town", state: "TX", zip: "75001" },
  links: [
    {
      id: "instagram",
      kind: "instagram" as const,
      label: "Instagram",
      url: "https://instagram.com/gym",
      showInFooter: true,
      showOnContactPage: true,
    },
  ],
  visibility: DEFAULT_BUSINESS_VISIBILITY,
};

describe("businessSchema", () => {
  it("accepts valid business payload", () => {
    expect(businessSchema.safeParse(validBusiness).success).toBe(true);
  });

  it("requires help email", () => {
    const result = businessSchema.safeParse({ ...validBusiness, helpEmail: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects social links without https", () => {
    const result = businessSchema.safeParse({
      ...validBusiness,
      links: [{ ...validBusiness.links[0], url: "http://instagram.com/gym" }],
    });
    expect(result.success).toBe(false);
  });

  it("requires custom link labels when url is set", () => {
    const result = businessSchema.safeParse({
      ...validBusiness,
      links: [
        {
          id: "custom-1",
          kind: "custom" as const,
          label: "",
          url: "https://example.com",
          showInFooter: true,
          showOnContactPage: true,
        },
      ],
    });
    expect(result.success).toBe(false);
  });
});

describe("contactPageSettingsSchema", () => {
  it("accepts valid contact page settings", () => {
    const result = contactPageSettingsSchema.safeParse({
      headline: "Contact us",
      subtitle: "We reply quickly",
      formHeadline: "Send a message",
      formSubtitle: "Email + inbox",
      showForm: true,
      showDirectionsLink: true,
      faqItems: [{ question: "Tours?", answer: "Yes" }],
      metaDescription: "",
    });
    expect(result.success).toBe(true);
  });
});

describe("pricingPlanSchema", () => {
  it("rejects plan without price display", () => {
    const result = pricingPlanSchema.safeParse({
      id: "p1",
      sortOrder: 1,
      enabled: true,
      name: "Monthly",
      tagline: "",
      description: "",
      priceDisplay: "",
      priceCents: null,
      compareAtDisplay: "",
      billingInterval: "month",
      durationLabel: "",
      features: [],
      imageUrl: "",
      badge: "",
      isFeatured: false,
      ctaLabel: "Join",
      ctaHref: "/sign-up",
    });
    expect(result.success).toBe(false);
  });
});

describe("pricingPageSettingsSchema", () => {
  it("accepts valid pricing page settings", () => {
    const result = pricingPageSettingsSchema.safeParse({
      headline: "Pricing",
      subtitle: "Simple plans",
      footnote: "",
      metaDescription: "",
    });
    expect(result.success).toBe(true);
  });
});

describe("brandFontScaleSchema", () => {
  it("accepts valid px, rem, and em scale values", () => {
    const result = brandFontScaleSchema.safeParse({
      ...DEFAULT_BRAND_FONT_SCALE,
      base: "16px",
      lg: "1.125rem",
      sm: "0.875em",
    });

    expect(result.success).toBe(true);
  });

  it("rejects bare numbers and unsupported units", () => {
    const result = brandFontScaleSchema.safeParse({
      ...DEFAULT_BRAND_FONT_SCALE,
      base: "16",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain("base");
    }
  });

  it("rejects negative and invalid lengths", () => {
    expect(brandFontScaleSchema.safeParse({ ...DEFAULT_BRAND_FONT_SCALE, base: "-1rem" }).success).toBe(false);
    expect(brandFontScaleSchema.safeParse({ ...DEFAULT_BRAND_FONT_SCALE, xl: "12pt" }).success).toBe(false);
  });
});
