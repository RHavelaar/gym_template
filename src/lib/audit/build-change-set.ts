import type { AuditChange } from "@/types/database";

const valuesEqual = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;
  if (a == null && b == null) return true;
  if (typeof a === "object" && typeof b === "object") {
    return JSON.stringify(a) === JSON.stringify(b);
  }
  return false;
};

export const buildChangeSet = (
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  allowedKeys?: string[],
): AuditChange[] => {
  const keys = allowedKeys ?? [...new Set([...Object.keys(before), ...Object.keys(after)])];
  const changes: AuditChange[] = [];

  for (const field of keys) {
    const oldVal = before[field];
    const newVal = after[field];
    if (!valuesEqual(oldVal, newVal)) {
      changes.push({ field, old: oldVal ?? null, new: newVal ?? null });
    }
  }

  return changes;
};
