"use client";

import { useEffect, useMemo, useState } from "react";
import { getGymConfig } from "@/config";
import { LiveSitePreview } from "@/components/admin/settings/live-site-preview";
import {
  BRAND_PREVIEW_READY,
  isBrandPreviewUpdateMessage,
  type BrandPreviewPayload,
} from "@/lib/brand-preview-message";
import { buildBrandPreviewConfig, applySitePreviewOverrides } from "@/lib/brand-settings";

export default function BrandPreviewPage() {
  const baseConfig = getGymConfig();
  const [payload, setPayload] = useState<BrandPreviewPayload | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (!isBrandPreviewUpdateMessage(event.data)) return;
      setPayload(event.data.payload);
    };

    window.addEventListener("message", handleMessage);
    window.parent.postMessage({ type: BRAND_PREVIEW_READY }, window.location.origin);

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const previewConfig = useMemo(() => {
    if (!payload) return null;
    const withBrand = buildBrandPreviewConfig(baseConfig, payload.draft);
    return applySitePreviewOverrides(withBrand, payload.site);
  }, [baseConfig, payload]);

  if (!payload || !previewConfig) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-(--gym-muted)">Loading live preview…</div>
    );
  }

  return (
    <LiveSitePreview
      config={previewConfig}
      sections={payload.sections}
      viewport={payload.viewport ?? "desktop"}
      fitFrame
      embedded
      simulateAuthenticated={payload.site?.simulateAuthenticated ?? false}
      className="h-full"
    />
  );
}
