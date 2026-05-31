import { z } from "zod";
import { ALL_MEASUREMENT_FIELDS } from "@/lib/measurements";

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

export const fitnessProfileSchema = z.object({
  displayName: z.string().min(2).max(80).optional(),
  bio: z.string().max(500).optional(),
  genderDivision: z.enum(["open", "male", "female", "non_binary"]),
  notes: z.string().max(500).optional(),
  shareToFeed: optionalCheckbox,
  ...Object.fromEntries(ALL_MEASUREMENT_FIELDS.map((field) => [field.formName, optionalNumber])),
});

export type FitnessProfileInput = z.infer<typeof fitnessProfileSchema>;

export const parseFitnessProfileFormData = (formData: FormData) =>
  fitnessProfileSchema.safeParse({
    displayName: formData.get("displayName") || undefined,
    bio: formData.get("bio") || undefined,
    genderDivision: formData.get("genderDivision"),
    notes: formData.get("notes") || undefined,
    shareToFeed: formData.get("shareToFeed"),
    ...Object.fromEntries(ALL_MEASUREMENT_FIELDS.map((field) => [field.formName, formData.get(field.formName)])),
  });
