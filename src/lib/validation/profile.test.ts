import { describe, expect, it } from "vitest";
import { fitnessProfileSchema } from "@/lib/validation/profile";

describe("fitness profile validation", () => {
  it("accepts a minimal check-in with unchecked shareToFeed", () => {
    const result = fitnessProfileSchema.safeParse({
      displayName: "Robert",
      genderDivision: "open",
      shareToFeed: null,
      heightIn: "70",
      weightLbs: "185",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.shareToFeed).toBe(false);
    }
  });

  it("accepts blank measurement fields", () => {
    const result = fitnessProfileSchema.safeParse({
      displayName: "Robert",
      genderDivision: "male",
      heightIn: "",
      weightLbs: "",
    });

    expect(result.success).toBe(true);
  });

  it("rejects display names that are too short", () => {
    const result = fitnessProfileSchema.safeParse({
      displayName: "R",
      genderDivision: "open",
    });

    expect(result.success).toBe(false);
  });
});
