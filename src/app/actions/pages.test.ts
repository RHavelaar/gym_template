import { beforeEach, describe, expect, it, vi } from "vitest";
import { ironAsylumConfig } from "@/config/gyms/iron-asylum";
import { ironAsylumDefaultPricingPlans } from "@/config/pricing-defaults";
import { DEFAULT_CONTACT_PAGE_SETTINGS, DEFAULT_PRICING_PAGE_SETTINGS } from "@/config/types";

const mockRequireOwner = vi.fn();
const mockResolveAuditActor = vi.fn();
const mockLogAdminAuditEvent = vi.fn();
const mockUpdateDemoContactPage = vi.fn();
const mockUpdateDemoPricingPage = vi.fn();
const mockUpdateDemoPricingPlans = vi.fn();

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/env", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/env")>();
  return { ...actual, hasSupabase: false, hasClerk: false };
});

vi.mock("@/lib/rbac", () => ({
  requireOwner: () => mockRequireOwner(),
}));

vi.mock("@/lib/audit/resolve-actor", () => ({
  resolveAuditActor: (...args: unknown[]) => mockResolveAuditActor(...args),
}));

vi.mock("@/lib/demo-content-store", () => ({
  updateDemoContactPage: (...args: unknown[]) => mockUpdateDemoContactPage(...args),
  updateDemoPricingPage: (...args: unknown[]) => mockUpdateDemoPricingPage(...args),
  updateDemoPricingPlans: (...args: unknown[]) => mockUpdateDemoPricingPlans(...args),
}));

vi.mock("@/lib/audit", () => ({
  logAdminAuditEvent: (...args: unknown[]) => mockLogAdminAuditEvent(...args),
  buildChangeSet: vi.fn(() => []),
}));

vi.mock("@/lib/pricing-pages", () => ({
  resolveOwnerGymId: vi.fn(async () => ({ gymId: "demo-gym-id", slug: "iron-asylum" })),
  ensureGymPage: vi.fn(async () => "demo-page-id"),
}));

vi.mock("@/config", () => ({
  getGymConfig: () => ironAsylumConfig,
}));

const { saveContactPageSettingsAction, savePricingPageSettingsAction, savePricingPlansAction } =
  await import("@/app/actions/pages");

describe("pages actions (demo mode)", () => {
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
      displayName: "Owner",
      role: "owner",
    });
  });

  it("saveContactPageSettingsAction updates demo store", async () => {
    const payload = { ...DEFAULT_CONTACT_PAGE_SETTINGS, headline: "Hello gym" };
    const result = await saveContactPageSettingsAction(payload);
    expect(result.ok).toBe(true);
    expect(mockUpdateDemoContactPage).toHaveBeenCalledWith(payload);
  });

  it("savePricingPlansAction updates demo store", async () => {
    const result = await savePricingPlansAction(ironAsylumDefaultPricingPlans);
    expect(result.ok).toBe(true);
    expect(mockUpdateDemoPricingPlans).toHaveBeenCalled();
  });

  it("savePricingPageSettingsAction updates demo store", async () => {
    const payload = { ...DEFAULT_PRICING_PAGE_SETTINGS, headline: "Our rates" };
    const result = await savePricingPageSettingsAction(payload);
    expect(result.ok).toBe(true);
    expect(mockUpdateDemoPricingPage).toHaveBeenCalledWith(payload);
  });
});
