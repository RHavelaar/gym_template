import { describe, expect, it } from "vitest";
import { mergeContactPageSettings, normalizeContactPageSettings } from "@/lib/contact-page";
import { DEFAULT_CONTACT_PAGE_SETTINGS } from "@/config/types";

describe("contact-page", () => {
  it("merges overlay onto defaults", () => {
    const result = mergeContactPageSettings(DEFAULT_CONTACT_PAGE_SETTINGS, {
      headline: "Say hello",
      faqItems: [{ question: "Hours?", answer: "Mon–Fri 5am–10pm" }],
    });
    expect(result.headline).toBe("Say hello");
    expect(result.faqItems).toHaveLength(1);
    expect(result.showForm).toBe(true);
  });

  it("filters invalid FAQ rows", () => {
    const result = normalizeContactPageSettings({
      faqItems: [
        { question: "", answer: "x" },
        { question: "Q", answer: "A" },
      ],
    });
    expect(result.faqItems).toEqual([{ question: "Q", answer: "A" }]);
  });
});
