import { describe, expect, it } from "vitest";
import { DEFAULT_GALLERY_CAROUSEL } from "@/config/types";
import { buildMediaSettingsPayload } from "@/lib/media-settings";

describe("buildMediaSettingsPayload", () => {
  it("trims hero URL and gallery item URLs", () => {
    const payload = buildMediaSettingsPayload({
      hero: "  https://example.com/hero.jpg  ",
      galleryItems: [
        {
          id: "a",
          url: " https://example.com/a.jpg ",
          mediaType: "image",
        },
      ],
      carousel: DEFAULT_GALLERY_CAROUSEL,
    });

    expect(payload.hero).toBe("https://example.com/hero.jpg");
    expect(payload.gallery[0]?.url).toBe("https://example.com/a.jpg");
  });

  it("drops gallery items with blank URLs", () => {
    const payload = buildMediaSettingsPayload({
      hero: "https://example.com/hero.jpg",
      galleryItems: [
        { id: "keep", url: "https://example.com/keep.jpg", mediaType: "image" },
        { id: "drop", url: "   ", mediaType: "image" },
      ],
      carousel: DEFAULT_GALLERY_CAROUSEL,
    });

    expect(payload.gallery).toHaveLength(1);
    expect(payload.gallery[0]?.id).toBe("keep");
  });

  it("preserves optional gallery file names when present", () => {
    const payload = buildMediaSettingsPayload({
      hero: "https://example.com/hero.jpg",
      galleryItems: [
        {
          id: "named",
          url: "https://example.com/named.jpg",
          mediaType: "gif",
          fileName: "  rack-room  ",
        },
      ],
      carousel: DEFAULT_GALLERY_CAROUSEL,
    });

    expect(payload.gallery[0]).toMatchObject({
      fileName: "rack-room",
      mediaType: "gif",
    });
  });

  it("passes carousel settings through unchanged", () => {
    const carousel = { ...DEFAULT_GALLERY_CAROUSEL, slidesVisible: 3 as const };
    const payload = buildMediaSettingsPayload({
      hero: "https://example.com/hero.jpg",
      galleryItems: [],
      carousel,
    });

    expect(payload.carousel).toEqual(carousel);
  });
});
