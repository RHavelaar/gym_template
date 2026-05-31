import { describe, it, expect } from "vitest";
import { prSubmitSchema } from "@/lib/validation/pr";

describe("prSubmitSchema", () => {
  it("accepts valid machine PR", () => {
    const result = prSubmitSchema.safeParse({
      targetType: "machine",
      machineId: "machine-leg-press",
      value: "405",
      genderDivision: "male",
    });
    expect(result.success).toBe(true);
  });

  it("accepts optional bodyweight and notes", () => {
    const result = prSubmitSchema.safeParse({
      targetType: "lift",
      liftId: "lift-squat",
      value: "315",
      bodyweight: "185",
      genderDivision: "open",
      notes: "Competition single",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.bodyweight).toBe(185);
      expect(result.data.notes).toBe("Competition single");
    }
  });

  it("rejects non-positive value", () => {
    const result = prSubmitSchema.safeParse({
      targetType: "lift",
      liftId: "lift-squat",
      value: "0",
      genderDivision: "open",
    });
    expect(result.success).toBe(false);
  });
});
