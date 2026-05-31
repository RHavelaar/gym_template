import {
  formatMeasurementValue,
  GOAL_TRACKABLE_FIELD_KEYS,
  MEASUREMENT_FIELD_MAP,
  measurementToSnapshot,
  profileToMeasurementSnapshot,
  type GoalTrackableFieldKey,
  type MeasurementFieldKey,
} from "@/lib/measurements";
import type { Profile, ProfileMeasurement } from "@/types/database";

export type GoalProgressItem = {
  key: GoalTrackableFieldKey;
  label: string;
  unit: "in" | "lbs" | "pct";
  baseline: number;
  current: number;
  goal: number;
  percent: number;
  remaining: number;
  direction: "increase" | "decrease";
  trend: { date: string; value: number }[];
};

export type MeasurementProgressSummary = {
  items: GoalProgressItem[];
  hasGoals: boolean;
  showOnProfile: boolean;
};

const clampPercent = (value: number) => Math.min(100, Math.max(0, value));

export const computeGoalProgress = (
  baseline: number,
  current: number,
  goal: number,
): { percent: number; remaining: number; direction: "increase" | "decrease" } => {
  const direction: "increase" | "decrease" = goal >= baseline ? "increase" : "decrease";

  if (direction === "increase") {
    const span = goal - baseline;
    if (span === 0) {
      return { percent: current >= goal ? 100 : 0, remaining: Math.max(0, goal - current), direction };
    }
    const done = current - baseline;
    return {
      percent: clampPercent((done / span) * 100),
      remaining: Math.max(0, goal - current),
      direction,
    };
  }

  const span = baseline - goal;
  if (span === 0) {
    return { percent: current <= goal ? 100 : 0, remaining: Math.max(0, current - goal), direction };
  }
  const done = baseline - current;
  return {
    percent: clampPercent((done / span) * 100),
    remaining: Math.max(0, current - goal),
    direction,
  };
};

const getBaselineValue = (
  key: GoalTrackableFieldKey,
  history: ProfileMeasurement[],
  profile: Profile,
): number | null => {
  const chronological = [...history].reverse();
  for (const entry of chronological) {
    const snap = measurementToSnapshot(entry);
    const value = snap[key];
    if (value != null) return value;
  }

  const profileSnap = profileToMeasurementSnapshot(profile);
  const profileVal = key === "weight_lbs" ? profileSnap.weight_lbs : profileSnap[key as MeasurementFieldKey];
  return profileVal ?? null;
};

const getTrendForField = (
  key: GoalTrackableFieldKey,
  history: ProfileMeasurement[],
): { date: string; value: number }[] => {
  const points: { date: string; value: number }[] = [];

  for (const entry of [...history].reverse()) {
    const snap = measurementToSnapshot(entry);
    const value = snap[key];
    if (value != null) {
      points.push({ date: entry.recorded_at, value });
    }
  }

  return points;
};

export const buildMeasurementProgressSummary = (
  profile: Profile,
  goals: Partial<Record<GoalTrackableFieldKey, number | null>> | null,
  history: ProfileMeasurement[],
  showOnProfile = true,
): MeasurementProgressSummary => {
  if (!goals) {
    return { items: [], hasGoals: false, showOnProfile };
  }

  const currentSnap = profileToMeasurementSnapshot(profile);
  const items: GoalProgressItem[] = [];

  for (const key of GOAL_TRACKABLE_FIELD_KEYS) {
    const goal = goals[key];
    if (goal == null) continue;

    const baseline = getBaselineValue(key, history, profile);
    const current = currentSnap[key as MeasurementFieldKey] ?? null;
    if (baseline == null || current == null) continue;

    const { percent, remaining, direction } = computeGoalProgress(baseline, current, goal);
    const field = MEASUREMENT_FIELD_MAP[key as MeasurementFieldKey];

    items.push({
      key,
      label: field.shortLabel,
      unit: field.unit,
      baseline,
      current,
      goal,
      percent,
      remaining,
      direction,
      trend: getTrendForField(key, history),
    });
  }

  items.sort((a, b) => b.percent - a.percent);

  return {
    items,
    hasGoals: items.length > 0,
    showOnProfile,
  };
};

export const formatProgressRemaining = (item: GoalProgressItem): string => {
  const formatted = formatMeasurementValue(item.key as MeasurementFieldKey, item.remaining);
  if (item.direction === "decrease") {
    return `${formatted} to go`;
  }
  return `${formatted} to reach goal`;
};

export const formatProgressValues = (item: GoalProgressItem) => ({
  baseline: formatMeasurementValue(item.key as MeasurementFieldKey, item.baseline),
  current: formatMeasurementValue(item.key as MeasurementFieldKey, item.current),
  goal: formatMeasurementValue(item.key as MeasurementFieldKey, item.goal),
});
