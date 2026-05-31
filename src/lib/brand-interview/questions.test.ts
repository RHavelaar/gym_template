import { describe, expect, it } from "vitest";
import { INTERVIEW_QUESTIONS, INTERVIEW_STEP_COUNT, isInterviewStepOptional } from "@/lib/brand-interview/questions";

describe("interview questions", () => {
  it("has expected step count", () => {
    expect(INTERVIEW_STEP_COUNT).toBe(INTERVIEW_QUESTIONS.length);
    expect(INTERVIEW_STEP_COUNT).toBeGreaterThanOrEqual(7);
  });

  it("marks optional steps", () => {
    const extras = INTERVIEW_QUESTIONS.find((q) => q.id === "extras");
    expect(isInterviewStepOptional(extras!)).toBe(true);
    const name = INTERVIEW_QUESTIONS.find((q) => q.id === "gymName");
    expect(isInterviewStepOptional(name!)).toBe(false);
  });

  it("prefills gym name from draft", () => {
    const gymName = INTERVIEW_QUESTIONS.find((q) => q.id === "gymName");
    expect(gymName?.prefillFrom).toBe("name");
  });
});
