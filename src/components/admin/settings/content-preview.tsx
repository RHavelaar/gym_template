"use client";

import type { GymConfig, HomepageSection } from "@/config/types";
import type { HeroViewport } from "@/components/homepage/hero-banner";
import { themeToCssVars } from "@/config";
import { AdminSectionRenderer } from "@/components/admin/settings/admin-section-renderer";
import { cn } from "@/lib/utils";

type SectionPreviewProps = {
  config: GymConfig;
  section: HomepageSection;
  highlighted?: boolean;
  compact?: boolean;
  fitFrame?: boolean;
  viewport?: HeroViewport;
};

export const SectionPreview = ({
  config,
  section,
  highlighted = false,
  compact = false,
  fitFrame = false,
  viewport,
}: SectionPreviewProps) => (
  <div
    className={cn(
      "w-full text-white",
      fitFrame && "h-full",
      highlighted && "ring-2 ring-(--gym-accent) ring-offset-2 ring-offset-(--gym-bg)",
    )}
    style={themeToCssVars(config)}
  >
    <AdminSectionRenderer section={section} config={config} compact={compact} fitFrame={fitFrame} viewport={viewport} />
  </div>
);

type HomepagePreviewProps = {
  config: GymConfig;
  sections: HomepageSection[];
  highlightSectionId?: string;
};

export const HomepagePreview = ({ config, sections, highlightSectionId }: HomepagePreviewProps) => {
  const visible = [...sections].filter((s) => s.enabled).sort((a, b) => a.order - b.order);

  return (
    <div className="max-h-70vh overflow-y-auto text-white" style={themeToCssVars(config)}>
      {visible.length === 0 ? (
        <p className="p-8 text-center text-(--gym-muted)">
          No visible sections — enable at least one section to preview.
        </p>
      ) : (
        visible.map((section) => (
          <div
            key={section.id}
            className={cn(highlightSectionId === section.id && "ring-2 ring-(--gym-accent) ring-inset")}
          >
            <AdminSectionRenderer section={section} config={config} />
          </div>
        ))
      )}
    </div>
  );
};
