"use client";

import { useState } from "react";
import type { GymConfig } from "@/config/types";
import { BusinessContactDisplay } from "@/components/business/business-contact-display";
import { SettingsLivePreviewPanel } from "@/components/admin/settings/settings-live-preview-panel";
import type { SettingsPreviewDevice } from "@/components/admin/settings/settings-live-preview-panel";
import { cn } from "@/lib/utils";

type BusinessSettingsPreviewProps = {
  config: GymConfig;
};

type PreviewView = "contact" | "footer" | "homepage";

export const BusinessSettingsPreview = ({ config }: BusinessSettingsPreviewProps) => {
  const [device, setDevice] = useState<SettingsPreviewDevice>("desktop");
  const [view, setView] = useState<PreviewView>("contact");

  const toolbar = (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Preview view">
      {(
        [
          { id: "contact" as const, label: "Contact page" },
          { id: "footer" as const, label: "Footer" },
          { id: "homepage" as const, label: "Homepage sections" },
        ] as const
      ).map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={view === tab.id}
          onClick={() => setView(tab.id)}
          className={cn(
            "rounded-md border px-3 py-1.5 text-xs font-medium transition",
            view === tab.id
              ? "border-(--gym-accent) bg-(--gym-accent)/10 text-white"
              : "border-(--gym-border) text-(--gym-muted) hover:text-white",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  const previewBody = (() => {
    if (view === "contact") {
      return (
        <div className="rounded-lg border border-(--gym-border) bg-(--gym-surface) p-4">
          <p className="text-lg font-semibold">Contact {config.name}</p>
          <p className="mt-1 text-xs text-(--gym-muted)">Draft — not saved until you click Save</p>
          <div className="mt-4">
            <BusinessContactDisplay config={config} placement="contactPage" />
          </div>
        </div>
      );
    }

    if (view === "footer") {
      return (
        <div className="rounded-lg border border-(--gym-border) bg-black p-4 text-center text-sm text-(--gym-muted)">
          <p className="font-semibold text-white">{config.name}</p>
          <p className="mt-1">{config.tagline}</p>
          <div className="mt-3">
            <BusinessContactDisplay config={config} placement="footer" variant="footer" />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold tracking-wide text-(--gym-muted) uppercase">Hours section</p>
          <div className="mt-2">
            <BusinessContactDisplay config={config} placement="homepageHours" />
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-wide text-(--gym-muted) uppercase">Location section</p>
          <div className="mt-2 rounded-lg border border-(--gym-border) bg-(--gym-surface) p-4">
            <BusinessContactDisplay config={config} placement="homepageLocation" />
          </div>
        </div>
        {config.business.visibility.membershipBlurb.showOnHomepage ? (
          <div>
            <p className="text-xs font-semibold tracking-wide text-(--gym-muted) uppercase">Membership blurb</p>
            <p className="mt-2 text-sm text-neutral-300">{config.business.membershipBlurb}</p>
          </div>
        ) : (
          <p className="text-xs text-(--gym-muted)">Membership blurb hidden on homepage.</p>
        )}
      </div>
    );
  })();

  return (
    <SettingsLivePreviewPanel
      title="Where visitors see this info"
      helperText="Switch views to check the contact page, footer, and homepage sections before saving."
      device={device}
      onDeviceChange={setDevice}
      toolbar={toolbar}
      showFullscreen={false}
      useMobileFrame={device === "mobile"}
      preview={previewBody}
    />
  );
};
