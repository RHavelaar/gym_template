"use client";

import { useMemo } from "react";
import type { GymConfig, HomepageSection } from "@/config/types";
import type { HeroViewport } from "@/components/homepage/hero-banner";
import { brandToCssVars } from "@/config";
import { AdminSectionRenderer } from "@/components/admin/settings/admin-section-renderer";
import { BrandFontLoader } from "@/components/layout/brand-font-loader";
import { SiteFooter } from "@/components/layout/site-footer";
import { getAccountNavItems } from "@/lib/nav-catalog";
import { SiteHeader } from "@/components/layout/site-header";
import { cn } from "@/lib/utils";

type LiveSitePreviewProps = {
  config: GymConfig;
  sections: HomepageSection[];
  viewport?: HeroViewport;
  fitFrame?: boolean;
  /** Fill a fixed device frame (iframe) with touch-style hidden scrollbars */
  embedded?: boolean;
  /** Show member menu links in the header (site menu settings preview). */
  simulateAuthenticated?: boolean;
  className?: string;
  scrollClassName?: string;
};

export const LiveSitePreview = ({
  config,
  sections,
  viewport = "desktop",
  fitFrame = false,
  embedded = false,
  simulateAuthenticated = false,
  className,
  scrollClassName,
}: LiveSitePreviewProps) => {
  const visibleSections = useMemo(
    () => [...sections].filter((section) => section.enabled).sort((a, b) => a.order - b.order),
    [sections],
  );

  const scrollContainerClass = cn(
    "min-h-0 flex-1 overscroll-contain overflow-y-auto",
    embedded && "scrollbar-none",
    scrollClassName,
  );

  return (
    <div
      className={cn(
        "brand-live-preview flex flex-col bg-(--gym-bg) text-white",
        embedded ? "h-full max-h-full min-h-0" : "min-h-full",
        "[&_a]:pointer-events-none [&_button]:pointer-events-none",
        className,
      )}
      style={brandToCssVars(config)}
    >
      <BrandFontLoader config={config} />
      <SiteHeader
        config={config}
        isAuthenticated={simulateAuthenticated}
        memberNav={simulateAuthenticated ? config.nav.member : []}
        accountNav={simulateAuthenticated ? getAccountNavItems(config) : []}
      />
      <div className={scrollContainerClass}>
        <main>
          {visibleSections.length === 0 ? (
            <p className="p-8 text-center text-sm text-(--gym-muted)">
              No homepage sections are enabled — turn sections on in Homepage settings to preview your full site here.
            </p>
          ) : (
            visibleSections.map((section) => (
              <AdminSectionRenderer
                key={section.id}
                section={section}
                config={config}
                viewport={viewport}
                fitFrame={fitFrame && section.type === "hero"}
              />
            ))
          )}
        </main>
        <SiteFooter config={config} />
      </div>
    </div>
  );
};
