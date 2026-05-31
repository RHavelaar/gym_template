"use client";

import Link from "next/link";
import type { GallerySectionProps, GymConfig, HomepageSection, MembershipSectionProps } from "@/config/types";
import { DEFAULT_GALLERY_CAROUSEL } from "@/config/types";
import { BusinessContactDisplay } from "@/components/business/business-contact-display";
import { GalleryCarousel } from "@/components/homepage/gallery-carousel";
import { HeroBanner } from "@/components/homepage/hero-banner";
import { mergeCarouselSettings } from "@/lib/gallery-media";
import type { HeroViewport } from "@/components/homepage/hero-banner";
import { mergeHeroProps } from "@/lib/hero-settings";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Lightweight homepage section renderer for admin live previews.
 * Uses native img (not next/image) to keep settings client bundles small and fast to compile.
 */
type AdminSectionRendererProps = {
  section: HomepageSection;
  config: GymConfig;
  compact?: boolean;
  /** Scale hero into a preview frame */
  fitFrame?: boolean;
  viewport?: HeroViewport;
};

export const AdminSectionRenderer = ({
  section,
  config,
  compact = false,
  fitFrame = false,
  viewport,
}: AdminSectionRendererProps) => {
  if (!section.enabled) return null;

  switch (section.type) {
    case "hero": {
      const heroProps = mergeHeroProps(section.props, config.tagline);
      return (
        <HeroBanner
          config={config}
          props={heroProps}
          useNativeImage
          compact={compact}
          fitFrame={fitFrame}
          viewport={viewport}
        />
      );
    }
    case "cta": {
      const props = section.props as { title: string; body: string };
      return (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <Card className="border-(--gym-primary)/40 bg-linear-to-br from-(--gym-surface) to-black">
            <h2 className="text-2xl font-bold">{props.title}</h2>
            <p className="mt-2 text-neutral-300">{props.body}</p>
          </Card>
        </section>
      );
    }
    case "hours": {
      const props = section.props as { title: string };
      return (
        <section className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="text-2xl font-bold">{props.title}</h2>
          <div className="mt-4">
            <BusinessContactDisplay config={config} placement="homepageHours" />
          </div>
        </section>
      );
    }
    case "location": {
      const props = section.props as { title: string };
      return (
        <section className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="text-2xl font-bold">{props.title}</h2>
          <Card className="mt-4">
            <BusinessContactDisplay config={config} placement="homepageLocation" />
          </Card>
        </section>
      );
    }
    case "membership": {
      const props = section.props as MembershipSectionProps;
      if (!config.business.visibility.membershipBlurb.showOnHomepage) return null;
      return (
        <section className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="text-2xl font-bold">{props.title}</h2>
          <p className="mt-4 max-w-2xl text-lg text-neutral-300">{config.business.membershipBlurb}</p>
          <Link href={props.ctaHref} className="mt-6 inline-block">
            <Button size="lg">{props.ctaLabel}</Button>
          </Link>
        </section>
      );
    }
    case "gallery": {
      const props = section.props as GallerySectionProps;
      const carousel = mergeCarouselSettings(props.carousel ?? DEFAULT_GALLERY_CAROUSEL);
      const items = config.images.gallery;

      return (
        <section className={cn("w-full px-4", compact ? "py-6" : "mx-auto max-w-6xl py-10")}>
          <h2 className={cn("font-bold", compact ? "text-xl" : "text-2xl")}>{props.title}</h2>
          {carousel.enabled ? (
            <GalleryCarousel items={items} settings={carousel} variant="admin" />
          ) : (
            <div className={cn("grid gap-4", compact ? "mt-3 sm:grid-cols-2" : "mt-4 sm:grid-cols-3")}>
              {items.map((item, i) => (
                <div
                  key={item.id}
                  className="relative aspect-4/3 overflow-hidden rounded-xl border border-(--gym-border)"
                >
                  {item.mediaType === "video" ? (
                    <video
                      src={item.url}
                      className="h-full w-full object-cover"
                      muted
                      playsInline
                      loop
                      preload="metadata"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.url} alt={`Gallery ${i + 1}`} className="h-full w-full object-cover" />
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      );
    }
    case "announcements": {
      const props = section.props as { title: string; items: string[] };
      return (
        <section className="mx-auto max-w-6xl px-4 py-10 pb-16">
          <h2 className="text-2xl font-bold">{props.title}</h2>
          <ul className="mt-4 space-y-3">
            {props.items.map((item) => (
              <li key={item} className="rounded-lg border-l-4 border-(--gym-primary) bg-(--gym-surface) px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
        </section>
      );
    }
    default:
      return null;
  }
};
