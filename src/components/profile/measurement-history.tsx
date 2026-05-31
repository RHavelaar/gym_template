import { CalendarDays } from "lucide-react";
import { formatDate, formatRelativeDate } from "@/lib/utils";
import { getMeasurementEntries, measurementToSnapshot } from "@/lib/measurements";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { ProfileMeasurement } from "@/types/database";

type MeasurementHistoryProps = {
  measurements: ProfileMeasurement[];
};

export const MeasurementHistory = ({ measurements }: MeasurementHistoryProps) => {
  if (measurements.length === 0) {
    return (
      <Card className="border-dashed p-6 text-center sm:p-8">
        <CalendarDays className="mx-auto h-8 w-8 text-(--gym-muted)" aria-hidden />
        <CardTitle className="mt-3 text-lg">No check-ins yet</CardTitle>
        <CardDescription className="mx-auto mt-2 max-w-xs text-base leading-relaxed">
          Each time you save, a new entry appears here so you can see your progress over time.
        </CardDescription>
      </Card>
    );
  }

  return (
    <ol className="relative space-y-0">
      {measurements.map((measurement, index) => {
        const entries = getMeasurementEntries(measurementToSnapshot(measurement));
        const isLast = index === measurements.length - 1;

        return (
          <li key={measurement.id} className="relative flex gap-4 pb-6 last:pb-0">
            {/* Timeline line */}
            {!isLast && (
              <span className="absolute top-10 bottom-0 left-[1.125rem] w-px bg-(--gym-border)" aria-hidden />
            )}

            {/* Timeline dot */}
            <div
              className="relative z-10 mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-(--gym-primary) bg-(--gym-surface)"
              aria-hidden
            >
              <span className="h-2.5 w-2.5 rounded-full bg-(--gym-primary)" />
            </div>

            <Card className="min-w-0 flex-1 p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-bold sm:text-lg">
                    {formatRelativeDate(measurement.recorded_at)}
                  </CardTitle>
                  <CardDescription className="mt-0.5 text-xs sm:text-sm">
                    {formatDate(measurement.recorded_at)}
                    {measurement.notes ? ` · ${measurement.notes}` : ""}
                  </CardDescription>
                </div>
                {entries.length > 0 && (
                  <span className="rounded-full bg-(--gym-primary)/15 px-2.5 py-1 text-xs font-medium text-(--gym-accent)">
                    {entries.length} {entries.length === 1 ? "stat" : "stats"}
                  </span>
                )}
              </div>

              {entries.length > 0 ? (
                <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {entries.map(({ key, label, value }) => (
                    <div key={key} className="rounded-xl border border-(--gym-border)/80 bg-black/25 px-3 py-2.5">
                      <dt className="text-xs font-medium text-(--gym-muted)">{label}</dt>
                      <dd className="mt-0.5 text-base font-semibold text-white">{value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="mt-3 text-sm text-(--gym-muted)">Profile info updated — no new measurements this time.</p>
              )}
            </Card>
          </li>
        );
      })}
    </ol>
  );
};
