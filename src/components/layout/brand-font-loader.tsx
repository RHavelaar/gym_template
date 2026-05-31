"use client";

import type { GymConfig } from "@/config/types";
import { buildGoogleFontsUrl } from "@/lib/google-fonts-catalog";
import { buildCustomFontFaceRules } from "@/lib/typography-css";
import { isCustomFontRef } from "@/lib/brand-settings";

type BrandFontLoaderProps = {
  config: GymConfig;
};

export const BrandFontLoader = ({ config }: BrandFontLoaderProps) => {
  const { typography } = config;
  const googleFamilies = [typography.headingFont, typography.bodyFont, typography.monoFont].filter(
    (f) => f && !isCustomFontRef(f),
  );
  const fontsUrl = buildGoogleFontsUrl(googleFamilies);
  const faceRules = buildCustomFontFaceRules(typography);

  return (
    <>
      {fontsUrl ? <link rel="stylesheet" href={fontsUrl} /> : null}
      {faceRules ? <style dangerouslySetInnerHTML={{ __html: faceRules }} /> : null}
    </>
  );
};
