import type { MembershipRole, ProfileVisibility } from "@/types/database";
import { getGymConfig } from "@/config";
import { getClerkUserId } from "@/lib/auth/clerk";
import { demoTrainerAssignments, getDemoMembership, getDemoProfile } from "@/lib/demo-data";
import { hasClerk, hasSupabase } from "@/lib/env";
import {
  ensureGymMembershipForProfile,
  getGymIdBySlug,
  getMembershipForProfile,
  getProfileByClerkId,
} from "@/lib/profiles";

export type AuthContext = {
  profileId: string | null;
  clerkUserId: string | null;
  role: MembershipRole | null;
  gymId: string | null;
};

const demoUserId = "demo-member";
const demoStaffId = "demo-admin";
const demoTrainerId = "demo-trainer";

export const getAuthContext = async (): Promise<AuthContext> => {
  let clerkUserId = await getClerkUserId();

  if (!clerkUserId && !hasClerk) {
    clerkUserId = demoUserId;
  }

  if (!clerkUserId) {
    return { profileId: null, clerkUserId: null, role: null, gymId: null };
  }

  if (!hasSupabase) {
    const profile = getDemoProfile(clerkUserId);
    const membership = profile ? getDemoMembership(profile.id) : null;
    return {
      profileId: profile?.id ?? null,
      clerkUserId,
      role: membership?.role ?? "user",
      gymId: membership?.gym_id ?? null,
    };
  }

  const config = getGymConfig();
  const profile = await getProfileByClerkId(clerkUserId);
  if (!profile) {
    return { profileId: null, clerkUserId, role: null, gymId: null };
  }

  const gymId = (await getGymIdBySlug(config.slug)) ?? null;
  const membership = gymId ? await getMembershipForProfile(profile.id, gymId) : null;

  return {
    profileId: profile.id,
    clerkUserId,
    role: membership?.role ?? null,
    gymId,
  };
};

export const requireAuth = async () => {
  const ctx = await getAuthContext();
  if (!ctx.clerkUserId) {
    throw new Error("Unauthorized");
  }
  return ctx;
};

export const requireMember = async () => {
  if (!hasClerk) {
    const profile = getDemoProfile(demoUserId)!;
    return {
      profileId: profile.id,
      clerkUserId: demoUserId,
      role: "user" as MembershipRole,
      gymId: getDemoMembership(profile.id).gym_id,
    };
  }
  const ctx = await requireAuth();
  if (!ctx.profileId) {
    throw new Error("Profile not found");
  }

  if (ctx.role && ctx.gymId) {
    return ctx;
  }

  const membership = await ensureGymMembershipForProfile(ctx.profileId);
  if (!membership) {
    throw new Error("Gym membership unavailable");
  }

  return {
    ...ctx,
    role: membership.role,
    gymId: membership.gymId,
  };
};

export const isStaffRole = (role: MembershipRole | null) =>
  role === "employee" || role === "manager" || role === "owner";

export const isManagerRole = (role: MembershipRole | null) => role === "manager" || role === "owner";

export const isTrainerRole = (role: MembershipRole | null) => role === "personal_trainer" || isManagerRole(role);

export const requireStaff = async () => {
  if (!hasClerk) {
    const profile = getDemoProfile(demoStaffId)!;
    return {
      profileId: profile.id,
      clerkUserId: demoStaffId,
      role: "manager" as MembershipRole,
      gymId: getDemoMembership(profile.id).gym_id,
    };
  }
  const ctx = await requireMember();
  if (!isStaffRole(ctx.role)) {
    throw new Error("Staff access required");
  }
  return ctx;
};

export const requireManager = async () => {
  if (!hasClerk) {
    const profile = getDemoProfile(demoStaffId)!;
    return {
      profileId: profile.id,
      clerkUserId: demoStaffId,
      role: "manager" as MembershipRole,
      gymId: getDemoMembership(profile.id).gym_id,
    };
  }
  const ctx = await requireMember();
  if (!isManagerRole(ctx.role)) {
    throw new Error("Manager access required");
  }
  return ctx;
};

export const requireAdmin = async () => requireManager();

export const requireOwner = async () => {
  const ctx = await requireMember();
  if (ctx.role !== "owner") {
    if (!hasClerk && ctx.clerkUserId === demoStaffId) {
      return { ...ctx, role: "owner" as MembershipRole };
    }
    throw new Error("Owner access required");
  }
  return ctx;
};

export const isOwnerRole = (role: MembershipRole | null) => role === "owner";

export const canEditSiteContent = (role: MembershipRole | null) => isOwnerRole(role);

export const requireTrainer = async () => {
  if (!hasClerk) {
    const profile = getDemoProfile(demoTrainerId)!;
    return {
      profileId: profile.id,
      clerkUserId: demoTrainerId,
      role: "personal_trainer" as MembershipRole,
      gymId: getDemoMembership(profile.id).gym_id,
    };
  }
  const ctx = await requireMember();
  if (!isTrainerRole(ctx.role)) {
    throw new Error("Trainer access required");
  }
  return ctx;
};

export const canViewProfile = async (
  viewerProfileId: string | null,
  viewerRole: MembershipRole | null,
  targetProfileId: string,
  targetVisibility: ProfileVisibility,
): Promise<boolean> => {
  if (!viewerProfileId) return targetVisibility === "public";
  if (viewerProfileId === targetProfileId) return true;
  if (targetVisibility === "public") return true;

  if (targetVisibility === "trainer" && viewerRole === "personal_trainer") {
    if (!hasSupabase) {
      return demoTrainerAssignments.some(
        (assignment) =>
          assignment.client_profile_id === targetProfileId &&
          assignment.trainer_profile_id === viewerProfileId &&
          assignment.active,
      );
    }
  }

  return false;
};
