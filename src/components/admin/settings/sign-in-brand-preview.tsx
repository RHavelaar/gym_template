"use client";

import type { CSSProperties } from "react";
import type { GymConfig } from "@/config/types";
import { brandToCssVars } from "@/config";
import { BrandFontLoader } from "@/components/layout/brand-font-loader";
import { getClerkAppearance } from "@/lib/clerk/appearance";
import { cn } from "@/lib/utils";

type SignInBrandPreviewProps = {
  config: GymConfig;
  viewport?: "desktop" | "mobile";
  className?: string;
};

export const SignInBrandPreview = ({ config, viewport = "desktop", className }: SignInBrandPreviewProps) => {
  const appearance = getClerkAppearance(config);
  const isMobile = viewport === "mobile";

  return (
    <div
      className={cn(
        "flex flex-col bg-(--gym-bg) text-white",
        isMobile ? "min-h-120" : "min-h-90 lg:flex-row",
        className,
      )}
      style={{
        ...brandToCssVars(config),
        ...(appearance.variables as CSSProperties),
      }}
    >
      <BrandFontLoader config={config} />

      <div
        className={cn(
          "relative flex flex-1 flex-col justify-between overflow-hidden px-4 py-6",
          !isMobile && "lg:px-8 lg:py-8",
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${config.images.hero})` }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-br from-black via-black/90 to-(--gym-primary)/20"
          aria-hidden
        />

        <div className="relative z-10 flex items-center gap-2">
          {config.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={config.logoUrl} alt="" className="h-8 w-8 rounded object-contain" />
          ) : null}
          <span className="text-lg font-black tracking-tight uppercase">{config.name}</span>
        </div>

        <div className="relative z-10 mt-6">
          <p className="text-[10px] font-semibold tracking-widest text-(--gym-accent) uppercase">Member access</p>
          <h2
            className={cn("mt-2 leading-tight font-black uppercase", isMobile ? "text-xl" : "text-2xl lg:text-3xl")}
            style={{ fontFamily: "var(--gym-font-heading)" }}
          >
            {config.tagline}
          </h2>
          <p className="mt-2 line-clamp-3 text-sm text-(--gym-muted)" style={{ fontFamily: "var(--gym-font-body)" }}>
            {config.description}
          </p>
        </div>

        <p className="relative z-10 mt-4 text-xs text-(--gym-muted)">Back to site</p>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-6 lg:px-6">
        <div
          className="w-full max-w-sm rounded-xl border p-5 shadow-xl"
          style={{
            backgroundColor: appearance.variables.colorBackground,
            borderColor: appearance.variables.colorBorder,
          }}
        >
          <p className="text-center text-lg font-semibold" style={{ fontFamily: appearance.variables.fontFamily }}>
            Sign in
          </p>
          <p className="mt-1 text-center text-xs" style={{ color: appearance.variables.colorMutedForeground }}>
            Clerk sign-in form appears here for members
          </p>
          <div
            className="mt-4 space-y-2 rounded-lg border px-3 py-2.5 text-sm"
            style={{
              backgroundColor: appearance.variables.colorInput,
              borderColor: appearance.variables.colorBorder,
              color: appearance.variables.colorInputForeground,
            }}
          >
            Email address
          </div>
          <div
            className="mt-2 rounded-lg px-3 py-2.5 text-center text-sm font-semibold"
            style={{
              backgroundColor: appearance.variables.colorPrimary,
              color: appearance.variables.colorPrimaryForeground,
            }}
          >
            Continue
          </div>
        </div>
      </div>
    </div>
  );
};
