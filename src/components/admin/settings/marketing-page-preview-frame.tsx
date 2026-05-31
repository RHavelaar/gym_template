"use client";

import { useState } from "react";
import type { HeroViewport } from "@/components/homepage/hero-banner";
import {
  SettingsLivePreviewPanel,
  type SettingsPreviewDevice,
} from "@/components/admin/settings/settings-live-preview-panel";
import { cn } from "@/lib/utils";

type MarketingPagePreviewFrameProps = {
  path: "/contact" | "/pricing";
  title?: string;
  helperText?: string;
};

export const MarketingPagePreviewFrame = ({
  path,
  title = "Live preview",
  helperText = "Shows your saved public page. Save changes, then refresh if the preview looks stale.",
}: MarketingPagePreviewFrameProps) => {
  const [device, setDevice] = useState<SettingsPreviewDevice>("desktop");
  const viewport: HeroViewport = device;

  const iframe = (
    <iframe
      key={`${path}-${device}`}
      src={`${path}?preview=1`}
      title={`${title} — ${viewport}`}
      className={cn("block h-full w-full border-0 bg-(--gym-bg)", device === "mobile" ? "min-h-130" : "min-h-90")}
      sandbox="allow-same-origin allow-scripts"
    />
  );

  return (
    <SettingsLivePreviewPanel
      title={title}
      helperText={helperText}
      device={device}
      onDeviceChange={setDevice}
      preview={iframe}
      fullscreenPreview={iframe}
      previewContainerClassName={device === "mobile" ? "min-h-130" : "aspect-16/10 lg:aspect-4/3"}
    />
  );
};
