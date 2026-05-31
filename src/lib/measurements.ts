import { formatHeight, formatWeight } from "@/lib/utils";
import type { ProfileMeasurement } from "@/types/database";

export type MeasurementFieldKey =
  | "height_in"
  | "weight_lbs"
  | "body_fat_pct"
  | "neck_in"
  | "shoulders_in"
  | "chest_in"
  | "waist_in"
  | "hips_in"
  | "glutes_in"
  | "biceps_left_in"
  | "biceps_right_in"
  | "forearm_left_in"
  | "forearm_right_in"
  | "wrist_in"
  | "thigh_left_in"
  | "thigh_right_in"
  | "calf_left_in"
  | "calf_right_in"
  | "ankle_in";

export type MeasurementSnapshot = Partial<Record<MeasurementFieldKey, number | null>>;

export type MeasurementFieldDef = {
  key: MeasurementFieldKey;
  formName: string;
  label: string;
  shortLabel: string;
  unit: "in" | "lbs" | "pct";
  step: number;
  min?: number;
  max?: number;
  placeholder?: string;
};

export type MeasurementSection = {
  id: string;
  title: string;
  description: string;
  fields: MeasurementFieldDef[];
};

export const MEASUREMENT_SECTIONS: MeasurementSection[] = [
  {
    id: "basics",
    title: "Basics",
    description: "Height, weight, and overall composition.",
    fields: [
      {
        key: "height_in",
        formName: "heightIn",
        label: "Height",
        shortLabel: "Height",
        unit: "in",
        step: 0.5,
        min: 48,
        max: 96,
        placeholder: "70",
      },
      {
        key: "weight_lbs",
        formName: "weightLbs",
        label: "Weight",
        shortLabel: "Weight",
        unit: "lbs",
        step: 0.1,
        min: 50,
        placeholder: "185",
      },
      {
        key: "body_fat_pct",
        formName: "bodyFatPct",
        label: "Body fat",
        shortLabel: "Body fat",
        unit: "pct",
        step: 0.1,
        min: 3,
        max: 60,
        placeholder: "Optional",
      },
      {
        key: "neck_in",
        formName: "neckIn",
        label: "Neck",
        shortLabel: "Neck",
        unit: "in",
        step: 0.25,
      },
    ],
  },
  {
    id: "torso",
    title: "Torso",
    description: "Shoulders through hips.",
    fields: [
      {
        key: "shoulders_in",
        formName: "shouldersIn",
        label: "Shoulders",
        shortLabel: "Shoulders",
        unit: "in",
        step: 0.25,
      },
      {
        key: "chest_in",
        formName: "chestIn",
        label: "Chest",
        shortLabel: "Chest",
        unit: "in",
        step: 0.25,
      },
      {
        key: "waist_in",
        formName: "waistIn",
        label: "Waist",
        shortLabel: "Waist",
        unit: "in",
        step: 0.25,
      },
      {
        key: "hips_in",
        formName: "hipsIn",
        label: "Hips",
        shortLabel: "Hips",
        unit: "in",
        step: 0.25,
      },
      {
        key: "glutes_in",
        formName: "glutesIn",
        label: "Glutes",
        shortLabel: "Glutes",
        unit: "in",
        step: 0.25,
      },
    ],
  },
  {
    id: "arms",
    title: "Arms",
    description: "Biceps, forearms, and wrists.",
    fields: [
      {
        key: "biceps_left_in",
        formName: "bicepsLeftIn",
        label: "Bicep (left)",
        shortLabel: "Bicep L",
        unit: "in",
        step: 0.25,
      },
      {
        key: "biceps_right_in",
        formName: "bicepsRightIn",
        label: "Bicep (right)",
        shortLabel: "Bicep R",
        unit: "in",
        step: 0.25,
      },
      {
        key: "forearm_left_in",
        formName: "forearmLeftIn",
        label: "Forearm (left)",
        shortLabel: "Forearm L",
        unit: "in",
        step: 0.25,
      },
      {
        key: "forearm_right_in",
        formName: "forearmRightIn",
        label: "Forearm (right)",
        shortLabel: "Forearm R",
        unit: "in",
        step: 0.25,
      },
      {
        key: "wrist_in",
        formName: "wristIn",
        label: "Wrist",
        shortLabel: "Wrist",
        unit: "in",
        step: 0.25,
      },
    ],
  },
  {
    id: "legs",
    title: "Legs",
    description: "Thighs, calves, and ankles.",
    fields: [
      {
        key: "thigh_left_in",
        formName: "thighLeftIn",
        label: "Thigh (left)",
        shortLabel: "Thigh L",
        unit: "in",
        step: 0.25,
      },
      {
        key: "thigh_right_in",
        formName: "thighRightIn",
        label: "Thigh (right)",
        shortLabel: "Thigh R",
        unit: "in",
        step: 0.25,
      },
      {
        key: "calf_left_in",
        formName: "calfLeftIn",
        label: "Calf (left)",
        shortLabel: "Calf L",
        unit: "in",
        step: 0.25,
      },
      {
        key: "calf_right_in",
        formName: "calfRightIn",
        label: "Calf (right)",
        shortLabel: "Calf R",
        unit: "in",
        step: 0.25,
      },
      {
        key: "ankle_in",
        formName: "ankleIn",
        label: "Ankle",
        shortLabel: "Ankle",
        unit: "in",
        step: 0.25,
      },
    ],
  },
];

export const ALL_MEASUREMENT_FIELDS = MEASUREMENT_SECTIONS.flatMap((section) => section.fields);

export const MEASUREMENT_FIELD_MAP = Object.fromEntries(
  ALL_MEASUREMENT_FIELDS.map((field) => [field.key, field]),
) as Record<MeasurementFieldKey, MeasurementFieldDef>;

export const MEASUREMENT_FIELD_LABELS: Record<MeasurementFieldKey, string> = Object.fromEntries(
  ALL_MEASUREMENT_FIELDS.map((field) => [field.key, field.label]),
) as Record<MeasurementFieldKey, string>;

export const MEASUREMENT_FIELD_KEYS = ALL_MEASUREMENT_FIELDS.map((field) => field.key) as MeasurementFieldKey[];

/** Fields members can set goals for (height is fixed after initial profile setup). */
export const GOAL_TRACKABLE_FIELD_KEYS = MEASUREMENT_FIELD_KEYS.filter((key) => key !== "height_in") as Exclude<
  MeasurementFieldKey,
  "height_in"
>[];

export type GoalTrackableFieldKey = (typeof GOAL_TRACKABLE_FIELD_KEYS)[number];

export const GOAL_TRACKABLE_FIELDS = ALL_MEASUREMENT_FIELDS.filter((field) => field.key !== "height_in");

export const CHECKIN_FIELD_KEYS = GOAL_TRACKABLE_FIELD_KEYS;

export const goalsToSnapshot = (
  goals: Partial<Record<GoalTrackableFieldKey, number | null>>,
): Partial<Record<GoalTrackableFieldKey, number | null>> =>
  Object.fromEntries(GOAL_TRACKABLE_FIELD_KEYS.map((key) => [key, goals[key] ?? null])) as Partial<
    Record<GoalTrackableFieldKey, number | null>
  >;

export const profileGoalsFromRow = (
  row: Record<string, unknown>,
): Partial<Record<GoalTrackableFieldKey, number | null>> => {
  const num = (v: unknown) => (v != null ? Number(v) : null);
  return Object.fromEntries(GOAL_TRACKABLE_FIELD_KEYS.map((key) => [key, num(row[key])])) as Partial<
    Record<GoalTrackableFieldKey, number | null>
  >;
};

export const formatMeasurementValue = (key: MeasurementFieldKey, value: number | null | undefined): string => {
  if (value == null) return "—";

  if (key === "height_in") return formatHeight(value);
  if (key === "weight_lbs") return formatWeight(value);
  if (key === "body_fat_pct") return `${value}%`;

  return `${value}"`;
};

export const formatMeasurementDelta = (key: MeasurementFieldKey, delta: number) => {
  const sign = delta > 0 ? "+" : "";
  if (key === "weight_lbs") return `${sign}${delta} lbs`;
  if (key === "body_fat_pct") return `${sign}${delta}%`;
  if (key === "height_in") return `${sign}${delta}"`;
  if (key.endsWith("_in")) return `${sign}${delta}"`;
  return `${sign}${delta}`;
};

export const getMeasurementEntries = (
  record: MeasurementSnapshot,
): { key: MeasurementFieldKey; label: string; value: string }[] =>
  MEASUREMENT_FIELD_KEYS.flatMap((key) => {
    const value = record[key];
    if (value == null) return [];
    return [
      {
        key,
        label: MEASUREMENT_FIELD_MAP[key].shortLabel,
        value: formatMeasurementValue(key, value),
      },
    ];
  });

export const profileToMeasurementSnapshot = (profile: {
  bodyweight_lbs: number | null;
  height_in: number | null;
  body_fat_pct: number | null;
  neck_in: number | null;
  shoulders_in: number | null;
  chest_in: number | null;
  waist_in: number | null;
  hips_in: number | null;
  glutes_in: number | null;
  biceps_left_in: number | null;
  biceps_right_in: number | null;
  forearm_left_in: number | null;
  forearm_right_in: number | null;
  wrist_in: number | null;
  thigh_left_in: number | null;
  thigh_right_in: number | null;
  calf_left_in: number | null;
  calf_right_in: number | null;
  ankle_in: number | null;
}): MeasurementSnapshot => ({
  height_in: profile.height_in,
  weight_lbs: profile.bodyweight_lbs,
  body_fat_pct: profile.body_fat_pct,
  neck_in: profile.neck_in,
  shoulders_in: profile.shoulders_in,
  chest_in: profile.chest_in,
  waist_in: profile.waist_in,
  hips_in: profile.hips_in,
  glutes_in: profile.glutes_in,
  biceps_left_in: profile.biceps_left_in,
  biceps_right_in: profile.biceps_right_in,
  forearm_left_in: profile.forearm_left_in,
  forearm_right_in: profile.forearm_right_in,
  wrist_in: profile.wrist_in,
  thigh_left_in: profile.thigh_left_in,
  thigh_right_in: profile.thigh_right_in,
  calf_left_in: profile.calf_left_in,
  calf_right_in: profile.calf_right_in,
  ankle_in: profile.ankle_in,
});

export const measurementToSnapshot = (measurement: ProfileMeasurement): MeasurementSnapshot => ({
  height_in: measurement.height_in,
  weight_lbs: measurement.weight_lbs,
  body_fat_pct: measurement.body_fat_pct,
  neck_in: measurement.neck_in,
  shoulders_in: measurement.shoulders_in,
  chest_in: measurement.chest_in,
  waist_in: measurement.waist_in,
  hips_in: measurement.hips_in,
  glutes_in: measurement.glutes_in,
  biceps_left_in: measurement.biceps_left_in,
  biceps_right_in: measurement.biceps_right_in,
  forearm_left_in: measurement.forearm_left_in,
  forearm_right_in: measurement.forearm_right_in,
  wrist_in: measurement.wrist_in,
  thigh_left_in: measurement.thigh_left_in,
  thigh_right_in: measurement.thigh_right_in,
  calf_left_in: measurement.calf_left_in,
  calf_right_in: measurement.calf_right_in,
  ankle_in: measurement.ankle_in,
});
