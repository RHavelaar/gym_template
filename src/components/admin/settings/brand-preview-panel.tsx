"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import type { GymConfig, HomepageSection } from "@/config/types";
import type { HeroViewport } from "@/components/homepage/hero-banner";
import { BrandSeoPreview } from "@/components/admin/settings/brand-nav-preview";
import {
  SettingsLivePreviewFrame,
  SettingsLivePreviewPanel,
} from "@/components/admin/settings/settings-live-preview-panel";
import { SignInBrandPreview } from "@/components/admin/settings/sign-in-brand-preview";
import { buildBrandPreviewConfig, type BrandPreviewDraft } from "@/lib/brand-settings";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PreviewView = "homepage" | "sign-in";

type BrandPreviewPanelProps = {
  baseConfig: GymConfig;
  draft: BrandPreviewDraft;
  sections: HomepageSection[];
  activeSectionId: string;
  onRefreshSections?: () => void;
  refreshing?: boolean;
};

export const BrandPreviewPanel = ({
  baseConfig,
  draft,
  sections,
  activeSectionId,
  onRefreshSections,
  refreshing = false,
}: BrandPreviewPanelProps) => {
  const [device, setDevice] = useState<HeroViewport>("desktop");
  const [view, setView] = useState<PreviewView>("homepage");

  const previewConfig = buildBrandPreviewConfig(baseConfig, draft);
  const showSeoPreview = activeSectionId === "seo";

  const frameProps = {
    baseConfig,
    draft,
    sections,
    viewport: device,
    fitFrame: true as const,
    className: "h-full min-h-0",
    title: `Live site preview — ${device}`,
  };

  const homepagePreview = <SettingsLivePreviewFrame {...frameProps} />;

  const previewContent = showSeoPreview ? (
    <BrandSeoPreview config={previewConfig} />
  ) : view === "sign-in" ? (
    <SignInBrandPreview config={previewConfig} viewport={device} className="h-full min-h-0" />
  ) : (
    homepagePreview
  );

  const viewToolbar = !showSeoPreview ? (
    <div className="inline-flex rounded-lg border border-(--gym-border) p-0.5" role="group" aria-label="Preview view">
      {(
        [
          { value: "homepage" as const, label: "Homepage" },
          { value: "sign-in" as const, label: "Sign-in" },
        ] as const
      ).map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => setView(value)}
          className={cn(
            "rounded-md px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase transition",
            view === value ? "bg-(--gym-accent) text-(--gym-accent-fg)" : "text-(--gym-muted) hover:text-white",
          )}
          aria-pressed={view === value}
        >
          {label}
        </button>
      ))}
    </div>
  ) : null;

  const refreshAction = onRefreshSections ? (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      disabled={refreshing}
      onClick={onRefreshSections}
      aria-label="Refresh homepage content in preview"
    >
      <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", refreshing && "animate-spin")} />
      Refresh homepage content
    </Button>
  ) : null;

  return (
    <SettingsLivePreviewPanel
      title={showSeoPreview ? "Search & social preview" : "Live preview"}
      helperText={
        showSeoPreview
          ? undefined
          : "Preview uses your saved homepage sections. Unsaved brand changes are applied instantly."
      }
      device={device}
      onDeviceChange={setDevice}
      showDeviceToggle={!showSeoPreview}
      toolbar={viewToolbar}
      headerActions={showSeoPreview ? undefined : refreshAction}
      preview={previewContent}
      fullscreenPreview={
        showSeoPreview || view === "sign-in" ? undefined : (
          <SettingsLivePreviewFrame
            {...frameProps}
            className="h-80vh w-full"
            title={`Live site preview — ${device} fullscreen`}
          />
        )
      }
      showFullscreen={!showSeoPreview && view === "homepage"}
      useMobileFrame={!showSeoPreview && view === "homepage"}
      previewContainerClassName={showSeoPreview ? "min-h-70" : undefined}
      fullscreenTitle={`Live site preview — ${device}`}
      fullscreenDescription="Full-size preview with unsaved brand changes applied"
    />
  );
};
