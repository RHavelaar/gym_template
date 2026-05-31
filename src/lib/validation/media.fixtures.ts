import { DEFAULT_GALLERY_CAROUSEL, DEFAULT_HERO_PROPS } from "@/config/types";

export const validHeroProps = {
  ...DEFAULT_HERO_PROPS,
  tagline: "Hardcore training. Real community.",
  headline: "Train Like You Mean It",
  subheadline: "PR boards, competitions, and community.",
};

export const validMediaPayload = {
  hero: "https://images.example.com/hero.jpg",
  gallery: [
    {
      id: "gallery-1",
      url: "https://images.example.com/floor-1.jpg",
      mediaType: "image" as const,
    },
    {
      id: "gallery-2",
      url: "https://images.example.com/floor-2.jpg",
      mediaType: "image" as const,
      fileName: "squat-racks",
    },
  ],
  carousel: DEFAULT_GALLERY_CAROUSEL,
};
