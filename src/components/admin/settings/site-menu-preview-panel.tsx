"use client";

import { useState } from "react";
import type { GymConfig, HomepageSection } from "@/config/types";
import type { HeroViewport } from "@/components/homepage/hero-banner";
import {
  SettingsLivePreviewFrame,
  SettingsLivePreviewPanel,
} from "@/components/admin/settings/settings-live-preview-panel";
import { extractBrandPreviewDraft } from "@/lib/brand-settings";
import { cn } from "@/lib/utils";

type SiteMenuAudience = "visitor" | "member";

type SiteMenuPreviewPanelProps = {
  baseConfig: GymConfig;
  previewConfig: GymConfig;
  sections: HomepageSection[];
};

export const SiteMenuPreviewPanel = ({ baseConfig, previewConfig, sections }: SiteMenuPreviewPanelProps) => {
  const [device, setDevice] = useState<HeroViewport>("desktop");
  const [audience, setAudience] = useState<SiteMenuAudience>("visitor");

  const brandDraft = extractBrandPreviewDraft(baseConfig);
  const siteOverrides = {
    nav: previewConfig.nav,
    features: previewConfig.features,
    simulateAuthenticated: audience === "member",
  };

  const frameProps = {
    baseConfig,
    draft: brandDraft,
    sections,
    viewport: device,
    fitFrame: true as const,
    site: siteOverrides,
    className: "h-full min-h-0",
    title: `Site menu preview — ${device}`,
  };

  const audienceToolbar = (
    <div
      className="inline-flex rounded-lg border border-(--gym-border) p-0.5"
      role="group"
      aria-label="Preview audience"
    >
      {(
        [
          { value: "visitor" as const, label: "Visitor" },
          { value: "member" as const, label: "Signed in" },
        ] as const
      ).map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => setAudience(value)}
          className={cn(
            "rounded-md px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase transition",
            audience === value ? "bg-(--gym-accent) text-(--gym-accent-fg)" : "text-(--gym-muted) hover:text-white",
          )}
          aria-pressed={audience === value}
        >
          {label}
        </button>
      ))}
    </div>
  );

  return (
    <SettingsLivePreviewPanel
      title="Live site preview"
      helperText="Uses your saved homepage and brand. Menu changes apply instantly — toggle Signed in to preview the slimmer member header and profile menu."
      device={device}
      onDeviceChange={setDevice}
      toolbar={audienceToolbar}
      preview={<SettingsLivePreviewFrame {...frameProps} />}
      fullscreenPreview={
        <SettingsLivePreviewFrame
          {...frameProps}
          className="h-80vh w-full"
          title={`Site menu preview — ${device} fullscreen`}
        />
      }
      fullscreenTitle={`Site menu preview — ${device}`}
      fullscreenDescription="Full homepage with unsaved menu changes in the header"
    />
  );
};
