import { describe, expect, it, vi, afterEach } from "vitest";
import { GENERATION_STATUS_STEPS } from "@/components/admin/settings/generated-copy-loading-state";

describe("GENERATION_STATUS_STEPS", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("includes at least four progressive status messages", () => {
    expect(GENERATION_STATUS_STEPS.length).toBeGreaterThanOrEqual(4);
    expect(GENERATION_STATUS_STEPS[0]).toMatch(/reading/i);
    expect(GENERATION_STATUS_STEPS.at(-1)).toMatch(/almost done/i);
  });
});
