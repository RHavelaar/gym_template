import { describe, expect, it } from "vitest";
import {
  buildFontSize,
  fontSizeToPixels,
  formatFontSizeSummary,
  isValidFontSize,
  normalizeFontSizeInput,
  parseFontSize,
} from "@/lib/font-size";

describe("parseFontSize", () => {
  it("parses px, rem, and em values", () => {
    expect(parseFontSize("16px")).toEqual({ amount: 16, unit: "px" });
    expect(parseFontSize("1rem")).toEqual({ amount: 1, unit: "rem" });
    expect(parseFontSize("1.125em")).toEqual({ amount: 1.125, unit: "em" });
  });

  it("rejects invalid values", () => {
    expect(parseFontSize("")).toBeNull();
    expect(parseFontSize("16")).toBeNull();
    expect(parseFontSize("1.5%")).toBeNull();
    expect(parseFontSize("-1rem")).toBeNull();
  });
});

describe("fontSizeToPixels", () => {
  it("converts rem and em using 16px root", () => {
    expect(fontSizeToPixels("16px")).toBe(16);
    expect(fontSizeToPixels("1rem")).toBe(16);
    expect(fontSizeToPixels("1.5rem")).toBe(24);
    expect(fontSizeToPixels("0.875em")).toBe(14);
  });
});

describe("formatFontSizeSummary", () => {
  it("describes px directly", () => {
    expect(formatFontSizeSummary("18px")).toBe("18px on screen");
  });

  it("shows rem equivalent in pixels", () => {
    expect(formatFontSizeSummary("1rem")).toBe("1rem ≈ 16px on most screens");
  });
});

describe("normalizeFontSizeInput", () => {
  it("appends default unit to bare numbers", () => {
    expect(normalizeFontSizeInput("16", "px")).toBe("16px");
    expect(normalizeFontSizeInput("1.25", "rem")).toBe("1.25rem");
  });

  it("preserves valid CSS lengths", () => {
    expect(normalizeFontSizeInput("14px", "rem")).toBe("14px");
  });
});

describe("isValidFontSize", () => {
  it("accepts supported units only", () => {
    expect(isValidFontSize("16px")).toBe(true);
    expect(isValidFontSize("1rem")).toBe(true);
    expect(isValidFontSize("1em")).toBe(true);
    expect(isValidFontSize("12pt")).toBe(false);
  });
});

describe("buildFontSize", () => {
  it("formats whole and fractional amounts", () => {
    expect(buildFontSize(16, "px")).toBe("16px");
    expect(buildFontSize(1.125, "rem")).toBe("1.125rem");
  });
});
