import { describe, expect, it } from "vitest";
import { BRAND_PREVIEW_READY, BRAND_PREVIEW_UPDATE, isBrandPreviewUpdateMessage } from "@/lib/brand-preview-message";

describe("isBrandPreviewUpdateMessage", () => {
  it("accepts valid preview update messages", () => {
    expect(
      isBrandPreviewUpdateMessage({
        type: BRAND_PREVIEW_UPDATE,
        payload: {
          baseSlug: "iron-asylum",
          draft: { name: "Test Gym" },
          sections: [],
          viewport: "desktop",
        },
      }),
    ).toBe(true);
  });

  it("rejects unrelated messages", () => {
    expect(isBrandPreviewUpdateMessage({ type: BRAND_PREVIEW_READY })).toBe(false);
    expect(isBrandPreviewUpdateMessage(null)).toBe(false);
    expect(isBrandPreviewUpdateMessage({ type: BRAND_PREVIEW_UPDATE })).toBe(false);
  });
});
