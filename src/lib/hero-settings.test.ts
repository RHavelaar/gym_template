import { describe, expect, it } from "vitest";
import { DEFAULT_BRAND_FONT_SCALE } from "@/config/types";
import {
  heroHeadlineFontSize,
  heroSubheadlineFontSize,
  HERO_HEADLINE_SCALE_KEY,
  HERO_SUBHEADLINE_SCALE_KEY,
} from "@/lib/hero-settings";

describe("hero typography scale mapping", () => {
  it("maps headline sizes to brand scale keys", () => {
    expect(HERO_HEADLINE_SCALE_KEY).toEqual({
      sm: "lg",
      md: "xl",
      lg: "2xl",
      xl: "3xl",
    });
  });

  it("maps subheadline sizes to brand scale keys", () => {
    expect(HERO_SUBHEADLINE_SCALE_KEY).toEqual({
      sm: "sm",
      md: "base",
      lg: "lg",
      xl: "xl",
    });
  });

  it("resolves font sizes from the brand scale", () => {
    expect(heroHeadlineFontSize("md", DEFAULT_BRAND_FONT_SCALE)).toBe("1.25rem");
    expect(heroSubheadlineFontSize("md", DEFAULT_BRAND_FONT_SCALE)).toBe("1rem");
  });
});
