"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InfoHint } from "@/components/ui/info-hint";
import { SpotterMark } from "@/components/admin/settings/spotter-mark";
import { SPOTTER } from "@/lib/spotter";

type BrandAiPanelProps = {
  aiEnabled: boolean;
  reviewPending: boolean;
  onWriteCopy: () => void;
  onReviewCopy: () => void;
};

export const BrandAiPanel = ({ aiEnabled, reviewPending, onWriteCopy, onReviewCopy }: BrandAiPanelProps) => (
  <Card className="space-y-4 p-4 sm:p-5">
    <div className="flex items-start gap-3">
      <SpotterMark size={40} className="mt-0.5 ring-1 ring-(--gym-border)" />
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-1.5">
          <h2 className="text-lg font-bold text-white">{SPOTTER.name}</h2>
          <InfoHint content={SPOTTER.about} label={`About ${SPOTTER.name}`} />
        </div>
        <p className="text-sm text-(--gym-muted)">{SPOTTER.tagline}</p>
      </div>
    </div>

    {!aiEnabled ? (
      <p className="rounded-lg border border-(--gym-border) bg-black/20 px-3 py-2 text-sm text-(--gym-muted)">
        Add an AI Gateway key in your environment to enable {SPOTTER.name}.
      </p>
    ) : null}

    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      <Button type="button" disabled={!aiEnabled} onClick={onWriteCopy}>
        Write my brand copy
      </Button>
      <Button type="button" variant="secondary" disabled={!aiEnabled || reviewPending} onClick={onReviewCopy}>
        {reviewPending ? "Reviewing…" : "Review my brand copy"}
      </Button>
    </div>
  </Card>
);
