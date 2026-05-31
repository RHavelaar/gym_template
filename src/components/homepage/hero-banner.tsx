import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import type { GymConfig, HeroLayout, HeroSectionProps, HeroTextSize } from "@/config/types";
import { Button } from "@/components/ui/button";
import { heroHeadlineFontSize, heroSubheadlineFontSize } from "@/lib/hero-settings";
import { cn } from "@/lib/utils";

export type HeroViewport = "mobile" | "desktop";

type HeroBannerProps = {
  config: GymConfig;
  props: HeroSectionProps;
  useNativeImage?: boolean;
  compact?: boolean;
  fitFrame?: boolean;
  /** Force mobile or desktop layout (for admin previews) */
  viewport?: HeroViewport;
};

const MOBILE_HEADLINE_SIZE: Record<HeroTextSize, string> = {
  sm: "text-2xl",
  md: "text-3xl",
  lg: "text-4xl",
  xl: "text-5xl",
};

const DESKTOP_HEADLINE_SIZE: Record<HeroTextSize, string> = {
  sm: "text-3xl",
  md: "text-4xl",
  lg: "text-5xl",
  xl: "text-6xl",
};

const MOBILE_SUBHEADLINE_SIZE: Record<HeroTextSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

const DESKTOP_SUBHEADLINE_SIZE: Record<HeroTextSize, string> = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
  xl: "text-2xl",
};

const getOverlayStyle = (props: HeroSectionProps): CSSProperties => {
  if (!props.overlayEnabled) return { display: "none" };

  const baseColor = props.overlayColor.trim() || "var(--gym-bg)";
  const strength = props.overlayOpacity / 100;
  const rgba = (alpha: number) => `color-mix(in srgb, ${baseColor} ${Math.round(alpha * 100)}%, transparent)`;

  switch (props.overlayStyle) {
    case "solid":
      return { backgroundColor: rgba(strength) };
    case "vignette":
      return {
        background: `radial-gradient(ellipse at center, transparent 20%, ${rgba(strength * 0.35)} 55%, ${rgba(strength)} 100%)`,
      };
    case "frame":
      return {
        background: `linear-gradient(${rgba(strength * 0.15)}, ${rgba(strength * 0.15)})`,
        boxShadow: `inset 0 0 0 1px ${rgba(strength * 0.45)}, inset 0 0 80px ${rgba(strength * 0.55)}`,
      };
    case "gradient":
    default: {
      const mid = rgba(strength * 0.7);
      const end = rgba(strength);
      const soft = rgba(strength * 0.4);
      switch (props.overlayDirection) {
        case "to-bottom":
          return { background: `linear-gradient(to bottom, ${end}, ${mid}, ${soft})` };
        case "to-left":
          return { background: `linear-gradient(to left, ${end}, ${mid}, ${soft})` };
        case "to-right":
          return { background: `linear-gradient(to right, ${end}, ${mid}, ${soft})` };
        case "radial":
          return {
            background: `radial-gradient(ellipse at center, ${soft} 0%, ${mid} 45%, ${end} 100%)`,
          };
        case "to-top":
        default:
          return { background: `linear-gradient(to top, ${end}, ${mid}, ${soft})` };
      }
    }
  }
};

const HeroImage = ({
  src,
  opacity,
  useNativeImage,
  className,
  objectPosition,
}: {
  src: string;
  opacity: number;
  useNativeImage?: boolean;
  className?: string;
  objectPosition?: string;
}) => {
  const style = { opacity: opacity / 100, objectPosition };

  if (useNativeImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="" className={cn("h-full w-full object-cover", className)} style={style} />
    );
  }

  return (
    <Image
      src={src}
      alt=""
      fill
      className={cn("object-cover", className)}
      style={style}
      priority
      unoptimized={src.startsWith("data:")}
    />
  );
};

const GalleryAccentStrip = ({
  config,
  useNativeImage,
  className,
}: {
  config: GymConfig;
  useNativeImage?: boolean;
  className?: string;
}) => {
  const items = config.images.gallery.slice(0, 3);
  if (items.length === 0) return null;

  return (
    <div className={cn("flex gap-2", className)}>
      {items.map((item, index) => (
        <div
          key={item.id}
          className="relative aspect-4/3 flex-1 overflow-hidden rounded-lg border border-white/15 shadow-lg"
        >
          {useNativeImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.url} alt="" className="h-full w-full object-cover" />
          ) : (
            <Image src={item.url} alt="" fill className="object-cover" unoptimized />
          )}
          {index === 0 ? (
            <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-white uppercase">
              Gallery
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export const HeroBanner = ({
  config,
  props,
  useNativeImage,
  compact = false,
  fitFrame = false,
  viewport,
}: HeroBannerProps) => {
  const mobileLayout = props.layout;
  const desktopLayout = props.layoutDesktop;

  const displayTagline = props.showTagline && props.tagline.trim();
  const displayHeadline = props.showHeadline && props.headline.trim();
  const displaySubheadline = props.showSubheadline && props.subheadline.trim();
  const showPrimary = props.showPrimaryCta && props.ctaLabel.trim() && props.ctaHref.trim();
  const showSecondary = props.showSecondaryCta && props.secondaryCtaLabel.trim() && props.secondaryCtaHref.trim();

  const primaryButtonStyle =
    props.primaryCtaBg || props.primaryCtaText
      ? {
          ...(props.primaryCtaBg ? { backgroundColor: props.primaryCtaBg } : {}),
          ...(props.primaryCtaText ? { color: props.primaryCtaText } : {}),
        }
      : undefined;

  const secondaryButtonStyle =
    props.secondaryCtaBg || props.secondaryCtaText
      ? {
          ...(props.secondaryCtaBg ? { backgroundColor: props.secondaryCtaBg } : {}),
          ...(props.secondaryCtaText ? { color: props.secondaryCtaText } : {}),
        }
      : undefined;

  const renderCopy = ({
    layout,
    targetViewport,
    scaled,
  }: {
    layout: HeroLayout;
    targetViewport: HeroViewport;
    scaled?: boolean;
  }) => {
    const isMobile = targetViewport === "mobile";
    const headlineClass = isMobile
      ? MOBILE_HEADLINE_SIZE[props.headlineSize]
      : DESKTOP_HEADLINE_SIZE[props.headlineSize];
    const subheadlineClass = isMobile
      ? MOBILE_SUBHEADLINE_SIZE[props.subheadlineSize]
      : DESKTOP_SUBHEADLINE_SIZE[props.subheadlineSize];
    const centered = layout === "centered";

    const headlineFontSize = heroHeadlineFontSize(props.headlineSize, config.typography.scale);
    const subheadlineFontSize = heroSubheadlineFontSize(props.subheadlineSize, config.typography.scale);

    return (
      <>
        {displayTagline ? (
          <p
            className={cn(
              "font-bold tracking-widest uppercase",
              scaled ? "text-[10px]" : isMobile ? "text-xs" : "text-sm",
              centered && "text-center",
            )}
            style={{
              color: props.taglineColor.trim() || "var(--gym-accent)",
              fontFamily: "var(--gym-font-heading)",
            }}
          >
            {props.tagline}
          </p>
        ) : null}
        {displayHeadline ? (
          <h1
            className={cn(
              "mt-2 leading-tight font-black uppercase",
              scaled ? "text-lg" : headlineClass,
              centered && "mx-auto text-center",
              layout === "classic" && !isMobile && "max-w-2xl",
              layout === "split" && "max-w-xl",
            )}
            style={{
              color: props.headlineColor.trim() || undefined,
              fontFamily: "var(--gym-font-heading)",
              fontSize: scaled ? undefined : headlineFontSize,
            }}
          >
            {props.headline}
          </h1>
        ) : null}
        {displaySubheadline ? (
          <p
            className={cn(
              "mt-2 text-neutral-300",
              scaled ? "line-clamp-2 text-[11px]" : subheadlineClass,
              centered && "mx-auto text-center",
              layout === "classic" && !isMobile && "max-w-xl",
              layout === "split" && "max-w-lg",
            )}
            style={{
              color: props.subheadlineColor.trim() || undefined,
              fontFamily: "var(--gym-font-body)",
              fontSize: scaled ? undefined : subheadlineFontSize,
            }}
          >
            {props.subheadline}
          </p>
        ) : null}
        {showPrimary || showSecondary ? (
          <div
            className={cn(
              "mt-4 flex flex-col gap-2",
              !isMobile && "sm:flex-row",
              centered && "items-center justify-center sm:justify-center",
            )}
          >
            {showPrimary ? (
              scaled ? (
                <span
                  className="inline-flex items-center justify-center rounded-md bg-(--gym-primary) px-2.5 py-1 text-[10px] font-semibold text-(--gym-primary-fg)"
                  style={primaryButtonStyle}
                >
                  {props.ctaLabel}
                </span>
              ) : (
                <Link href={props.ctaHref}>
                  <Button
                    size={compact || isMobile ? "md" : "lg"}
                    className={cn("w-full", !isMobile && "sm:w-auto")}
                    style={primaryButtonStyle}
                  >
                    {props.ctaLabel}
                  </Button>
                </Link>
              )
            ) : null}
            {showSecondary ? (
              scaled ? (
                <span
                  className="inline-flex items-center justify-center rounded-md border border-(--gym-border) bg-(--gym-surface) px-2.5 py-1 text-[10px] font-semibold text-white"
                  style={secondaryButtonStyle}
                >
                  {props.secondaryCtaLabel}
                </span>
              ) : (
                <Link href={props.secondaryCtaHref}>
                  <Button
                    variant="secondary"
                    size={compact || isMobile ? "md" : "lg"}
                    className={cn("w-full", !isMobile && "sm:w-auto")}
                    style={secondaryButtonStyle}
                  >
                    {props.secondaryCtaLabel}
                  </Button>
                </Link>
              )
            ) : null}
          </div>
        ) : null}
      </>
    );
  };

  const renderBackground = (objectPosition?: string, overlay = true) => (
    <>
      <HeroImage
        src={config.images.hero}
        opacity={props.imageOpacity}
        useNativeImage={useNativeImage}
        objectPosition={objectPosition}
      />
      {overlay ? <div className="absolute inset-0" style={getOverlayStyle(props)} aria-hidden /> : null}
    </>
  );

  const renderLayout = (layout: HeroLayout, targetViewport: HeroViewport): ReactNode => {
    const scaled = fitFrame;
    const isMobile = targetViewport === "mobile";

    switch (layout) {
      case "centered":
        return (
          <section
            className={cn(
              "relative overflow-hidden",
              fitFrame ? "h-full w-full" : isMobile ? "min-h-105" : "min-h-120",
            )}
          >
            <div className="absolute inset-0">{renderBackground()}</div>
            <div
              className={cn(
                "relative flex h-full min-h-[inherit] flex-col items-center justify-center px-4 text-center",
                fitFrame ? "py-4" : isMobile ? "py-16" : "py-24",
              )}
            >
              <div className="max-w-3xl">{renderCopy({ layout, targetViewport, scaled })}</div>
            </div>
          </section>
        );

      case "split":
        if (isMobile) {
          return (
            <section className={cn("overflow-hidden bg-(--gym-bg)", fitFrame && "flex h-full flex-col")}>
              <div className={cn("relative", fitFrame ? "flex-1.1 min-h-0" : "min-h-55")}>
                <div className="absolute inset-0">{renderBackground("center top")}</div>
              </div>
              <div className={cn("px-4", fitFrame ? "flex flex-1 flex-col justify-center py-3" : "py-8")}>
                {renderCopy({ layout, targetViewport, scaled })}
              </div>
            </section>
          );
        }
        return (
          <section className="grid min-h-120 grid-cols-2 overflow-hidden bg-(--gym-bg)">
            <div className="flex flex-col justify-center px-8 py-12 lg:px-12">
              {renderCopy({ layout, targetViewport, scaled })}
            </div>
            <div className="relative min-h-70">
              <HeroImage
                src={config.images.hero}
                opacity={Math.min(100, props.imageOpacity + 20)}
                useNativeImage={useNativeImage}
                objectPosition="center"
              />
            </div>
          </section>
        );

      case "showcase":
        if (isMobile) {
          return (
            <section
              className={cn("relative overflow-hidden bg-(--gym-bg)", fitFrame ? "flex h-full flex-col pb-2" : "pb-8")}
            >
              <div className={cn("relative overflow-hidden", fitFrame ? "min-h-0 flex-1" : "rounded-b-8 min-h-60")}>
                <div className="absolute inset-0">{renderBackground("center 20%")}</div>
              </div>
              <div className={cn(fitFrame ? "px-2 pt-1" : "-mt-10 px-4")}>
                <div
                  className={cn(
                    "rounded-2xl border border-(--gym-border) bg-(--gym-surface) shadow-xl",
                    fitFrame ? "p-2" : "p-4",
                  )}
                >
                  {!fitFrame ? (
                    <GalleryAccentStrip config={config} useNativeImage={useNativeImage} className="mb-4" />
                  ) : null}
                  {renderCopy({ layout, targetViewport, scaled })}
                </div>
              </div>
            </section>
          );
        }
        return (
          <section className="relative min-h-130 overflow-hidden bg-(--gym-bg)">
            <div className="mx-auto flex min-h-130 max-w-6xl items-center px-6 py-12">
              <div className="relative z-10 max-w-md pr-8">{renderCopy({ layout, targetViewport, scaled })}</div>
              <div className="absolute top-1/2 right-6 w-[min(52%,520px)] -translate-y-1/2">
                <div className="relative aspect-4/5 overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
                  <HeroImage src={config.images.hero} opacity={props.imageOpacity} useNativeImage={useNativeImage} />
                  <div className="absolute inset-0" style={getOverlayStyle(props)} aria-hidden />
                </div>
                <div className="absolute -bottom-4 -left-6 w-32 overflow-hidden rounded-xl border border-white/20 shadow-lg">
                  <div className="relative aspect-4/3">
                    {config.images.gallery[0] ? (
                      useNativeImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={config.images.gallery[0].url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Image src={config.images.gallery[0].url} alt="" fill className="object-cover" unoptimized />
                      )
                    ) : (
                      <HeroImage
                        src={config.images.hero}
                        opacity={100}
                        useNativeImage={useNativeImage}
                        objectPosition="left center"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      case "classic":
      default:
        return (
          <section
            className={cn(
              "relative overflow-hidden",
              fitFrame ? "h-full w-full" : isMobile ? "min-h-105" : "min-h-130",
            )}
          >
            <div className="absolute inset-0">{renderBackground()}</div>
            <div
              className={cn(
                "relative flex h-full min-h-[inherit] flex-col justify-end",
                fitFrame ? "px-4 py-4" : isMobile ? "px-4 py-16" : "mx-auto max-w-6xl px-4 py-28",
              )}
            >
              {renderCopy({ layout, targetViewport, scaled })}
            </div>
          </section>
        );
    }
  };

  if (viewport) {
    const layout = viewport === "mobile" ? mobileLayout : desktopLayout;
    return <div className={cn(fitFrame && "pointer-events-none h-full w-full")}>{renderLayout(layout, viewport)}</div>;
  }

  return (
    <>
      <div className="md:hidden">{renderLayout(mobileLayout, "mobile")}</div>
      <div className="hidden md:block">{renderLayout(desktopLayout, "desktop")}</div>
    </>
  );
};
