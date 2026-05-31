import { describe, expect, it } from "vitest";
import { computeGoalProgress } from "@/lib/progress";

describe("computeGoalProgress", () => {
  it("tracks weight loss toward a lower goal", () => {
    const result = computeGoalProgress(200, 190, 180);
    expect(result.direction).toBe("decrease");
    expect(result.percent).toBe(50);
    expect(result.remaining).toBe(10);
  });

  it("tracks muscle gain toward a higher goal", () => {
    const result = computeGoalProgress(16, 17, 18);
    expect(result.direction).toBe("increase");
    expect(result.percent).toBe(50);
    expect(result.remaining).toBe(1);
  });

  it("caps at 100% when goal is reached", () => {
    const result = computeGoalProgress(200, 175, 180);
    expect(result.percent).toBe(100);
  });
});
