import type { BodyProgressMetadata, Post } from "@/types/database";
import { formatDate } from "@/lib/utils";
import { formatMeasurementDelta, MEASUREMENT_FIELD_MAP, type MeasurementFieldKey } from "@/lib/measurements";
import { Card } from "@/components/ui/card";
import { Sparkles, TrendingDown, TrendingUp, Minus } from "lucide-react";

type ProgressCelebrationPostProps = {
  post: Post;
  authorName: string;
  metadata: BodyProgressMetadata;
};

const fieldLabels: Record<string, string> = Object.fromEntries(
  Object.entries(MEASUREMENT_FIELD_MAP).map(([key, field]) => [key, field.label]),
);

const formatDelta = (key: string, delta: number) => formatMeasurementDelta(key as MeasurementFieldKey, delta);

const DeltaIcon = ({ delta }: { delta: number }) => {
  if (delta < 0) return <TrendingDown size={18} className="text-emerald-400" aria-hidden />;
  if (delta > 0) return <TrendingUp size={18} className="text-amber-400" aria-hidden />;
  return <Minus size={18} className="text-(--gym-muted)" aria-hidden />;
};

export const ProgressCelebrationPost = ({ post, authorName, metadata }: ProgressCelebrationPostProps) => {
  const sharedFields = metadata.shared_fields ?? Object.keys(metadata.deltas);
  const entries = sharedFields
    .filter((key) => metadata.deltas[key] != null)
    .map((key) => ({
      key,
      label: fieldLabels[key] ?? key,
      delta: metadata.deltas[key]!,
    }));

  return (
    <Card className="relative overflow-hidden border-(--gym-primary)/40 bg-linear-to-br from-(--gym-surface) to-black">
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, var(--gym-accent) 0%, transparent 40%), radial-gradient(circle at 80% 0%, var(--gym-primary) 0%, transparent 35%)",
        }}
      />
      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-bold">{authorName}</p>
            <p className="text-xs text-(--gym-muted)">{formatDate(post.created_at)}</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-(--gym-primary)/20 px-3 py-1 text-xs font-bold text-(--gym-accent) uppercase">
            <Sparkles size={14} aria-hidden />
            Progress
          </span>
        </div>

        <p className="mt-4 text-lg leading-tight font-black text-white uppercase">{post.content}</p>

        {entries.length > 0 && (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {entries.map(({ key, label, delta }) => (
              <div key={key} className="rounded-xl border border-white/10 bg-black/40 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs tracking-wide text-(--gym-muted) uppercase">{label}</p>
                  <DeltaIcon delta={delta} />
                </div>
                <p className="mt-2 text-2xl font-black text-white">{formatDelta(key, delta)}</p>
                {key === "weight_lbs" && <p className="mt-1 text-xs text-(--gym-muted)">since last check-in</p>}
              </div>
            ))}
          </div>
        )}

        <p className="mt-4 text-sm font-semibold text-(--gym-accent)">Keep showing up — the board is watching.</p>
      </div>
    </Card>
  );
};

export const isBodyProgressPost = (post: Post): post is Post & { metadata: BodyProgressMetadata } => {
  const meta = post.metadata;
  return (
    post.post_type === "progress" &&
    typeof meta === "object" &&
    meta !== null &&
    "kind" in meta &&
    meta.kind === "body_progress"
  );
};
