import { Target, TrendingDown, TrendingUp } from "lucide-react";
import { MeasurementTrendChart } from "@/components/profile/measurement-trend-chart";
import { Card } from "@/components/ui/card";
import {
  formatProgressRemaining,
  formatProgressValues,
  type GoalProgressItem,
  type MeasurementProgressSummary,
} from "@/lib/progress";
import { cn } from "@/lib/utils";

type ProfileProgressDashboardProps = {
  summary: MeasurementProgressSummary;
};

const ProgressCard = ({ item }: { item: GoalProgressItem }) => {
  const values = formatProgressValues(item);
  const roundedPercent = Math.round(item.percent);

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-(--gym-border) px-4 py-3.5 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-white">{item.label}</p>
            <p className="mt-0.5 text-sm text-(--gym-muted)">
              {values.current} now · Goal {values.goal}
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-black/30 px-2.5 py-1">
            {item.direction === "decrease" ? (
              <TrendingDown className="h-3.5 w-3.5 text-(--gym-accent)" aria-hidden />
            ) : (
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" aria-hidden />
            )}
            <span className="text-sm font-bold text-white">{roundedPercent}%</span>
          </div>
        </div>

        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-black/40">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              item.percent >= 100 ? "bg-emerald-500" : "bg-linear-to-r from-(--gym-primary) to-(--gym-accent)",
            )}
            style={{ width: `${roundedPercent}%` }}
            role="progressbar"
            aria-valuenow={roundedPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${item.label} progress`}
          />
        </div>

        <p className="mt-2 text-xs text-(--gym-muted)">
          Started at {values.baseline} · {formatProgressRemaining(item)}
        </p>
      </div>

      <div className="bg-black/15 px-4 py-3 sm:px-5">
        <MeasurementTrendChart points={item.trend} goal={item.goal} />
      </div>
    </Card>
  );
};

export const ProfileProgressDashboard = ({ summary }: ProfileProgressDashboardProps) => {
  if (!summary.hasGoals) {
    return (
      <Card className="border-dashed p-6 text-center sm:p-8">
        <Target className="mx-auto h-8 w-8 text-(--gym-muted)" aria-hidden />
        <p className="mt-3 text-lg font-semibold text-white">Set your first goal</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-(--gym-muted)">
          Pick the measurements that matter to you — weight, waist, arms, or anything else. We&apos;ll track your
          progress and show how close you are over time.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {summary.items.map((item) => (
        <ProgressCard key={item.key} item={item} />
      ))}
    </div>
  );
};
