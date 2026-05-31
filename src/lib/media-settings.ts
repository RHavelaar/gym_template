import type { GalleryCarouselSettings, GalleryMediaItem } from "@/config/types";

export type MediaSettingsPayload = {
  hero: string;
  gallery: GalleryMediaItem[];
  carousel: GalleryCarouselSettings;
};

export const buildMediaSettingsPayload = (input: {
  hero: string;
  galleryItems: GalleryMediaItem[];
  carousel: GalleryCarouselSettings;
}): MediaSettingsPayload => ({
  hero: input.hero.trim(),
  gallery: input.galleryItems
    .map((item) => ({
      id: item.id,
      url: item.url.trim(),
      mediaType: item.mediaType,
      ...(item.fileName?.trim() ? { fileName: item.fileName.trim() } : {}),
    }))
    .filter((item) => item.url),
  carousel: input.carousel,
});
