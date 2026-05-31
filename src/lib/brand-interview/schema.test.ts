import { describe, expect, it } from "vitest";
import { brandGeneratedCopySchema, interviewAnswersSchema } from "@/lib/brand-interview/schema";

describe("brand-interview schema", () => {
  it("accepts generated copy with reasons", () => {
    const result = brandGeneratedCopySchema.safeParse({
      summary: "Here is your copy.",
      fields: [{ fieldKey: "tagline", value: "Lift heavy", reason: "Matches hardcore vibe." }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing field reason", () => {
    const result = brandGeneratedCopySchema.safeParse({
      summary: "Ok",
      fields: [{ fieldKey: "tagline", value: "Hi", reason: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts interview answers without image fields", () => {
    const result = interviewAnswersSchema.safeParse({
      gymName: "Iron Asylum",
      city: "Longview",
      differentiator: "Hardcore gym",
      idealMember: "strength",
      vibe: ["hardcore"],
      offerings: ["open-gym"],
    });
    expect(result.success).toBe(true);
  });
});
