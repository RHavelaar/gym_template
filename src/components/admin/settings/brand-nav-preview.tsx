"use client";

import { ExternalLink as ExternalLinkIcon } from "lucide-react";
import type { GymConfig } from "@/config/types";
import { brandToCssVars } from "@/config";
import { resolveSeo, previewSiteOrigin } from "@/lib/brand-settings";
import { buildFontFamilyCss } from "@/lib/brand-settings";
import { BRAND_SCALE_META } from "@/lib/brand-help";
import { formatFontSizeSummary } from "@/lib/font-size";
import { isExternalNavHref } from "@/lib/nav-catalog";
import { THEME_TOKEN_META } from "@/lib/theme-token-usage";
import { DualDeviceSectionPreview } from "@/components/admin/settings/preview-device-frame";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type BrandPreviewProps = {
  config: GymConfig;
};

const BrandHeaderPreview = ({ config }: BrandPreviewProps) => (
  <div className="p-4 text-white sm:p-6" style={brandToCssVars(config)}>
    <header className="flex items-center gap-3 border-b border-(--gym-border) pb-4">
      {config.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={config.logoUrl} alt="" className="h-10 w-10 rounded object-contain" />
      ) : null}
      <div className="min-w-0">
        <p className="truncate text-lg font-black uppercase" style={{ fontFamily: "var(--gym-font-heading)" }}>
          {config.name}
        </p>
        <p className="truncate text-xs text-(--gym-muted)">{config.tagline}</p>
      </div>
    </header>
    <p className="mt-4 line-clamp-3 text-sm text-neutral-300">{config.description}</p>
  </div>
);

export const BrandPreview = ({ config }: BrandPreviewProps) => (
  <div className="p-6 text-white" style={brandToCssVars(config)}>
    <BrandHeaderPreview config={config} />
    <div className="mt-6 flex flex-wrap gap-2">
      <span
        className="rounded px-3 py-1 text-xs font-semibold"
        style={{ background: config.theme.primary, color: config.theme.primaryForeground }}
      >
        Primary
      </span>
      <span
        className="rounded px-3 py-1 text-xs font-semibold"
        style={{ background: config.theme.accent, color: config.theme.accentForeground }}
      >
        Accent
      </span>
    </div>
  </div>
);

export const BrandIdentityPreview = ({ config }: BrandPreviewProps) => (
  <DualDeviceSectionPreview
    desktop={{
      label: "Desktop",
      expandLabel: "Open full-size desktop header preview",
      fullscreenTitle: "Site header — desktop",
      fullscreenDescription: "How your gym name and logo appear in the site header on larger screens",
      desktopFrame: "content",
      inline: <BrandHeaderPreview config={config} />,
      fullscreen: <BrandHeaderPreview config={config} />,
    }}
    mobile={{
      label: "Mobile",
      expandLabel: "Open full-size mobile header preview",
      fullscreenTitle: "Site header — mobile",
      fullscreenDescription: "iPhone 16 Pro Max width (430px)",
      inline: <BrandHeaderPreview config={config} />,
      fullscreen: <BrandHeaderPreview config={config} />,
    }}
  />
);

export const BrandComponentGallery = ({ config }: BrandPreviewProps) => (
  <div className="space-y-4 p-6 text-white" style={brandToCssVars(config)}>
    <p className="text-xs font-semibold tracking-widest text-(--gym-muted) uppercase">UI component gallery</p>
    <div className="flex flex-wrap gap-2">
      <Button type="button" size="sm">
        Primary button
      </Button>
      <Button type="button" variant="secondary" size="sm">
        Secondary
      </Button>
      <Badge>Accent badge</Badge>
    </div>
    <Card className="p-4">
      <p className="text-sm font-semibold">Surface card</p>
      <p className="mt-1 text-xs text-(--gym-muted)">Cards, modals, and inputs use your surface and border colors.</p>
      <Input className="mt-3" placeholder="Input field preview" readOnly />
    </Card>
    <p className="text-sm">
      <span className="text-(--gym-accent) underline">Accent link</span>
      <span className="mx-2 text-(--gym-muted)">·</span>
      <span className="text-(--gym-muted)">Muted helper text</span>
      <span className="mx-2 text-(--gym-muted)">·</span>
      <span className="text-(--gym-danger)">Danger text</span>
    </p>
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
      {THEME_TOKEN_META.map(({ key, label }) => (
        <div key={key} className="text-center">
          <div
            className="mx-auto h-10 w-10 rounded-lg ring-1 ring-(--gym-border)"
            style={{ backgroundColor: config.theme[key] }}
          />
          <p className="mt-1 truncate text-[10px] text-(--gym-muted)">{label}</p>
        </div>
      ))}
    </div>
  </div>
);

export const BrandTypographyPreview = ({ config }: BrandPreviewProps) => {
  const headingFamily = buildFontFamilyCss(config.typography.headingFont, config.typography);
  const bodyFamily = buildFontFamilyCss(config.typography.bodyFont, config.typography);
  const monoFamily = buildFontFamilyCss(config.typography.monoFont, config.typography);

  return (
    <div className="space-y-4 p-6 text-white" style={brandToCssVars(config)}>
      <p className="text-xs font-semibold tracking-widest text-(--gym-muted) uppercase">Typography sample</p>
      <p
        style={{ fontFamily: headingFamily, fontSize: config.typography.scale["3xl"] }}
        className="leading-tight font-black uppercase"
      >
        {config.name}
      </p>
      <p style={{ fontFamily: bodyFamily, fontSize: config.typography.scale.base }} className="text-neutral-300">
        Body text at {config.typography.scale.base} ({formatFontSizeSummary(config.typography.scale.base)}) — member
        dashboard labels, paragraphs, and form fields use the body font.
      </p>
      <p style={{ fontFamily: monoFamily, fontSize: config.typography.scale.sm }} className="text-(--gym-accent)">
        315 lb · 142.88 kg — leaderboard stats
      </p>

      <div className="space-y-2 border-t border-(--gym-border) pt-3">
        <p className="text-[10px] font-semibold tracking-widest text-(--gym-muted) uppercase">Full type scale</p>
        {BRAND_SCALE_META.map(({ key, label, usedFor }) => (
          <div
            key={key}
            className="flex flex-wrap items-baseline justify-between gap-2 border-b border-(--gym-border)/40 py-1.5 last:border-0"
          >
            <div className="min-w-0">
              <p className="text-[10px] text-(--gym-muted)">{label}</p>
              <p className="text-[9px] text-neutral-500">{usedFor}</p>
            </div>
            <p
              style={{
                fontFamily: key === "3xl" || key === "4xl" || key === "2xl" ? headingFamily : bodyFamily,
                fontSize: config.typography.scale[key],
              }}
              className="font-medium"
            >
              Aa
            </p>
            <p className="w-full text-[10px] text-(--gym-muted) sm:w-auto sm:text-right">
              {config.typography.scale[key]} · {formatFontSizeSummary(config.typography.scale[key])}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-1 border-t border-(--gym-border) pt-3 text-xs text-(--gym-muted)">
        <p>Heading: {config.typography.headingFont}</p>
        <p>Body: {config.typography.bodyFont}</p>
        <p>Fallback: {config.typography.fallbackStack}</p>
      </div>
    </div>
  );
};

export const BrandSeoPreview = ({ config }: BrandPreviewProps) => {
  const seo = resolveSeo(config);
  const siteUrl = previewSiteOrigin(config.slug);

  return (
    <div className="space-y-4 p-6" style={brandToCssVars(config)}>
      <p className="text-xs font-semibold tracking-widest text-(--gym-muted) uppercase">Search & social preview</p>

      <div className="rounded-lg border border-(--gym-border) bg-white p-4 text-left">
        <p className="truncate text-lg text-[#1a0dab]">{seo.metaTitle}</p>
        <p className="text-sm text-[#006621]">{siteUrl}</p>
        <p className="mt-1 line-clamp-2 text-sm text-[#545454]">{seo.metaDescription}</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-(--gym-border) bg-(--gym-surface)">
        {seo.ogImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={seo.ogImageUrl} alt="" className="aspect-[1.91/1] w-full object-cover" />
        ) : (
          <div className="flex aspect-[1.91/1] items-center justify-center bg-black/40 text-xs text-(--gym-muted)">
            Social share image preview
          </div>
        )}
        <div className="space-y-0.5 p-3">
          <p className="text-xs text-(--gym-muted) uppercase">{siteUrl.replace(/^https:\/\//, "")}</p>
          <p className="font-semibold text-white">{seo.ogTitle}</p>
          <p className="line-clamp-2 text-xs text-(--gym-muted)">{seo.ogDescription}</p>
        </div>
      </div>
    </div>
  );
};

type NavPreviewProps = {
  config: GymConfig;
  variant?: "public" | "member";
};

export const NavPreview = ({ config, variant = "public" }: NavPreviewProps) => {
  const items = variant === "public" ? config.nav.public : config.nav.member;

  return (
    <div className="p-4 text-white" style={brandToCssVars(config)}>
      <p className="mb-2 text-xs font-semibold tracking-widest text-(--gym-muted) uppercase">
        {variant === "public" ? "Public navigation" : "Member navigation"}
      </p>
      <nav className="flex flex-wrap gap-3 rounded-lg border border-(--gym-border) bg-black/40 p-3">
        {items.map((item) => (
          <span
            key={item.href}
            className="rounded px-3 py-1.5 text-sm font-medium text-neutral-200 ring-1 ring-(--gym-border)"
          >
            {item.label}
            {isExternalNavHref(item.href) ? (
              <ExternalLinkIcon className="ml-1 inline h-3 w-3 text-(--gym-muted)" aria-hidden />
            ) : null}
          </span>
        ))}
      </nav>
    </div>
  );
};

type FeaturesPreviewProps = {
  config: GymConfig;
};

const FEATURE_LABELS: { key: keyof GymConfig["features"]; label: string }[] = [
  { key: "socialFeed", label: "Gym Feed" },
  { key: "competitions", label: "Competitions" },
  { key: "achievements", label: "Achievements" },
  { key: "prModeration", label: "PR moderation" },
  { key: "leaderboards", label: "Leaderboards" },
];

export const FeaturesPreview = ({ config }: FeaturesPreviewProps) => (
  <div className="p-4 text-white" style={brandToCssVars(config)}>
    <p className="mb-2 text-xs font-semibold tracking-widest text-(--gym-muted) uppercase">Enabled features</p>
    <ul className="space-y-2">
      {FEATURE_LABELS.map(({ key, label }) => (
        <li
          key={key}
          className="flex items-center justify-between rounded-lg border border-(--gym-border) px-3 py-2 text-sm"
        >
          <span>{label}</span>
          <span className={config.features[key] ? "text-green-400" : "text-(--gym-muted)"}>
            {config.features[key] ? "On" : "Off"}
          </span>
        </li>
      ))}
    </ul>
  </div>
);
