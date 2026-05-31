"use client";

import type { ThemeTokens } from "@/config/types";
import { ThemeColorField, ThemePaletteTools } from "@/components/admin/settings/theme-color-field";
import { SettingSectionTitle } from "@/components/ui/info-hint";
import { THEME_TOKEN_META } from "@/lib/theme-token-usage";

type ThemeColorsFormProps = {
  theme: ThemeTokens;
  onChange: (theme: ThemeTokens) => void;
  fieldErrors?: Record<string, string>;
};

export const ThemeColorsForm = ({ theme, onChange, fieldErrors = {} }: ThemeColorsFormProps) => {
  const patch = (key: keyof ThemeTokens, value: string) => onChange({ ...theme, [key]: value });

  return (
    <div className="space-y-4">
      <SettingSectionTitle
        title="Theme colors"
        size="lg"
        hint="These nine colors drive your entire site — buttons, backgrounds, text, borders, and sign-in screens. Changes apply everywhere after you save."
        description="Click a swatch to open the color wheel, eyedropper, or import tools. Each color shows where it appears on your site."
      />

      <ThemePaletteTools onApplyPalette={onChange} />

      <div className="space-y-3">
        {THEME_TOKEN_META.map((meta) => (
          <div key={meta.key} className="space-y-1">
            <ThemeColorField
              id={`theme-${meta.key}`}
              label={meta.label}
              hint={
                <>
                  {meta.hint}
                  {meta.recommendation ? (
                    <span className="mt-1 block text-neutral-400">{meta.recommendation}</span>
                  ) : null}
                </>
              }
              usedFor={meta.usedFor}
              value={theme[meta.key]}
              onChange={(value) => patch(meta.key, value)}
              surfaceColor={theme.surface}
              backgroundColor={theme.background}
            />
            {fieldErrors[`theme.${meta.key}`] ? (
              <p className="text-xs text-red-400">{fieldErrors[`theme.${meta.key}`]}</p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};
