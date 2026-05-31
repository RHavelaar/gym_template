"use client";

import type { GymConfig, HomepageSection } from "@/config/types";
import { DualDeviceSectionPreview } from "@/components/admin/settings/preview-device-frame";
import { SectionPreview } from "@/components/admin/settings/content-preview";

type HeroSectionPreviewProps = {
  config: GymConfig;
  section: HomepageSection;
};

export const HeroSectionPreview = ({ config, section }: HeroSectionPreviewProps) => (
  <DualDeviceSectionPreview
    desktop={{
      label: "Desktop",
      expandLabel: "Open full-size desktop hero preview",
      fullscreenTitle: "Hero preview — desktop",
      fullscreenDescription: "Full-width layout as visitors see on larger screens",
      desktopFrame: "wide",
      inline: <SectionPreview config={config} section={section} fitFrame viewport="desktop" />,
      fullscreen: <SectionPreview config={config} section={section} viewport="desktop" />,
    }}
    mobile={{
      label: "Mobile",
      expandLabel: "Open full-size mobile hero preview",
      fullscreenTitle: "Hero preview — mobile",
      fullscreenDescription: "iPhone 16 Pro Max width (430px)",
      inline: <SectionPreview config={config} section={section} fitFrame viewport="mobile" />,
      fullscreen: <SectionPreview config={config} section={section} viewport="mobile" />,
    }}
  />
);
