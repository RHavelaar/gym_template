"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GymConfig, GalleryCarouselSettings, HeroSectionProps, HomepageSection } from "@/config/types";
import { updateHeroSectionAction, updateMediaAction } from "@/app/actions/content";
import {
  GalleryImageList,
  galleryItemsFromConfig,
  type GalleryItem,
} from "@/components/admin/settings/gallery-image-list";
import { GalleryDisplaySettings } from "@/components/admin/settings/gallery-carousel-settings-form";
import { GallerySectionPreview } from "@/components/admin/settings/gallery-section-preview";
import { HeroOverlaySettingsForm } from "@/components/admin/settings/hero-overlay-settings-form";
import { HeroSectionPreview } from "@/components/admin/settings/hero-section-preview";
import { HeroTextButtonsModal } from "@/components/admin/settings/hero-text-buttons-modal";
import {
  GALLERY_PREVIEW_HINT_DURATION_MS,
  isGalleryPreviewHintSuppressed,
  isGalleryPreviewOnScreen,
  isMobileLayout,
  MobileGalleryPreviewHint,
} from "@/components/admin/settings/mobile-gallery-preview-hint";
import { SettingsEditorShell, type SettingsEditorSection } from "@/components/admin/settings/settings-editor-shell";
import { mergeCarouselSettings } from "@/lib/gallery-media";
import { formatHeroFieldErrors, mergeHeroProps, validateHeroProps } from "@/lib/hero-settings";
import { buildMediaSettingsPayload } from "@/lib/media-settings";
import { Card } from "@/components/ui/card";
import { SettingSectionTitle } from "@/components/ui/info-hint";

type MediaSettingsFormProps = {
  initialConfig: GymConfig;
  previewSections: HomepageSection[];
};

type PersistOverride = {
  hero?: string;
  galleryItems?: GalleryItem[];
  carousel?: GalleryCarouselSettings;
};

const mapSaveError = (error: unknown): string => {
  if (error instanceof Error) {
    if (error.message === "Owner access required") {
      return "Owner access required.";
    }
    return error.message;
  }
  return "Could not save. Try again.";
};

const countFieldErrors = (fieldErrors: Record<string, string>) => Object.keys(fieldErrors).length;

export const MediaSettingsForm = ({ initialConfig, previewSections }: MediaSettingsFormProps) => {
  const gallerySection = previewSections.find((s) => s.type === "gallery");
  const heroSection = previewSections.find((s) => s.type === "hero");
  const initialCarousel = mergeCarouselSettings(
    gallerySection?.type === "gallery" ? gallerySection.props.carousel : undefined,
  );
  const initialHeroProps = mergeHeroProps(
    heroSection?.type === "hero" ? heroSection.props : undefined,
    initialConfig.tagline,
  );

  const [draft, setDraft] = useState(initialConfig);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(() =>
    galleryItemsFromConfig(initialConfig.images.gallery),
  );
  const [carousel, setCarousel] = useState<GalleryCarouselSettings>(initialCarousel);
  const [heroDraft, setHeroDraft] = useState<HeroSectionProps>(initialHeroProps);
  const [heroFieldErrors, setHeroFieldErrors] = useState<Record<string, string>>({});
  const [heroTextModalOpen, setHeroTextModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showGalleryPreviewHint, setShowGalleryPreviewHint] = useState(false);

  const stateRef = useRef({ draft, galleryItems, carousel, heroDraft });

  useEffect(() => {
    stateRef.current = { draft, galleryItems, carousel, heroDraft };
  }, [draft, galleryItems, carousel, heroDraft]);

  const saveQueueRef = useRef(0);
  const heroSaveQueueRef = useRef(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heroDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedMessageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewHintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (heroDebounceTimerRef.current) clearTimeout(heroDebounceTimerRef.current);
      if (savedMessageTimerRef.current) clearTimeout(savedMessageTimerRef.current);
      if (previewHintTimerRef.current) clearTimeout(previewHintTimerRef.current);
    },
    [],
  );

  const previewHeroSection: HomepageSection | undefined = heroSection
    ? ({
        ...heroSection,
        props: heroDraft,
      } as HomepageSection)
    : undefined;

  const previewGallerySection: HomepageSection | undefined = gallerySection
    ? ({
        ...gallerySection,
        props: {
          ...(gallerySection.props as { title: string }),
          carousel,
        },
      } as HomepageSection)
    : undefined;

  const setStatusMessage = useCallback((next: string) => {
    setMessage(next);
    if (savedMessageTimerRef.current) clearTimeout(savedMessageTimerRef.current);
    if (next === "Saved.") {
      savedMessageTimerRef.current = setTimeout(() => {
        setMessage((current) => (current === "Saved." ? "" : current));
      }, 2500);
    }
  }, []);

  const triggerGalleryPreviewHint = useCallback(() => {
    if (!gallerySection) return;
    if (!isMobileLayout()) return;
    if (isGalleryPreviewOnScreen()) return;
    if (isGalleryPreviewHintSuppressed()) return;

    setShowGalleryPreviewHint(true);
    if (previewHintTimerRef.current) clearTimeout(previewHintTimerRef.current);
    previewHintTimerRef.current = setTimeout(() => {
      setShowGalleryPreviewHint(false);
    }, GALLERY_PREVIEW_HINT_DURATION_MS);
  }, [gallerySection]);

  const persistMedia = useCallback(
    async (override: PersistOverride = {}, options?: { debounceMs?: number }) => {
      const runSave = async () => {
        const current = stateRef.current;
        const hero = (override.hero ?? current.draft.images.hero).trim();
        if (!hero) return;

        const payload = buildMediaSettingsPayload({
          hero,
          galleryItems: override.galleryItems ?? current.galleryItems,
          carousel: override.carousel ?? current.carousel,
        });

        const requestId = ++saveQueueRef.current;
        setSaving(true);

        try {
          const result = await updateMediaAction(payload);
          if (requestId !== saveQueueRef.current) return;

          if (result.ok) {
            setStatusMessage("Saved.");
            return;
          }

          setStatusMessage(result.message);
        } catch (error) {
          if (requestId !== saveQueueRef.current) return;
          setStatusMessage(mapSaveError(error));
        } finally {
          if (requestId === saveQueueRef.current) {
            setSaving(false);
          }
        }
      };

      if (options?.debounceMs) {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => void runSave(), options.debounceMs);
        return;
      }

      await runSave();
    },
    [setStatusMessage],
  );

  const persistHero = useCallback(
    async (nextHero: HeroSectionProps, options?: { debounceMs?: number }) => {
      const validation = validateHeroProps(nextHero);
      if (!validation.success) {
        const fieldErrors = formatHeroFieldErrors(validation.error);
        setHeroFieldErrors(fieldErrors);
        const count = countFieldErrors(fieldErrors);
        setStatusMessage(
          count > 0
            ? `Fix the highlighted fields before saving. ${count} field${count === 1 ? "" : "s"} need attention.`
            : "Fix the highlighted fields before saving.",
        );
        return;
      }

      const runSave = async () => {
        const requestId = ++heroSaveQueueRef.current;
        setSaving(true);

        try {
          const result = await updateHeroSectionAction(nextHero);
          if (requestId !== heroSaveQueueRef.current) return;

          if (result.ok) {
            setHeroFieldErrors({});
            setStatusMessage("Saved.");
            return;
          }

          if (result.fieldErrors) {
            setHeroFieldErrors(result.fieldErrors);
            const count = countFieldErrors(result.fieldErrors);
            setStatusMessage(
              count > 0 ? `${result.message} ${count} field${count === 1 ? "" : "s"} need attention.` : result.message,
            );
            return;
          }

          setStatusMessage(result.message);
        } catch (error) {
          if (requestId !== heroSaveQueueRef.current) return;
          setStatusMessage(mapSaveError(error));
        } finally {
          if (requestId === heroSaveQueueRef.current) {
            setSaving(false);
          }
        }
      };

      if (options?.debounceMs) {
        if (heroDebounceTimerRef.current) clearTimeout(heroDebounceTimerRef.current);
        heroDebounceTimerRef.current = setTimeout(() => void runSave(), options.debounceMs);
        return;
      }

      await runSave();
    },
    [setStatusMessage],
  );

  const handleHeroChange = (next: HeroSectionProps) => {
    setHeroDraft(next);

    const validation = validateHeroProps(next);
    if (!validation.success) {
      const fieldErrors = formatHeroFieldErrors(validation.error);
      setHeroFieldErrors(fieldErrors);
      const count = countFieldErrors(fieldErrors);
      setStatusMessage(
        count > 0
          ? `Fix the highlighted fields before saving. ${count} field${count === 1 ? "" : "s"} need attention.`
          : "Fix the highlighted fields before saving.",
      );
      return;
    }

    setHeroFieldErrors({});
    void persistHero(next, { debounceMs: 500 });
  };

  const applyGalleryItems = (items: GalleryItem[]) => {
    setGalleryItems(items);
    setDraft((prev) => ({
      ...prev,
      images: {
        ...prev.images,
        gallery: items.filter((item) => item.url.trim()),
      },
    }));
    void persistMedia({ galleryItems: items });
  };

  const handleCarouselChange = (settings: GalleryCarouselSettings) => {
    setCarousel(settings);
    void persistMedia({ carousel: settings }, { debounceMs: 500 });
    triggerGalleryPreviewHint();
  };

  const handleHeroUploaded = (url: string) => {
    setDraft((prev) => ({ ...prev, images: { ...prev.images, hero: url } }));
    void persistMedia({ hero: url });
  };

  const heroFieldErrorCount = countFieldErrors(heroFieldErrors);
  const statusMessage =
    message ||
    (saving ? "Saving…" : "") ||
    (heroFieldErrorCount > 0 && !message
      ? `${heroFieldErrorCount} field${heroFieldErrorCount === 1 ? "" : "s"} need attention.`
      : "");

  const isSuccessStatus = statusMessage.includes("Saved") || statusMessage === "Saving…";

  const editorSections: SettingsEditorSection[] = [
    ...(previewHeroSection
      ? [
          {
            id: "hero",
            editorLabel: "Hero settings",
            previewLabel: "Hero preview",
            editorAlign: "start" as const,
            previewSticky: false,
            previewMatchEditor: false,
            editor: (
              <Card id="edit-hero" className="scroll-mt-24 p-4 transition-shadow sm:p-5 lg:w-full">
                <HeroOverlaySettingsForm
                  value={heroDraft}
                  onChange={handleHeroChange}
                  heroImageUrl={draft.images.hero}
                  onHeroImageUploaded={handleHeroUploaded}
                  onEditTextButtons={() => setHeroTextModalOpen(true)}
                />
              </Card>
            ),
            preview: <HeroSectionPreview config={draft} section={previewHeroSection} />,
          },
        ]
      : []),
    ...(previewGallerySection
      ? [
          {
            id: "gallery",
            editorLabel: "Gallery settings",
            previewLabel: "Gallery preview",
            editorAlign: "start" as const,
            previewSticky: false,
            previewMatchEditor: false,
            editor: (
              <Card id="edit-gallery" className="scroll-mt-24 space-y-5 p-4 transition-shadow sm:p-5 lg:w-full">
                <SettingSectionTitle
                  title="Homepage gallery"
                  size="lg"
                  hint="Photos in the “On the Floor” section of your homepage. Order matters — drag thumbnails or use Arrange & edit. Aim for 6–12 strong shots mixing equipment, classes, and community."
                  description={
                    <>
                      Add photos one at a time or upload several together. Drag to reorder, tap
                      <span className="text-white"> × </span>
                      to remove, or use Arrange &amp; edit for arrow-key reordering.
                    </>
                  }
                />

                <GalleryImageList items={galleryItems} gymSlug={draft.slug} onChange={applyGalleryItems} />

                <GalleryDisplaySettings settings={carousel} onChange={handleCarouselChange} />
              </Card>
            ),
            preview: <GallerySectionPreview config={draft} section={previewGallerySection} />,
          },
        ]
      : []),
  ];

  return (
    <>
      <SettingsEditorShell
        title="Images & media"
        description="Manage your homepage hero and gallery — layout, copy, photos, and slideshow in one place. Changes save automatically."
        sections={editorSections}
        footer={
          statusMessage ? (
            <p className={isSuccessStatus ? "text-green-400" : "text-red-400"} aria-live="polite">
              {statusMessage}
            </p>
          ) : null
        }
      />

      <HeroTextButtonsModal
        open={heroTextModalOpen}
        config={draft}
        value={heroDraft}
        fieldErrors={heroFieldErrors}
        onChange={handleHeroChange}
        onClose={() => setHeroTextModalOpen(false)}
      />

      <MobileGalleryPreviewHint visible={showGalleryPreviewHint} onDismiss={() => setShowGalleryPreviewHint(false)} />
    </>
  );
};
