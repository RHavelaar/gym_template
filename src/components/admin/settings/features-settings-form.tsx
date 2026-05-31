"use client";

import { useState } from "react";
import type { GymConfig } from "@/config/types";
import { updateFeaturesAction } from "@/app/actions/content";
import { SettingsEditorShell } from "@/components/admin/settings/settings-editor-shell";
import { FeaturesPreview } from "@/components/admin/settings/brand-nav-preview";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InfoHint, SettingSectionTitle } from "@/components/ui/info-hint";
import { useAppAction } from "@/hooks/use-app-action";

type FeaturesSettingsFormProps = {
  initialConfig: GymConfig;
};

const FEATURE_TOGGLES: {
  key: keyof GymConfig["features"];
  label: string;
  hint: string;
  recommendation: string;
}[] = [
  {
    key: "socialFeed",
    label: "Gym Feed",
    hint: "Member social feed at /feed — posts, reactions, and gym updates.",
    recommendation: "Turn on if you want members sharing PRs and gym culture in-app.",
  },
  {
    key: "competitions",
    label: "Competitions",
    hint: "Public competition pages and staff admin tools for events.",
    recommendation: "Enable when you run in-house comps or sanctioned meets.",
  },
  {
    key: "achievements",
    label: "Achievements",
    hint: "Badges and progress celebrations on member profiles.",
    recommendation: "Great for retention — pairs well with leaderboards.",
  },
  {
    key: "prModeration",
    label: "PR moderation",
    hint: "Staff review queue before PRs appear on leaderboards.",
    recommendation: "Keep on if you verify lifts; turn off for honor-system gyms.",
  },
  {
    key: "leaderboards",
    label: "Leaderboards",
    hint: "Public leaderboard pages ranked by lift and bodyweight.",
    recommendation: "Core engagement feature — most gyms leave this on.",
  },
];

export const FeaturesSettingsForm = ({ initialConfig }: FeaturesSettingsFormProps) => {
  const [draft, setDraft] = useState(initialConfig);
  const { runAction, pending: saving } = useAppAction();

  const handleToggle = (key: keyof GymConfig["features"]) => {
    setDraft({
      ...draft,
      features: { ...draft.features, [key]: !draft.features[key] },
    });
  };

  const handleSave = async () => {
    await runAction(() => updateFeaturesAction(draft.features), {
      successMessage: "Feature settings saved.",
    });
  };

  return (
    <SettingsEditorShell
      title="Features"
      description="Turn gym modules on or off for members and staff."
      previews={[
        {
          id: "features",
          label: "Navigation & modules preview",
          content: <FeaturesPreview config={draft} />,
        },
      ]}
      form={
        <>
          <Card id="edit-features" className="scroll-mt-24 space-y-4 transition-shadow">
            <SettingSectionTitle
              title="Gym modules"
              hint="Each toggle controls whether members and staff see that section in navigation and on the site."
              description="Off hides the feature from members — existing data is kept. Preview on the right shows what stays visible."
            />
            {FEATURE_TOGGLES.map(({ key, label, hint, recommendation }) => (
              <div key={key} className="rounded-lg border border-(--gym-border) p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={draft.features[key]}
                    onChange={() => handleToggle(key)}
                    className="mt-1"
                    aria-describedby={`feature-rec-${key}`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="font-medium">{label}</span>
                      <InfoHint content={hint} label={`About ${label}`} />
                    </span>
                    <p id={`feature-rec-${key}`} className="mt-1 text-xs text-(--gym-muted)">
                      <span className="text-neutral-400">Recommended:</span> {recommendation}
                    </p>
                  </span>
                </label>
              </div>
            ))}
          </Card>

          <Button type="button" size="lg" className="w-full" disabled={saving} onClick={handleSave}>
            {saving ? "Saving…" : "Save features"}
          </Button>
        </>
      }
    />
  );
};
