"use client";

import { useEffect, useRef, useState } from "react";
import type { GymConfig, HomepageSection } from "@/config/types";
import type { HeroViewport } from "@/components/homepage/hero-banner";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { BRAND_PREVIEW_READY, BRAND_PREVIEW_UPDATE, type BrandPreviewPayload } from "@/lib/brand-preview-message";
import type { SitePreviewOverrides } from "@/lib/brand-preview-message";
import type { BrandPreviewDraft } from "@/lib/brand-settings";
import { cn } from "@/lib/utils";

type BrandLivePreviewFrameProps = {
  baseConfig: GymConfig;
  draft: BrandPreviewDraft;
  sections: HomepageSection[];
  viewport?: HeroViewport;
  fitFrame?: boolean;
  site?: SitePreviewOverrides;
  className?: string;
  title?: string;
};

export const BrandLivePreviewFrame = ({
  baseConfig,
  draft,
  sections,
  viewport = "desktop",
  fitFrame = false,
  site,
  className,
  title = "Live site preview",
}: BrandLivePreviewFrameProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);

  const payload: BrandPreviewPayload = {
    baseSlug: baseConfig.slug,
    draft,
    sections,
    viewport,
    fitFrame,
    site,
  };
  const debouncedPayload = useDebouncedValue(payload, 150);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== BRAND_PREVIEW_READY) return;
      if (event.source !== iframeRef.current?.contentWindow) return;
      setReady(true);
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    if (!ready) return;

    iframeRef.current?.contentWindow?.postMessage(
      { type: BRAND_PREVIEW_UPDATE, payload: debouncedPayload },
      window.location.origin,
    );
  }, [ready, debouncedPayload]);

  return (
    <iframe
      ref={iframeRef}
      src="/preview/brand"
      title={title}
      className={cn("block h-full w-full border-0 bg-(--gym-bg)", className)}
      sandbox="allow-same-origin allow-scripts"
    />
  );
};
