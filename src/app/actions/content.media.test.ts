import { beforeEach, describe, expect, it, vi } from "vitest";
import { ironAsylumConfig } from "@/config/gyms/iron-asylum";
import { DEFAULT_HERO_PROPS } from "@/config/types";
import { validHeroProps, validMediaPayload } from "@/lib/validation/media.fixtures";

const mockRevalidatePath = vi.fn();
const mockRequireOwner = vi.fn();
const mockResolveAuditActor = vi.fn();
const mockGetGymIdBySlug = vi.fn();
const mockUpdateDemoConfig = vi.fn();
const mockUpdateDemoSections = vi.fn();
const mockGetDemoContentOverride = vi.fn();
const mockLogAdminAuditEvent = vi.fn();

vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}));

vi.mock("@/lib/env", () => ({
  hasSupabase: false,
  hasClerk: false,
}));

vi.mock("@/lib/rbac", () => ({
  requireOwner: () => mockRequireOwner(),
}));

vi.mock("@/lib/audit/resolve-actor", () => ({
  resolveAuditActor: (...args: unknown[]) => mockResolveAuditActor(...args),
}));

vi.mock("@/lib/profiles", () => ({
  getGymIdBySlug: (...args: unknown[]) => mockGetGymIdBySlug(...args),
}));

vi.mock("@/lib/demo-content-store", () => ({
  getDemoContentOverride: () => mockGetDemoContentOverride(),
  updateDemoConfig: (...args: unknown[]) => mockUpdateDemoConfig(...args),
  updateDemoSections: (...args: unknown[]) => mockUpdateDemoSections(...args),
}));

vi.mock("@/lib/audit", () => ({
  buildChangeSet: vi.fn(),
  logAdminAuditEvent: (...args: unknown[]) => mockLogAdminAuditEvent(...args),
}));

vi.mock("@/config", () => ({
  getGymConfig: () => ironAsylumConfig,
}));

const { updateHeroSectionAction, updateMediaAction } = await import("@/app/actions/content");

describe("updateMediaAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireOwner.mockResolvedValue({
      gymId: "demo-gym-id",
      profileId: "profile-1",
      role: "owner",
      clerkUserId: "user_1",
    });
    mockResolveAuditActor.mockResolvedValue({
      profileId: "profile-1",
      role: "owner",
      displayName: "Owner",
    });
    mockGetGymIdBySlug.mockResolvedValue("demo-gym-id");
    mockGetDemoContentOverride.mockReturnValue(null);
    mockLogAdminAuditEvent.mockResolvedValue(undefined);
  });

  it("persists valid media payloads in demo mode", async () => {
    const result = await updateMediaAction(validMediaPayload);

    expect(result).toEqual({ ok: true });
    expect(mockUpdateDemoConfig).toHaveBeenCalledWith({
      images: {
        hero: validMediaPayload.hero,
        gallery: validMediaPayload.gallery,
      },
    });
    expect(mockUpdateDemoSections).toHaveBeenCalled();
    expect(mockLogAdminAuditEvent).toHaveBeenCalled();
    expect(mockRevalidatePath).toHaveBeenCalled();
  });

  it("returns a validation message for invalid media payloads", async () => {
    const result = await updateMediaAction({
      ...validMediaPayload,
      hero: "",
    });

    expect(result).toEqual({
      ok: false,
      message: "Invalid media data. Check your gallery and hero image.",
    });
    expect(mockUpdateDemoConfig).not.toHaveBeenCalled();
  });

  it("propagates owner auth failures", async () => {
    mockRequireOwner.mockRejectedValue(new Error("Owner access required"));

    await expect(updateMediaAction(validMediaPayload)).rejects.toThrow("Owner access required");
  });
});

describe("updateHeroSectionAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireOwner.mockResolvedValue({
      gymId: "demo-gym-id",
      profileId: "profile-1",
      role: "owner",
      clerkUserId: "user_1",
    });
    mockResolveAuditActor.mockResolvedValue({
      profileId: "profile-1",
      role: "owner",
      displayName: "Owner",
    });
    mockGetGymIdBySlug.mockResolvedValue("demo-gym-id");
    mockGetDemoContentOverride.mockReturnValue(null);
    mockLogAdminAuditEvent.mockResolvedValue(undefined);
  });

  it("persists valid hero props in demo mode", async () => {
    const result = await updateHeroSectionAction(validHeroProps);

    expect(result).toEqual({ ok: true });
    expect(mockUpdateDemoSections).toHaveBeenCalled();
    expect(mockLogAdminAuditEvent).toHaveBeenCalled();
    expect(mockRevalidatePath).toHaveBeenCalled();
  });

  it("returns field errors for invalid hero props", async () => {
    const result = await updateHeroSectionAction({
      ...validHeroProps,
      showHeadline: true,
      headline: "",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toBe("Fix the highlighted fields.");
      expect(result.fieldErrors?.headline).toBe("Headline is required when shown");
    }
    expect(mockUpdateDemoSections).not.toHaveBeenCalled();
  });

  it("allows hidden fields to stay empty when toggles are off", async () => {
    const result = await updateHeroSectionAction({
      ...DEFAULT_HERO_PROPS,
      showTagline: false,
      tagline: "",
      showHeadline: false,
      headline: "",
      showSubheadline: false,
      subheadline: "",
      showPrimaryCta: false,
      ctaLabel: "",
      ctaHref: "",
      showSecondaryCta: false,
      secondaryCtaLabel: "",
      secondaryCtaHref: "",
    });

    expect(result).toEqual({ ok: true });
  });
});
