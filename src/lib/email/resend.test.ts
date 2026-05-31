import { afterEach, describe, expect, it, vi } from "vitest";

describe("hasResend", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("is false when RESEND_API_KEY is unset", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const { hasResend } = await import("@/lib/email/resend");
    expect(hasResend).toBe(false);
  });

  it("is true when RESEND_API_KEY is set", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    const { hasResend } = await import("@/lib/email/resend");
    expect(hasResend).toBe(true);
  });
});
