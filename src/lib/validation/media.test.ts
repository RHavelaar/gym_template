import { describe, expect, it } from "vitest";
import { heroPropsSchema, mediaSchema } from "@/lib/validation/content";
import { validHeroProps, validMediaPayload } from "@/lib/validation/media.fixtures";

describe("mediaSchema", () => {
  it("accepts a valid hero, gallery, and carousel payload", () => {
    const result = mediaSchema.safeParse(validMediaPayload);
    expect(result.success).toBe(true);
  });

  it("rejects an empty hero URL", () => {
    const result = mediaSchema.safeParse({
      ...validMediaPayload,
      hero: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects gallery items without URLs", () => {
    const result = mediaSchema.safeParse({
      ...validMediaPayload,
      gallery: [{ id: "x", url: "", mediaType: "image" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid carousel slide counts", () => {
    const result = mediaSchema.safeParse({
      ...validMediaPayload,
      carousel: { ...validMediaPayload.carousel, slidesVisible: 2 },
    });
    expect(result.success).toBe(false);
  });

  it("rejects autoplay intervals outside allowed range", () => {
    const result = mediaSchema.safeParse({
      ...validMediaPayload,
      carousel: { ...validMediaPayload.carousel, intervalSeconds: 1 },
    });
    expect(result.success).toBe(false);
  });
});

describe("heroPropsSchema", () => {
  it("accepts valid hero section props", () => {
    const result = heroPropsSchema.safeParse(validHeroProps);
    expect(result.success).toBe(true);
  });

  it("requires headline text when showHeadline is enabled", () => {
    const result = heroPropsSchema.safeParse({
      ...validHeroProps,
      showHeadline: true,
      headline: "   ",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === "headline")).toBe(true);
    }
  });

  it("allows empty headline when showHeadline is disabled", () => {
    const result = heroPropsSchema.safeParse({
      ...validHeroProps,
      showHeadline: false,
      headline: "",
    });
    expect(result.success).toBe(true);
  });

  it("requires primary CTA label and link when showPrimaryCta is enabled", () => {
    const missingLabel = heroPropsSchema.safeParse({
      ...validHeroProps,
      showPrimaryCta: true,
      ctaLabel: "",
    });
    const missingLink = heroPropsSchema.safeParse({
      ...validHeroProps,
      showPrimaryCta: true,
      ctaHref: "",
    });

    expect(missingLabel.success).toBe(false);
    expect(missingLink.success).toBe(false);
  });

  it("rejects overlay opacity outside 0–100", () => {
    const result = heroPropsSchema.safeParse({
      ...validHeroProps,
      overlayOpacity: 150,
    });
    expect(result.success).toBe(false);
  });

  it("rejects unknown layout values", () => {
    const result = heroPropsSchema.safeParse({
      ...validHeroProps,
      layout: "panel",
    });
    expect(result.success).toBe(false);
  });
});
