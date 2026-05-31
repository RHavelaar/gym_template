import { z } from "zod";
import { GOAL_TRACKABLE_FIELDS } from "@/lib/measurements";

const optionalNumber = z.preprocess(
  (val) => (val === "" || val === null || val === undefined ? undefined : val),
  z.coerce.number().optional(),
);

const optionalCheckbox = z.preprocess(
  (val) => (val === null || val === undefined || val === "" ? undefined : val),
  z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
);

export const measurementGoalsSchema = z.object({
  showProgressOnProfile: optionalCheckbox,
  ...Object.fromEntries(GOAL_TRACKABLE_FIELDS.map((field) => [field.formName, optionalNumber])),
});

export type MeasurementGoalsInput = z.infer<typeof measurementGoalsSchema>;

export const parseMeasurementGoalsFormData = (formData: FormData) =>
  measurementGoalsSchema.safeParse({
    showProgressOnProfile: formData.get("showProgressOnProfile"),
    ...Object.fromEntries(GOAL_TRACKABLE_FIELDS.map((field) => [field.formName, formData.get(field.formName)])),
  });

export const goalsInputToSnapshot = (parsed: MeasurementGoalsInput): Record<string, number | null | boolean> => {
  const snapshot: Record<string, number | null | boolean> = {
    show_progress_on_profile: parsed.showProgressOnProfile ?? true,
  };

  for (const field of GOAL_TRACKABLE_FIELDS) {
    const val = parsed[field.formName as keyof typeof parsed];
    snapshot[field.key] = typeof val === "number" ? val : null;
  }

  return snapshot;
};
