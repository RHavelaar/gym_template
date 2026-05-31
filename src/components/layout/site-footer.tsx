"use client";

import type { GymConfig } from "@/config/types";
import { BusinessContactDisplay } from "@/components/business/business-contact-display";

type SiteFooterProps = { config: GymConfig };

export const SiteFooter = ({ config }: SiteFooterProps) => (
  <footer className="mt-auto border-t border-(--gym-border) bg-black py-10">
    <div className="mx-auto max-w-6xl px-4 text-center text-sm text-(--gym-muted)">
      <p className="font-semibold text-white">{config.name}</p>
      <p className="mt-1">{config.tagline}</p>
      <div className="mt-4">
        <BusinessContactDisplay config={config} placement="footer" variant="footer" />
      </div>
    </div>
  </footer>
);
