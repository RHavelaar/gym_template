import type { ZodError } from "zod";
import { brandSchema } from "@/lib/validation/content";

export const validateBrandDraft = (input: unknown) => brandSchema.safeParse(input);

export const formatBrandFieldErrors = (error: ZodError): Record<string, string> => {
  const fieldErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!key || fieldErrors[key]) continue;
    fieldErrors[key] = issue.message;
  }

  return fieldErrors;
};

export const brandFieldErrorSection = (fieldKey: string): string | null => {
  if (fieldKey === "name" || fieldKey === "tagline" || fieldKey === "description" || fieldKey === "logoUrl") {
    return "identity";
  }
  if (fieldKey.startsWith("theme.")) return "colors";
  if (fieldKey.startsWith("typography.")) return "typography";
  if (fieldKey.startsWith("seo.")) return "seo";
  return null;
};

export const firstBrandErrorSection = (fieldErrors: Record<string, string>, sectionOrder: string[]): string | null => {
  for (const sectionId of sectionOrder) {
    if (Object.keys(fieldErrors).some((key) => brandFieldErrorSection(key) === sectionId)) {
      return sectionId;
    }
  }
  return null;
};
