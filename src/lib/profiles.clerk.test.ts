import { beforeEach, describe, expect, it, vi } from "vitest";
import { ironAsylumConfig } from "@/config/gyms/iron-asylum";
import { ADMIN_AUDIT_ACTIONS } from "@/types/database";

const mockLogAdminAuditEvent = vi.fn();
const mockProfileMaybeSingle = vi.fn();
const mockGymMaybeSingle = vi.fn();
const mockDeleteEq = vi.fn();
const mockProfileSelectEq = vi.fn();
const mockGymSelectEq = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/env", () => ({
  hasSupabase: true,
}));

vi.mock("@/config", () => ({
  getGymConfig: () => ironAsylumConfig,
}));

vi.mock("@/lib/audit", () => ({
  logAdminAuditEvent: (...args: unknown[]) => mockLogAdminAuditEvent(...args),
  systemActor: () => ({
    profileId: null,
    role: null,
    displayName: "System",
  }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServiceClient: () => ({
    from: (...args: unknown[]) => mockFrom(...args),
  }),
}));

const { deleteProfileFromClerk } = await import("@/lib/profiles");

describe("deleteProfileFromClerk", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogAdminAuditEvent.mockResolvedValue(undefined);
    mockProfileSelectEq.mockReturnValue({ maybeSingle: mockProfileMaybeSingle });
    mockGymSelectEq.mockReturnValue({ maybeSingle: mockGymMaybeSingle });
    mockDeleteEq.mockResolvedValue({ error: null });
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") {
        return {
          select: () => ({ eq: mockProfileSelectEq }),
          delete: () => ({ eq: mockDeleteEq }),
        };
      }
      if (table === "gyms") {
        return {
          select: () => ({ eq: mockGymSelectEq }),
        };
      }
      return {};
    });
  });

  it("audits using config gym id when slug lookup succeeds", async () => {
    mockGymMaybeSingle.mockResolvedValue({ data: { id: "gym-from-slug" } });
    mockProfileMaybeSingle.mockResolvedValue({
      data: { id: "profile-1", gym_memberships: [{ gym_id: "gym-from-slug" }] },
    });

    await deleteProfileFromClerk("user_abc");

    expect(mockDeleteEq).toHaveBeenCalledWith("clerk_user_id", "user_abc");
    expect(mockLogAdminAuditEvent).toHaveBeenCalledTimes(1);
    expect(mockLogAdminAuditEvent).toHaveBeenCalledWith({
      gymId: "gym-from-slug",
      actor: {
        profileId: null,
        role: null,
        displayName: "System",
      },
      action: ADMIN_AUDIT_ACTIONS.SYSTEM_PROFILE_DELETE,
      resourceType: "profiles",
      resourceId: "profile-1",
      summary: "Clerk deleted user profile",
      metadata: { clerkUserId: "user_abc" },
    });
  });

  it("audits from membership gym ids when slug lookup returns null", async () => {
    mockGymMaybeSingle.mockResolvedValue({ data: null });
    mockProfileMaybeSingle.mockResolvedValue({
      data: { id: "profile-2", gym_memberships: [{ gym_id: "gym-from-membership" }] },
    });

    await deleteProfileFromClerk("user_def");

    expect(mockLogAdminAuditEvent).toHaveBeenCalledTimes(1);
    expect(mockLogAdminAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        gymId: "gym-from-membership",
        resourceId: "profile-2",
        metadata: { clerkUserId: "user_def" },
      }),
    );
  });

  it("dedupes audit events when slug and membership resolve to the same gym", async () => {
    mockGymMaybeSingle.mockResolvedValue({ data: { id: "shared-gym" } });
    mockProfileMaybeSingle.mockResolvedValue({
      data: {
        id: "profile-3",
        gym_memberships: [{ gym_id: "shared-gym" }, { gym_id: "other-gym" }],
      },
    });

    await deleteProfileFromClerk("user_ghi");

    expect(mockLogAdminAuditEvent).toHaveBeenCalledTimes(2);
    expect(mockLogAdminAuditEvent).toHaveBeenCalledWith(expect.objectContaining({ gymId: "shared-gym" }));
    expect(mockLogAdminAuditEvent).toHaveBeenCalledWith(expect.objectContaining({ gymId: "other-gym" }));
  });

  it("does not audit when delete fails", async () => {
    mockGymMaybeSingle.mockResolvedValue({ data: { id: "gym-from-slug" } });
    mockProfileMaybeSingle.mockResolvedValue({ data: { id: "profile-4", gym_memberships: [] } });
    mockDeleteEq.mockResolvedValue({ error: { message: "delete failed" } });

    await expect(deleteProfileFromClerk("user_jkl")).rejects.toThrow("delete failed");
    expect(mockLogAdminAuditEvent).not.toHaveBeenCalled();
  });
});
