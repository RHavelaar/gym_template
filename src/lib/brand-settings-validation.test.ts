import { describe, expect, it } from "vitest";
import { DEFAULT_BRAND_FONT_SCALE } from "@/config/types";
import { brandFieldErrorSection, formatBrandFieldErrors, validateBrandDraft } from "@/lib/brand-settings-validation";

const validBrand = {
  name: "Iron Asylum",
  tagline: "Train hard",
  description: "A hardcore gym in the city.",
  logoUrl: "https://example.com/logo.png",
  theme: {
    primary: "#dc2626",
    primaryForeground: "#ffffff",
    accent: "#f59e0b",
    accentForeground: "#0a0a0a",
    background: "#0a0a0a",
    surface: "#141414",
    surfaceBorder: "#262626",
    muted: "#a3a3a3",
    danger: "#ef4444",
  },
  typography: {
    headingFont: "Inter",
    bodyFont: "Inter",
    monoFont: "Roboto Mono",
    fallbackStack: "system-ui, sans-serif",
    customFonts: [],
    scale: { ...DEFAULT_BRAND_FONT_SCALE },
  },
  seo: {
    metaTitle: "",
    metaDescription: "",
    ogTitle: "",
    ogDescription: "",
    ogImageUrl: "",
    twitterCard: "summary_large_image" as const,
    faviconUrl: "",
    appleTouchIconUrl: "",
  },
};

describe("validateBrandDraft", () => {
  it("accepts a valid brand payload", () => {
    expect(validateBrandDraft(validBrand).success).toBe(true);
  });

  it("rejects empty gym name", () => {
    const result = validateBrandDraft({ ...validBrand, name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatBrandFieldErrors(result.error).name).toBeTruthy();
    }
  });

  it("rejects invalid typography scale units", () => {
    const result = validateBrandDraft({
      ...validBrand,
      typography: {
        ...validBrand.typography,
        scale: { ...DEFAULT_BRAND_FONT_SCALE, base: "16" },
      },
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid theme hex colors", () => {
    const result = validateBrandDraft({
      ...validBrand,
      theme: { ...validBrand.theme, primary: "red" },
    });
    expect(result.success).toBe(false);
  });
});

describe("brandFieldErrorSection", () => {
  it("maps fields to editor sections", () => {
    expect(brandFieldErrorSection("name")).toBe("identity");
    expect(brandFieldErrorSection("theme.primary")).toBe("colors");
    expect(brandFieldErrorSection("typography.scale.base")).toBe("typography");
    expect(brandFieldErrorSection("seo.metaTitle")).toBe("seo");
  });
});
