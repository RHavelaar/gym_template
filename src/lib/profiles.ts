import { cache } from "react";
import type {
  GenderDivision,
  GymMembership,
  MeasurementDeltas,
  Profile,
  ProfileMeasurement,
  ProfileMeasurementGoals,
  ProfileVisibility,
  TrainerAssignment,
  TrainerNote,
} from "@/types/database";
import { getGymConfig } from "@/config";
import {
  demoMeasurementGoals,
  demoMeasurements,
  demoProfiles,
  demoTrainerAssignments,
  demoTrainerNotes,
  getDemoMembership,
  getDemoProfile,
  upsertDemoMeasurementGoals,
} from "@/lib/demo-data";
import { hasSupabase } from "@/lib/env";
import {
  MEASUREMENT_FIELD_KEYS,
  profileGoalsFromRow,
  type GoalTrackableFieldKey,
  type MeasurementFieldKey,
} from "@/lib/measurements";
import { logAdminAuditEvent, systemActor } from "@/lib/audit";
import { createClerkSupabaseClient } from "@/lib/supabase/clerk-server";
import { createServiceClient } from "@/lib/supabase/server";
import { ADMIN_AUDIT_ACTIONS } from "@/types/database";

const num = (value: unknown): number | null => (value != null ? Number(value) : null);

const normalizeVisibility = (value: unknown): ProfileVisibility => {
  if (value === "trainer" || value === "public") return value;
  return "private";
};

const mapMeasurementFields = (row: Record<string, unknown>) =>
  Object.fromEntries(MEASUREMENT_FIELD_KEYS.map((key) => [key, num(row[key])])) as Record<
    MeasurementFieldKey,
    number | null
  >;

const mapProfile = (row: Record<string, unknown>): Profile => {
  const fields = mapMeasurementFields(row);

  return {
    id: row.id as string,
    clerk_user_id: row.clerk_user_id as string,
    display_name: row.display_name as string,
    username: (row.username as string | null) ?? null,
    avatar_url: (row.avatar_url as string | null) ?? null,
    bio: (row.bio as string | null) ?? null,
    bodyweight_lbs: num(row.bodyweight_lbs),
    gender_division: row.gender_division as GenderDivision,
    visibility: normalizeVisibility(row.visibility),
    created_at: row.created_at as string,
    updated_at: (row.updated_at as string) ?? (row.created_at as string),
    height_in: fields.height_in,
    body_fat_pct: fields.body_fat_pct,
    neck_in: fields.neck_in,
    shoulders_in: fields.shoulders_in,
    chest_in: fields.chest_in,
    waist_in: fields.waist_in,
    hips_in: fields.hips_in,
    glutes_in: fields.glutes_in,
    biceps_left_in: fields.biceps_left_in,
    biceps_right_in: fields.biceps_right_in,
    forearm_left_in: fields.forearm_left_in,
    forearm_right_in: fields.forearm_right_in,
    wrist_in: fields.wrist_in,
    thigh_left_in: fields.thigh_left_in,
    thigh_right_in: fields.thigh_right_in,
    calf_left_in: fields.calf_left_in,
    calf_right_in: fields.calf_right_in,
    ankle_in: fields.ankle_in,
  };
};

const mapMeasurement = (row: Record<string, unknown>): ProfileMeasurement => ({
  id: row.id as string,
  profile_id: row.profile_id as string,
  recorded_at: row.recorded_at as string,
  gender_division: row.gender_division as GenderDivision,
  notes: (row.notes as string | null) ?? null,
  source: (row.source as string) ?? "manual",
  created_at: row.created_at as string,
  ...mapMeasurementFields(row),
});

export const getGymIdBySlug = cache(async (slug: string): Promise<string | null> => {
  if (!hasSupabase) return null;
  const supabase = createServiceClient();
  const { data } = await supabase.from("gyms").select("id").eq("slug", slug).maybeSingle();
  return data?.id ?? null;
});

export const getProfileByClerkId = async (clerkUserId: string): Promise<Profile | null> => {
  if (!hasSupabase) {
    return getDemoProfile(clerkUserId) ?? null;
  }

  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase.from("profiles").select("*").eq("clerk_user_id", clerkUserId).maybeSingle();

  if (error || !data) return null;
  return mapProfile(data);
};

export const getProfileById = async (profileId: string): Promise<Profile | null> => {
  if (!hasSupabase) {
    return demoProfiles.find((p) => p.id === profileId) ?? null;
  }

  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", profileId).maybeSingle();

  if (error || !data) return null;
  return mapProfile(data);
};

export const getMembershipForProfile = async (profileId: string, gymId: string): Promise<GymMembership | null> => {
  if (!hasSupabase) {
    const demo = getDemoMembership(profileId);
    if (!demo) return null;
    return {
      id: `membership-${profileId}`,
      gym_id: demo.gym_id,
      profile_id: profileId,
      role: demo.role,
      joined_at: new Date().toISOString(),
    };
  }

  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase
    .from("gym_memberships")
    .select("*")
    .eq("profile_id", profileId)
    .eq("gym_id", gymId)
    .maybeSingle();

  if (error || !data) return null;
  return data as GymMembership;
};

export const getMeasurementHistory = async (profileId: string, limit = 20): Promise<ProfileMeasurement[]> => {
  if (!hasSupabase) {
    return demoMeasurements
      .filter((m) => m.profile_id === profileId)
      .sort((a, b) => b.recorded_at.localeCompare(a.recorded_at))
      .slice(0, limit);
  }

  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase
    .from("profile_measurements")
    .select("*")
    .eq("profile_id", profileId)
    .order("recorded_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data.map(mapMeasurement);
};

const mapGoals = (row: Record<string, unknown>): ProfileMeasurementGoals => ({
  profile_id: row.profile_id as string,
  weight_lbs: num(row.weight_lbs),
  body_fat_pct: num(row.body_fat_pct),
  neck_in: num(row.neck_in),
  shoulders_in: num(row.shoulders_in),
  chest_in: num(row.chest_in),
  waist_in: num(row.waist_in),
  hips_in: num(row.hips_in),
  glutes_in: num(row.glutes_in),
  biceps_left_in: num(row.biceps_left_in),
  biceps_right_in: num(row.biceps_right_in),
  forearm_left_in: num(row.forearm_left_in),
  forearm_right_in: num(row.forearm_right_in),
  wrist_in: num(row.wrist_in),
  thigh_left_in: num(row.thigh_left_in),
  thigh_right_in: num(row.thigh_right_in),
  calf_left_in: num(row.calf_left_in),
  calf_right_in: num(row.calf_right_in),
  ankle_in: num(row.ankle_in),
  show_progress_on_profile: row.show_progress_on_profile !== false,
  updated_at: (row.updated_at as string) ?? new Date().toISOString(),
});

export const getMeasurementGoalsForProfile = async (profileId: string): Promise<ProfileMeasurementGoals | null> => {
  if (!hasSupabase) {
    return demoMeasurementGoals.find((g) => g.profile_id === profileId) ?? null;
  }

  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase
    .from("profile_measurement_goals")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error || !data) return null;
  return mapGoals(data);
};

export const upsertMeasurementGoalsForProfile = async (
  profileId: string,
  snapshot: Record<string, number | null | boolean>,
): Promise<ProfileMeasurementGoals> => {
  if (!hasSupabase) {
    return upsertDemoMeasurementGoals(profileId, snapshot);
  }

  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase
    .from("profile_measurement_goals")
    .upsert(
      {
        profile_id: profileId,
        ...snapshot,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "profile_id" },
    )
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to save goals");
  }

  return mapGoals(data);
};

export const goalsRecordToSnapshot = (
  goals: ProfileMeasurementGoals | null,
): Partial<Record<GoalTrackableFieldKey, number | null>> => {
  if (!goals) return {};
  return profileGoalsFromRow(goals as unknown as Record<string, unknown>);
};

export const getTrainerAssignmentsForTrainer = async (
  trainerProfileId: string,
  gymId: string,
): Promise<(TrainerAssignment & { client: Profile })[]> => {
  if (!hasSupabase) {
    return demoTrainerAssignments
      .filter((a) => a.trainer_profile_id === trainerProfileId && a.active)
      .map((a) => {
        const client = demoProfiles.find((p) => p.id === a.client_profile_id)!;
        return { ...a, client };
      });
  }

  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase
    .from("trainer_assignments")
    .select("*, client:profiles!trainer_assignments_client_profile_id_fkey(*)")
    .eq("trainer_profile_id", trainerProfileId)
    .eq("gym_id", gymId)
    .eq("active", true);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    gym_id: row.gym_id,
    trainer_profile_id: row.trainer_profile_id,
    client_profile_id: row.client_profile_id,
    active: row.active,
    assigned_by: row.assigned_by,
    assigned_at: row.assigned_at,
    client: mapProfile(row.client as Record<string, unknown>),
  }));
};

export const getTrainerNotesForClient = async (
  gymId: string,
  clientProfileId: string,
): Promise<(TrainerNote & { trainer_name: string })[]> => {
  if (!hasSupabase) {
    return demoTrainerNotes
      .filter((n) => n.client_profile_id === clientProfileId)
      .map((n) => ({
        ...n,
        trainer_name: demoProfiles.find((p) => p.id === n.trainer_profile_id)?.display_name ?? "Trainer",
      }));
  }

  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase
    .from("trainer_notes")
    .select("*, trainer:profiles!trainer_notes_trainer_profile_id_fkey(display_name)")
    .eq("gym_id", gymId)
    .eq("client_profile_id", clientProfileId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    gym_id: row.gym_id,
    trainer_profile_id: row.trainer_profile_id,
    client_profile_id: row.client_profile_id,
    body: row.body,
    visible_to_client: row.visible_to_client,
    created_at: row.created_at,
    trainer_name: (row.trainer as { display_name: string } | null)?.display_name ?? "Trainer",
  }));
};

export const upsertProfileFromClerk = async (input: {
  clerkUserId: string;
  displayName: string;
  avatarUrl: string | null;
  isNew: boolean;
}) => {
  const supabase = createServiceClient();
  const config = getGymConfig();
  const gymId = await getGymIdBySlug(config.slug);

  const { data: profile, error } = await supabase
    .from("profiles")
    .upsert(
      {
        clerk_user_id: input.clerkUserId,
        display_name: input.displayName,
        avatar_url: input.avatarUrl,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "clerk_user_id" },
    )
    .select("*")
    .single();

  if (error || !profile) {
    throw new Error(error?.message ?? "Failed to upsert profile");
  }

  if (gymId) {
    await supabase.from("gym_memberships").upsert(
      {
        gym_id: gymId,
        profile_id: profile.id,
        role: "user",
      },
      { onConflict: "gym_id,profile_id", ignoreDuplicates: true },
    );

    await logAdminAuditEvent({
      gymId,
      actor: systemActor(),
      action: input.isNew ? ADMIN_AUDIT_ACTIONS.SYSTEM_PROFILE_UPSERT : ADMIN_AUDIT_ACTIONS.SYSTEM_PROFILE_UPSERT,
      resourceType: "profiles",
      resourceId: profile.id as string,
      summary: input.isNew
        ? `Clerk created profile: ${input.displayName}`
        : `Clerk updated profile: ${input.displayName}`,
      metadata: { clerkUserId: input.clerkUserId, isNew: input.isNew },
    });
  }

  return mapProfile(profile);
};

export const deleteProfileFromClerk = async (clerkUserId: string): Promise<void> => {
  const supabase = createServiceClient();
  const config = getGymConfig();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, gym_memberships(gym_id)")
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle();

  const gymIds = new Set<string>();
  const configGymId = await getGymIdBySlug(config.slug);
  if (configGymId) gymIds.add(configGymId);

  const memberships = profile?.gym_memberships;
  if (Array.isArray(memberships)) {
    for (const row of memberships) {
      const gymId = (row as { gym_id: string }).gym_id;
      if (gymId) gymIds.add(gymId);
    }
  }

  const { error } = await supabase.from("profiles").delete().eq("clerk_user_id", clerkUserId);
  if (error) {
    throw new Error(error.message);
  }

  if (gymIds.size === 0) {
    console.error("[profiles] Clerk profile deleted with no gym_id for audit:", clerkUserId);
    return;
  }

  const resourceId = (profile?.id as string | undefined) ?? clerkUserId;

  await Promise.all(
    [...gymIds].map((gymId) =>
      logAdminAuditEvent({
        gymId,
        actor: systemActor(),
        action: ADMIN_AUDIT_ACTIONS.SYSTEM_PROFILE_DELETE,
        resourceType: "profiles",
        resourceId,
        summary: "Clerk deleted user profile",
        metadata: { clerkUserId },
      }),
    ),
  );
};

export const ensureGymMembershipForProfile = async (
  profileId: string,
): Promise<{ gymId: string; role: GymMembership["role"] } | null> => {
  if (!hasSupabase) {
    const demo = getDemoMembership(profileId);
    if (!demo) return null;
    return { gymId: demo.gym_id, role: demo.role };
  }

  const config = getGymConfig();
  const gymId = await getGymIdBySlug(config.slug);
  if (!gymId) return null;

  const existing = await getMembershipForProfile(profileId, gymId);
  if (existing) {
    return { gymId, role: existing.role };
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("gym_memberships").upsert(
    {
      gym_id: gymId,
      profile_id: profileId,
      role: "user",
    },
    { onConflict: "gym_id,profile_id", ignoreDuplicates: true },
  );

  if (error) {
    throw new Error(error.message);
  }

  return { gymId, role: "user" };
};

export const computeMeasurementDeltas = (
  previous: Profile | ProfileMeasurement | null,
  current: Partial<Record<MeasurementFieldKey, number | null>>,
): MeasurementDeltas => {
  const deltas: MeasurementDeltas = {};

  for (const field of MEASUREMENT_FIELD_KEYS) {
    const prevVal =
      previous && field in previous ? ((previous as unknown as Record<string, number | null>)[field] ?? null) : null;
    const nextVal = current[field] ?? null;
    if (prevVal != null && nextVal != null && prevVal !== nextVal) {
      deltas[field] = Number((nextVal - prevVal).toFixed(2));
    }
  }

  return deltas;
};
