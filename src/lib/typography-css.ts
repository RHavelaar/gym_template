import type { BrandTypography, GymConfig } from "@/config/types";
import { brandToCssVars } from "@/config";

export { brandToCssVars, typographyToCssVars } from "@/config";

export const buildCustomFontFaceRules = (typography: BrandTypography): string =>
  typography.customFonts
    .map(
      (font) => `@font-face {
  font-family: "${font.name}";
  src: url("${font.url}") format("${font.format === "ttf" ? "truetype" : font.format}");
  font-display: swap;
  font-weight: 400 900;
  font-style: normal;
}`,
    )
    .join("\n");

export const getBrandStyleVars = (config: GymConfig) => brandToCssVars(config);
