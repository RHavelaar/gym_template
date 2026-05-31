"use client";

import type { GymConfig, HomepageSection } from "@/config/types";
import { DualDeviceSectionPreview } from "@/components/admin/settings/preview-device-frame";
import { SectionPreview } from "@/components/admin/settings/content-preview";

type GallerySectionPreviewProps = {
  config: GymConfig;
  section: HomepageSection;
};

export const GallerySectionPreview = ({ config, section }: GallerySectionPreviewProps) => (
  <DualDeviceSectionPreview
    desktop={{
      label: "Desktop",
      expandLabel: "Open full-size desktop gallery preview",
      fullscreenTitle: "Gallery preview — desktop",
      fullscreenDescription: "Carousel and grid as visitors see on larger screens",
      desktopFrame: "content",
      inline: <SectionPreview config={config} section={section} />,
      fullscreen: <SectionPreview config={config} section={section} />,
    }}
    mobile={{
      label: "Mobile",
      expandLabel: "Open full-size mobile gallery preview",
      fullscreenTitle: "Gallery preview — mobile",
      fullscreenDescription: "iPhone 16 Pro Max width (430px)",
      inline: <SectionPreview config={config} section={section} compact />,
      fullscreen: <SectionPreview config={config} section={section} compact />,
    }}
  />
);
