import { describe, expect, it } from "vitest";
import { contactInquirySchema } from "@/lib/validation/contact";

describe("contactInquirySchema", () => {
  const valid = {
    name: "Alex Rivera",
    email: "alex@example.com",
    phone: "(555) 555-0100",
    topic: "membership" as const,
    message: "I would like to learn about monthly membership options.",
    company: "",
  };

  it("accepts valid contact payload", () => {
    expect(contactInquirySchema.safeParse(valid).success).toBe(true);
  });

  it("rejects short messages", () => {
    const result = contactInquirySchema.safeParse({ ...valid, message: "Hi" });
    expect(result.success).toBe(false);
  });

  it("rejects honeypot submissions", () => {
    const result = contactInquirySchema.safeParse({ ...valid, company: "spam corp" });
    expect(result.success).toBe(false);
  });
});
