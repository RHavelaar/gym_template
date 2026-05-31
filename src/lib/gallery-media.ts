import type { GalleryCarouselSettings, GalleryMediaItem, GalleryMediaType, GallerySectionProps } from "@/config/types";
import { DEFAULT_GALLERY_CAROUSEL } from "@/config/types";
import { sanitizeAssetFileName } from "@/lib/validation/content";

export const inferGalleryMediaType = (url: string): GalleryMediaType => {
  const lower = url.toLowerCase().split("?")[0] ?? url;
  if (lower.endsWith(".gif")) return "gif";
  if (/\.(mp4|webm|mov|m4v)$/.test(lower)) return "video";
  return "image";
};

export const fileExtensionFromGalleryUrl = (url: string): string => {
  const clean = url.split("?")[0]?.split("#")[0] ?? url;
  const ext = clean.split(".").pop()?.toLowerCase();
  return ext && ext.length <= 5 ? ext : "jpg";
};

export const fileNameFromGalleryUrl = (url: string): string => {
  if (!url.trim()) return "";
  try {
    const pathname = url.startsWith("http") ? new URL(url).pathname : url;
    const segment = decodeURIComponent(pathname.split("/").pop() ?? "");
    const base = segment.replace(/\.[^.]+$/, "");
    return sanitizeAssetFileName(base);
  } catch {
    return sanitizeAssetFileName(url);
  }
};

export const resolveGalleryFileName = (item: Pick<GalleryMediaItem, "url" | "fileName">) =>
  item.fileName?.trim() || fileNameFromGalleryUrl(item.url);

export const isRenamableGalleryAssetUrl = (url: string, gymSlug: string): boolean => {
  if (!url.trim()) return true;
  if (url.startsWith("data:")) return true;
  return url.includes(`/gym-assets/${gymSlug}/library/`);
};

export const parseGymAssetStoragePath = (url: string): string | null => {
  if (url.startsWith("data:")) return null;
  try {
    const pathname = new URL(url).pathname;
    const marker = "/storage/v1/object/public/gym-assets/";
    const idx = pathname.indexOf(marker);
    if (idx < 0) return null;
    return decodeURIComponent(pathname.slice(idx + marker.length));
  } catch {
    return null;
  }
};

export const normalizeGalleryItem = (item: string | GalleryMediaItem, index = 0): GalleryMediaItem => {
  if (typeof item === "string") {
    return {
      id: `gallery-${index}`,
      url: item,
      mediaType: inferGalleryMediaType(item),
      fileName: fileNameFromGalleryUrl(item) || undefined,
    };
  }
  return {
    id: item.id || `gallery-${index}`,
    url: item.url,
    mediaType: item.mediaType ?? inferGalleryMediaType(item.url),
    fileName: item.fileName ?? (fileNameFromGalleryUrl(item.url) || undefined),
  };
};

export const normalizeGalleryItems = (items: unknown): GalleryMediaItem[] => {
  if (!Array.isArray(items)) return [];
  return items.map((item, index) => normalizeGalleryItem(item as string | GalleryMediaItem, index));
};

export const mergeBrandingImages = (
  base: { hero: string; gallery: GalleryMediaItem[] },
  stored?: Partial<{ hero?: string; gallery?: unknown }>,
): { hero: string; gallery: GalleryMediaItem[] } | undefined => {
  if (!stored) return undefined;

  const hasHero = typeof stored.hero === "string" && stored.hero.length > 0;
  const hasGallery = stored.gallery !== undefined;

  if (!hasHero && !hasGallery) return undefined;

  return {
    hero: hasHero ? stored.hero! : base.hero,
    gallery: hasGallery ? normalizeGalleryItems(stored.gallery) : base.gallery,
  };
};

export const galleryItemsToUrls = (items: GalleryMediaItem[]): string[] => items.map((item) => item.url);

export const mergeCarouselSettings = (settings?: Partial<GalleryCarouselSettings>): GalleryCarouselSettings => ({
  ...DEFAULT_GALLERY_CAROUSEL,
  ...settings,
  slidesVisible: settings?.slidesVisible ?? DEFAULT_GALLERY_CAROUSEL.slidesVisible,
});

export const mergeGallerySectionProps = (props?: Partial<GallerySectionProps>): GallerySectionProps => ({
  title: props?.title ?? "Gallery",
  carousel: mergeCarouselSettings(props?.carousel),
});
