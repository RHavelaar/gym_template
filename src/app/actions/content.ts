"use server";

import { revalidatePath } from "next/cache";
import { getGymConfig } from "@/config";
import { DEFAULT_SECTION_PROPS, type GymConfig, type HomepageSection } from "@/config/types";
import { getHomePageId, loadCmsEditorData } from "@/lib/gym-config-resolver";
import { addDemoAsset, listDemoAssets, renameDemoAssetByUrl, type GymAsset } from "@/lib/demo-media-store";
import { getDemoContentOverride, updateDemoConfig, updateDemoSections } from "@/lib/demo-content-store";
import { hasSupabase } from "@/lib/env";
import { fileExtensionFromGalleryUrl, parseGymAssetStoragePath } from "@/lib/gallery-media";
import { buildChangeSet, logAdminAuditEvent } from "@/lib/audit";
import { resolveAuditActor } from "@/lib/audit/resolve-actor";
import { getGymIdBySlug } from "@/lib/profiles";
import { requireOwner } from "@/lib/rbac";
import { ADMIN_AUDIT_ACTIONS } from "@/types/database";
import { createClerkSupabaseClient } from "@/lib/supabase/clerk-server";
import { createServiceClient } from "@/lib/supabase/server";
import { buildFeaturesFromSiteMenu, buildNavFromSiteMenu } from "@/lib/nav-catalog";
import { formatHeroFieldErrors } from "@/lib/hero-settings";
import { ERROR_CODES } from "@/lib/errors/codes";
import { throwAppError, wrapAction, type ActionResult } from "@/lib/errors/action-result";
import type { ErrorCode } from "@/lib/errors/codes";
import type { SaveActionResult } from "@/lib/validation/action-result";
import {
  ALLOWED_FONT_TYPES,
  ALLOWED_GALLERY_TYPES,
  ALLOWED_IMAGE_TYPES,
  assetTypeSchema,
  brandSchema,
  businessSchema,
  featuresSchema,
  getAssetTooLargeError,
  homepageSectionsSchema,
  heroPropsSchema,
  mediaSchema,
  normalizeAssetFileName,
  resolveUniqueAssetBaseName,
  siteMenuSchema,
} from "@/lib/validation/content";
import type { GalleryCarouselSettings } from "@/config/types";

const REVALIDATE_PATHS = [
  "/",
  "/admin/settings",
  "/admin/settings/brand",
  "/admin/settings/business",
  "/admin/settings/media",
  "/admin/settings/homepage",
  "/admin/settings/navigation",
  "/admin/settings/features",
  "/admin/settings/audit",
];

const revalidateCms = () => {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path);
  }
};

const getOwnerGymContext = async () => {
  const auth = await requireOwner();
  const config = getGymConfig();
  const gymId = auth.gymId ?? (await getGymIdBySlug(config.slug));
  if (!gymId) throwAppError(ERROR_CODES.CMS_NOT_FOUND, "Gym not found");
  const actor = await resolveAuditActor(auth);
  return { auth, config, gymId: gymId as string, actor };
};

const cmsCapture = (route: string) => ({
  source: "server_action" as const,
  route,
});

const requireUploadFile = (entry: FormDataEntryValue | null): File => {
  if (entry instanceof File) return entry;
  throwAppError(ERROR_CODES.MEDIA_UPLOAD_FAILED, "Invalid upload");
  throw new Error("Invalid upload");
};

const operationalFail = (code: typeof ERROR_CODES.CMS_SAVE_FAILED, message: string): SaveActionResult => ({
  ok: false,
  message,
  error: { code, message },
});

const requireParsed = <T>(
  parsed: { success: true; data: T } | { success: false },
  code: ErrorCode,
  message: string,
): T => {
  if (!parsed.success) {
    throwAppError(code, message);
  }
  return (parsed as { success: true; data: T }).data;
};

export const updateBrandAction = async (input: unknown): Promise<ActionResult> =>
  wrapAction(
    async () => {
      const { gymId, actor } = await getOwnerGymContext();
      const parsed = brandSchema.safeParse(input);
      const data = requireParsed(parsed, ERROR_CODES.CMS_VALIDATION, "Invalid brand data");

      if (!hasSupabase) {
        updateDemoConfig({
          name: data.name,
          tagline: data.tagline,
          description: data.description,
          logoUrl: data.logoUrl,
          theme: data.theme,
          typography: data.typography,
          seo: data.seo,
        });
        revalidateCms();
        await logAdminAuditEvent({
          gymId,
          actor,
          action: ADMIN_AUDIT_ACTIONS.CMS_BRAND_UPDATE,
          resourceType: "gym_branding",
          resourceId: gymId,
          summary: `Updated brand: ${data.name}`,
          metadata: { changes: buildChangeSet({}, data as Record<string, unknown>) },
        });
        return;
      }

      const supabase = await createClerkSupabaseClient();
      const { error: gymError } = await supabase
        .from("gyms")
        .update({
          name: data.name,
          tagline: data.tagline,
          description: data.description,
        })
        .eq("id", gymId);

      if (gymError) throwAppError(ERROR_CODES.CMS_SAVE_FAILED, gymError.message);

      const { error: brandingError } = await supabase.from("gym_branding").upsert(
        {
          gym_id: gymId,
          logo_url: data.logoUrl,
          theme: data.theme,
          typography: data.typography,
          seo: data.seo,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "gym_id" },
      );

      if (brandingError) throwAppError(ERROR_CODES.CMS_SAVE_FAILED, brandingError.message);
      revalidateCms();
      await logAdminAuditEvent({
        gymId,
        actor,
        action: ADMIN_AUDIT_ACTIONS.CMS_BRAND_UPDATE,
        resourceType: "gym_branding",
        resourceId: gymId,
        summary: `Updated brand: ${data.name}`,
        metadata: { changes: buildChangeSet({}, data as Record<string, unknown>) },
      });
    },
    {
      fallbackCode: ERROR_CODES.CMS_SAVE_FAILED,
      capture: cmsCapture("/admin/settings/brand"),
    },
  );

export const refreshBrandPreviewSectionsAction = async (): Promise<ActionResult<{ sections: HomepageSection[] }>> =>
  wrapAction(
    async () => {
      await getOwnerGymContext();
      const { sections } = await loadCmsEditorData();
      return { sections };
    },
    {
      fallbackCode: ERROR_CODES.CMS_SAVE_FAILED,
      capture: cmsCapture("/admin/settings/brand"),
    },
  );

export const updateBusinessAction = async (input: unknown): Promise<ActionResult> =>
  wrapAction(
    async () => {
      const { gymId, actor } = await getOwnerGymContext();
      const parsed = businessSchema.safeParse(input);
      const data = requireParsed(parsed, ERROR_CODES.CMS_VALIDATION, "Invalid business data");

      if (!hasSupabase) {
        updateDemoConfig({ business: data });
        revalidateCms();
        await logAdminAuditEvent({
          gymId,
          actor,
          action: ADMIN_AUDIT_ACTIONS.CMS_BUSINESS_UPDATE,
          resourceType: "gym_branding",
          resourceId: gymId,
          summary: "Updated business info and contact details",
          metadata: { generalEmail: data.generalEmail, helpEmail: data.helpEmail },
        });
        return;
      }

      const supabase = await createClerkSupabaseClient();
      const { error: gymError } = await supabase
        .from("gyms")
        .update({
          phone: data.contactPhone,
          email: data.generalEmail || data.helpEmail,
          address_line1: data.address.line1,
          city: data.address.city,
          state: data.address.state,
          zip: data.address.zip,
        })
        .eq("id", gymId);

      if (gymError) throwAppError(ERROR_CODES.CMS_SAVE_FAILED, gymError.message);

      const { error: brandingError } = await supabase.from("gym_branding").upsert(
        {
          gym_id: gymId,
          business: data,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "gym_id" },
      );

      if (brandingError) throwAppError(ERROR_CODES.CMS_SAVE_FAILED, brandingError.message);
      revalidateCms();
      await logAdminAuditEvent({
        gymId,
        actor,
        action: ADMIN_AUDIT_ACTIONS.CMS_BUSINESS_UPDATE,
        resourceType: "gym_branding",
        resourceId: gymId,
        summary: "Updated business info and contact details",
        metadata: { generalEmail: data.generalEmail, helpEmail: data.helpEmail },
      });
    },
    {
      fallbackCode: ERROR_CODES.CMS_SAVE_FAILED,
      capture: cmsCapture("/admin/settings/business"),
    },
  );

export const updateMediaAction = async (input: unknown): Promise<SaveActionResult> => {
  const { gymId, config, actor } = await getOwnerGymContext();
  const parsed = mediaSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Invalid media data. Check your gallery and hero image." };
  }
  const mediaData = parsed.data;

  const syncGalleryCarousel = async (carousel: GalleryCarouselSettings): Promise<SaveActionResult> => {
    if (!hasSupabase) {
      const baseSections = getDemoContentOverride()?.sections ?? config.homepageSections;
      updateDemoSections(
        baseSections.map((section) =>
          section.type === "gallery"
            ? {
                ...section,
                props: {
                  ...(section.props as { title: string }),
                  carousel,
                },
              }
            : section,
        ) as HomepageSection[],
      );
      return { ok: true };
    }

    const pageId = await getHomePageId(config.slug);
    if (!pageId) return { ok: true };

    const supabase = await createClerkSupabaseClient();
    const { data: row } = await supabase
      .from("gym_page_sections")
      .select("sort_order, enabled, props")
      .eq("page_id", pageId)
      .eq("section_key", "gallery")
      .maybeSingle();

    const existingProps = (row?.props ?? DEFAULT_SECTION_PROPS.gallery) as {
      title: string;
      carousel?: GalleryCarouselSettings;
    };

    const { error: sectionError } = await supabase.from("gym_page_sections").upsert(
      {
        page_id: pageId,
        section_key: "gallery",
        section_type: "gallery",
        sort_order: row?.sort_order ?? 6,
        enabled: row?.enabled ?? true,
        props: {
          title: existingProps.title,
          carousel,
        },
      },
      { onConflict: "page_id,section_key" },
    );

    if (sectionError) {
      return operationalFail(ERROR_CODES.CMS_SAVE_FAILED, "Could not save gallery display settings.");
    }
    return { ok: true };
  };

  if (!hasSupabase) {
    updateDemoConfig({
      images: {
        hero: mediaData.hero,
        gallery: mediaData.gallery,
      },
    });
    await syncGalleryCarousel(mediaData.carousel);
    revalidateCms();
    await logAdminAuditEvent({
      gymId,
      actor,
      action: ADMIN_AUDIT_ACTIONS.CMS_MEDIA_UPDATE,
      resourceType: "gym_branding",
      resourceId: gymId,
      summary: `Updated site media (${mediaData.gallery.length} gallery items)`,
      metadata: { galleryCount: mediaData.gallery.length },
    });
    return { ok: true };
  }

  const supabase = await createClerkSupabaseClient();
  const { error } = await supabase.from("gym_branding").upsert(
    {
      gym_id: gymId,
      images: {
        hero: mediaData.hero,
        gallery: mediaData.gallery,
      },
      updated_at: new Date().toISOString(),
    },
    { onConflict: "gym_id" },
  );

  if (error) {
    return operationalFail(ERROR_CODES.CMS_SAVE_FAILED, "Could not save media settings.");
  }

  const carouselResult = await syncGalleryCarousel(mediaData.carousel);
  if (!carouselResult.ok) return carouselResult;

  revalidateCms();
  await logAdminAuditEvent({
    gymId,
    actor,
    action: ADMIN_AUDIT_ACTIONS.CMS_MEDIA_UPDATE,
    resourceType: "gym_branding",
    resourceId: gymId,
    summary: `Updated site media (${mediaData.gallery.length} gallery items)`,
    metadata: { galleryCount: mediaData.gallery.length },
  });
  return { ok: true };
};

export const updateFeaturesAction = async (input: unknown): Promise<ActionResult> =>
  wrapAction(
    async () => {
      const { gymId } = await getOwnerGymContext();
      const parsed = featuresSchema.safeParse(input);
      const data = requireParsed(parsed, ERROR_CODES.CMS_VALIDATION, "Invalid feature flags");

      if (!hasSupabase) {
        updateDemoConfig({ features: data });
        revalidateCms();
        return;
      }

      const supabase = await createClerkSupabaseClient();
      const { error } = await supabase.from("gym_branding").upsert(
        {
          gym_id: gymId,
          feature_flags: data,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "gym_id" },
      );

      if (error) throwAppError(ERROR_CODES.CMS_SAVE_FAILED, error.message);
      revalidateCms();
    },
    {
      fallbackCode: ERROR_CODES.CMS_SAVE_FAILED,
      capture: cmsCapture("/admin/settings/features"),
    },
  );

export const updateSiteMenuAction = async (input: unknown): Promise<ActionResult> =>
  wrapAction(
    async () => {
      const { gymId, actor } = await getOwnerGymContext();
      const parsed = siteMenuSchema.safeParse(input);
      const data = requireParsed(parsed, ERROR_CODES.CMS_VALIDATION, "Invalid site menu data");

      const base = getGymConfig();
      const builtNav = buildNavFromSiteMenu(data);
      const features = buildFeaturesFromSiteMenu(data, base.features);
      const nav: GymConfig["nav"] = {
        ...base.nav,
        public: builtNav.public,
        member: builtNav.member,
        account: builtNav.account,
      };

      const summary = `Updated site menu (${builtNav.public.length} public, ${builtNav.member.length} header member, ${builtNav.account.length} account links)`;

      if (!hasSupabase) {
        updateDemoConfig({ nav, features });
        revalidateCms();
        await logAdminAuditEvent({
          gymId,
          actor,
          action: ADMIN_AUDIT_ACTIONS.CMS_NAV_UPDATE,
          resourceType: "gym_branding",
          resourceId: gymId,
          summary,
          metadata: {
            publicLinkCount: builtNav.public.length,
            memberLinkCount: builtNav.member.length,
            accountLinkCount: builtNav.account.length,
            externalLinkCount: data.externalLinks.length,
          },
        });
        return;
      }

      const supabase = await createClerkSupabaseClient();
      const { error } = await supabase.from("gym_branding").upsert(
        {
          gym_id: gymId,
          nav,
          feature_flags: features,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "gym_id" },
      );

      if (error) throwAppError(ERROR_CODES.CMS_SAVE_FAILED, error.message);
      revalidateCms();
      await logAdminAuditEvent({
        gymId,
        actor,
        action: ADMIN_AUDIT_ACTIONS.CMS_NAV_UPDATE,
        resourceType: "gym_branding",
        resourceId: gymId,
        summary,
        metadata: {
          publicLinkCount: builtNav.public.length,
          memberLinkCount: builtNav.member.length,
          externalLinkCount: data.externalLinks.length,
        },
      });
    },
    {
      fallbackCode: ERROR_CODES.CMS_SAVE_FAILED,
      capture: cmsCapture("/admin/settings/navigation"),
    },
  );

export const saveHomepageSectionsAction = async (sections: HomepageSection[]): Promise<ActionResult> =>
  wrapAction(
    async () => {
      const { gymId, actor } = await getOwnerGymContext();
      const parsed = homepageSectionsSchema.safeParse(sections);
      const data = requireParsed(parsed, ERROR_CODES.CMS_HOMEPAGE, "Invalid homepage sections");

      const config = getGymConfig();
      const normalized = data.map((section, index) => ({
        ...section,
        order: index + 1,
      }));

      if (!hasSupabase) {
        updateDemoSections(normalized);
        revalidateCms();
        await logAdminAuditEvent({
          gymId,
          actor,
          action: ADMIN_AUDIT_ACTIONS.CMS_HOMEPAGE_SECTIONS_SAVE,
          resourceType: "gym_page_sections",
          summary: `Saved ${normalized.length} homepage sections`,
          metadata: {
            sectionCount: normalized.length,
            sectionKeys: normalized.map((s) => s.id),
          },
        });
        return;
      }

      const pageId = await getHomePageId(config.slug);
      if (!pageId) throwAppError(ERROR_CODES.CMS_NOT_FOUND, "Home page not found");

      const supabase = await createClerkSupabaseClient();
      const { data: existing } = await supabase.from("gym_page_sections").select("section_key").eq("page_id", pageId);

      const nextKeys = new Set(normalized.map((s) => s.id));
      const toDelete = (existing ?? []).map((row) => row.section_key).filter((key) => !nextKeys.has(key));

      if (toDelete.length) {
        const { error: deleteError } = await supabase
          .from("gym_page_sections")
          .delete()
          .eq("page_id", pageId)
          .in("section_key", toDelete);
        if (deleteError) throwAppError(ERROR_CODES.CMS_HOMEPAGE, deleteError.message);
      }

      const rows = normalized.map((section) => ({
        page_id: pageId,
        section_key: section.id,
        section_type: section.type,
        sort_order: section.order,
        enabled: section.enabled,
        props: section.props,
      }));

      const { error } = await supabase.from("gym_page_sections").upsert(rows, {
        onConflict: "page_id,section_key",
      });

      if (error) throwAppError(ERROR_CODES.CMS_HOMEPAGE, error.message);
      revalidateCms();
      await logAdminAuditEvent({
        gymId,
        actor,
        action: ADMIN_AUDIT_ACTIONS.CMS_HOMEPAGE_SECTIONS_SAVE,
        resourceType: "gym_page_sections",
        resourceId: pageId,
        summary: `Saved ${normalized.length} homepage sections`,
        metadata: {
          sectionCount: normalized.length,
          sectionKeys: normalized.map((s) => s.id),
          deletedKeys: toDelete,
        },
      });
    },
    {
      fallbackCode: ERROR_CODES.CMS_HOMEPAGE,
      capture: cmsCapture("/admin/settings/homepage"),
    },
  );

export const updateHeroSectionAction = async (input: unknown): Promise<SaveActionResult> => {
  const { gymId, actor } = await getOwnerGymContext();
  const parsed = heroPropsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Fix the highlighted fields.",
      fieldErrors: formatHeroFieldErrors(parsed.error),
    };
  }

  const heroData = parsed.data;

  const config = getGymConfig();
  const heroSection = config.homepageSections.find((section) => section.type === "hero");
  if (!heroSection) {
    return { ok: false, message: "Hero section not found." };
  }

  if (!hasSupabase) {
    const baseSections = getDemoContentOverride()?.sections ?? config.homepageSections;
    updateDemoSections(
      baseSections.map((section) =>
        section.type === "hero" ? ({ ...section, props: heroData } as HomepageSection) : section,
      ),
    );
    revalidateCms();
    await logAdminAuditEvent({
      gymId,
      actor,
      action: ADMIN_AUDIT_ACTIONS.CMS_HERO_UPDATE,
      resourceType: "gym_page_sections",
      resourceId: heroSection.id,
      summary: "Updated homepage hero section",
      metadata: { layout: heroData.layout },
    });
    return { ok: true };
  }

  const pageId = await getHomePageId(config.slug);
  if (!pageId) {
    return { ok: false, message: "Home page not found." };
  }

  const supabase = await createClerkSupabaseClient();
  const { data: row } = await supabase
    .from("gym_page_sections")
    .select("sort_order, enabled")
    .eq("page_id", pageId)
    .eq("section_key", heroSection.id)
    .maybeSingle();

  const { error } = await supabase.from("gym_page_sections").upsert(
    {
      page_id: pageId,
      section_key: heroSection.id,
      section_type: "hero",
      sort_order: row?.sort_order ?? heroSection.order,
      enabled: row?.enabled ?? heroSection.enabled,
      props: heroData,
    },
    { onConflict: "page_id,section_key" },
  );

  if (error) {
    return operationalFail(ERROR_CODES.CMS_SAVE_FAILED, "Could not save hero settings.");
  }

  revalidateCms();
  await logAdminAuditEvent({
    gymId,
    actor,
    action: ADMIN_AUDIT_ACTIONS.CMS_HERO_UPDATE,
    resourceType: "gym_page_sections",
    resourceId: heroSection.id,
    summary: "Updated homepage hero section",
    metadata: { layout: parsed.data.layout },
  });
  return { ok: true };
};

const ASSET_FOLDERS = ["library", "hero", "gallery", "logo"] as const;

const getPublicAssetUrl = (path: string) => {
  const service = createServiceClient();
  return service.storage.from("gym-assets").getPublicUrl(path).data.publicUrl;
};

export const listGymAssetsAction = async (search?: string): Promise<GymAsset[]> => {
  await requireOwner();
  const config = getGymConfig();
  const query = search?.trim().toLowerCase() ?? "";

  if (!hasSupabase) {
    return listDemoAssets(query || undefined);
  }

  const supabase = await createClerkSupabaseClient();
  const assets: GymAsset[] = [];

  for (const folder of ASSET_FOLDERS) {
    const prefix = `${config.slug}/${folder}`;
    const { data, error } = await supabase.storage.from("gym-assets").list(prefix, {
      limit: 100,
      sortBy: { column: "created_at", order: "desc" },
    });

    if (error || !data) continue;

    for (const item of data) {
      if (!item.id) continue;
      const path = `${prefix}/${item.name}`;
      const displayName = item.name.replace(/\.[^.]+$/, "");
      assets.push({
        name: item.name,
        displayName,
        path,
        url: getPublicAssetUrl(path),
        folder,
        createdAt: item.created_at ?? null,
        size: typeof item.metadata?.size === "number" ? item.metadata.size : null,
      });
    }
  }

  const filtered = query
    ? assets.filter(
        (asset) =>
          asset.displayName.toLowerCase().includes(query) ||
          asset.name.toLowerCase().includes(query) ||
          asset.folder.toLowerCase().includes(query),
      )
    : assets;

  return filtered.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
};

export const uploadGymAssetAction = async (formData: FormData): Promise<ActionResult<{ url: string }>> =>
  wrapAction(
    async () => {
      const { config, gymId, actor } = await getOwnerGymContext();
      const assetTypeRaw = formData.get("assetType");
      const fileEntry = formData.get("file");
      const fileNameRaw = formData.get("fileName");

      const assetTypeParsed = assetTypeSchema.safeParse(assetTypeRaw);
      if (!assetTypeParsed.success) {
        throwAppError(ERROR_CODES.MEDIA_UPLOAD_FAILED, "Invalid upload");
        throw new Error("Invalid upload");
      }

      const file = requireUploadFile(fileEntry);
      const assetType = assetTypeParsed.data;
      const allowedTypes: readonly string[] =
        assetType === "gallery"
          ? ALLOWED_GALLERY_TYPES
          : assetType === "font"
            ? ALLOWED_FONT_TYPES
            : ALLOWED_IMAGE_TYPES;

      if (!allowedTypes.includes(file.type)) {
        throwAppError(ERROR_CODES.MEDIA_INVALID_TYPE);
      }

      const tooLargeError = getAssetTooLargeError(file, assetType);
      if (tooLargeError) {
        throwAppError(ERROR_CODES.MEDIA_TOO_LARGE, tooLargeError);
      }

      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const safeName = normalizeAssetFileName(String(fileNameRaw ?? file.name.replace(/\.[^.]+$/, "")));

      const buffer = Buffer.from(await file.arrayBuffer());

      if (!hasSupabase) {
        const existingNames = new Set(listDemoAssets().map((asset) => asset.name));
        const uniqueBase = resolveUniqueAssetBaseName(safeName, (candidate) =>
          existingNames.has(`${candidate}.${ext}`),
        );
        const objectPath = `${config.slug}/library/${uniqueBase}.${ext}`;
        const url = `data:${file.type};base64,${buffer.toString("base64")}`;
        addDemoAsset({
          name: `${uniqueBase}.${ext}`,
          displayName: uniqueBase,
          path: objectPath,
          url,
          folder: "library",
          createdAt: new Date().toISOString(),
          size: file.size,
        });
        return { url };
      }

      const supabase = await createClerkSupabaseClient();
      for (let attempt = 1; attempt <= 999; attempt += 1) {
        const uniqueBase = attempt === 1 ? safeName : `${safeName}-${attempt}`;
        const objectPath = `${config.slug}/library/${uniqueBase}.${ext}`;
        const { error } = await supabase.storage.from("gym-assets").upload(objectPath, buffer, {
          contentType: file.type,
          upsert: false,
        });

        if (!error) {
          await logAdminAuditEvent({
            gymId,
            actor,
            action: ADMIN_AUDIT_ACTIONS.STORAGE_ASSET_UPLOAD,
            resourceType: "storage.object",
            resourceId: objectPath,
            summary: `Uploaded ${uniqueBase}.${ext}`,
            metadata: { assetType, size: file.size, contentType: file.type },
          });
          return { url: getPublicAssetUrl(objectPath) };
        }

        if (!error.message.toLowerCase().includes("already exists")) {
          throwAppError(ERROR_CODES.MEDIA_UPLOAD_FAILED, error.message);
        }
      }

      throwAppError(ERROR_CODES.MEDIA_UPLOAD_FAILED, "Could not save file. Please try again.");
    },
    {
      fallbackCode: ERROR_CODES.MEDIA_UPLOAD_FAILED,
      capture: cmsCapture("/admin/settings/media"),
    },
  );

export const renameGalleryAssetAction = async (input: {
  currentUrl: string;
  fileName: string;
}): Promise<ActionResult<{ url: string; fileName: string }>> =>
  wrapAction(
    async () => {
      const { config, gymId, actor } = await getOwnerGymContext();

      const safeName = normalizeAssetFileName(input.fileName);

      const ext = fileExtensionFromGalleryUrl(input.currentUrl);
      const storagePath = parseGymAssetStoragePath(input.currentUrl);

      if (!storagePath) {
        if (input.currentUrl.startsWith("data:")) {
          renameDemoAssetByUrl(input.currentUrl, safeName, ext);
          return { url: input.currentUrl, fileName: safeName };
        }
        return { url: input.currentUrl, fileName: safeName };
      }

      const currentBase =
        storagePath
          .split("/")
          .pop()
          ?.replace(/\.[^.]+$/, "") ?? "";
      if (currentBase === safeName) {
        return { url: input.currentUrl, fileName: safeName };
      }

      const folderPrefix = `${config.slug}/library/`;
      if (!storagePath.startsWith(folderPrefix)) {
        throwAppError(ERROR_CODES.MEDIA_RENAME_FAILED, "This file is not in your gallery library.");
      }

      if (!hasSupabase) {
        renameDemoAssetByUrl(input.currentUrl, safeName, ext);
        return { url: input.currentUrl, fileName: safeName };
      }

      const supabase = await createClerkSupabaseClient();
      for (let attempt = 1; attempt <= 999; attempt += 1) {
        const uniqueBase = attempt === 1 ? safeName : `${safeName}-${attempt}`;
        const newPath = `${folderPrefix}${uniqueBase}.${ext}`;
        const { error } = await supabase.storage.from("gym-assets").move(storagePath, newPath);

        if (!error) {
          revalidateCms();
          await logAdminAuditEvent({
            gymId,
            actor,
            action: ADMIN_AUDIT_ACTIONS.STORAGE_ASSET_RENAME,
            resourceType: "storage.object",
            resourceId: newPath,
            summary: `Renamed asset to ${uniqueBase}.${ext}`,
            metadata: { from: storagePath, to: newPath },
          });
          return {
            url: getPublicAssetUrl(newPath),
            fileName: uniqueBase,
          };
        }

        if (!error.message.toLowerCase().includes("already exists")) {
          throwAppError(ERROR_CODES.MEDIA_RENAME_FAILED, error.message);
        }
      }

      throwAppError(ERROR_CODES.MEDIA_RENAME_FAILED, "Could not rename file. Please try again.");
    },
    {
      fallbackCode: ERROR_CODES.MEDIA_RENAME_FAILED,
      capture: cmsCapture("/admin/settings/media"),
    },
  );
