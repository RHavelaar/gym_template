import { describe, expect, it } from "vitest";
import { hasResend } from "@/lib/email/resend";

describe("hasResend", () => {
  it("is false when RESEND_API_KEY is unset in test env", () => {
    expect(hasResend).toBe(false);
  });
});
