import type { GymConfig, HomepageSection } from "@/config/types";
import type { HeroViewport } from "@/components/homepage/hero-banner";
import type { BrandPreviewDraft } from "@/lib/brand-settings";

export const BRAND_PREVIEW_READY = "gym-brand-preview-ready" as const;
export const BRAND_PREVIEW_UPDATE = "gym-brand-preview-update" as const;

/** Optional nav/feature overrides for settings previews (site menu, modules). */
export type SitePreviewOverrides = {
  nav?: GymConfig["nav"];
  features?: GymConfig["features"];
  /** When true, member menu links appear in the header preview. */
  simulateAuthenticated?: boolean;
};

export type BrandPreviewPayload = {
  baseSlug: string;
  draft: BrandPreviewDraft;
  sections: HomepageSection[];
  viewport: HeroViewport;
  fitFrame?: boolean;
  site?: SitePreviewOverrides;
};

export type BrandPreviewReadyMessage = {
  type: typeof BRAND_PREVIEW_READY;
};

export type BrandPreviewUpdateMessage = {
  type: typeof BRAND_PREVIEW_UPDATE;
  payload: BrandPreviewPayload;
};

export type BrandPreviewMessage = BrandPreviewReadyMessage | BrandPreviewUpdateMessage;

export const isBrandPreviewUpdateMessage = (data: unknown): data is BrandPreviewUpdateMessage =>
  typeof data === "object" &&
  data !== null &&
  "type" in data &&
  data.type === BRAND_PREVIEW_UPDATE &&
  "payload" in data &&
  typeof data.payload === "object" &&
  data.payload !== null &&
  "draft" in (data.payload as BrandPreviewPayload);
