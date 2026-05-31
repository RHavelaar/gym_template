"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getGymConfig } from "@/config";
import {
  addDemoMeasurement,
  addDemoPost,
  addDemoTrainerAssignment,
  addDemoTrainerNote,
  DEMO_GYM_ID,
  demoProfiles,
  getDemoMembership,
  updateDemoProfile,
} from "@/lib/demo-data";
import { hasSupabase } from "@/lib/env";
import {
  computeMeasurementDeltas,
  getMeasurementHistory,
  getProfileById,
  upsertMeasurementGoalsForProfile,
} from "@/lib/profiles";
import { ALL_MEASUREMENT_FIELDS, MEASUREMENT_FIELD_LABELS } from "@/lib/measurements";
import { buildChangeSet, logAdminAuditEvent, logUserAuditEvent } from "@/lib/audit";
import { resolveAuditActor } from "@/lib/audit/resolve-actor";
import { requireManager, requireMember, requireTrainer } from "@/lib/rbac";
import { ADMIN_AUDIT_ACTIONS, USER_AUDIT_ACTIONS } from "@/types/database";
import { createClerkSupabaseClient } from "@/lib/supabase/clerk-server";
import { goalsInputToSnapshot, parseMeasurementGoalsFormData } from "@/lib/validation/goals";
import { fitnessProfileSchema, parseFitnessProfileFormData } from "@/lib/validation/profile";
import type { BodyProgressMetadata, GenderDivision, ProfileVisibility } from "@/types/database";

const privacySchema = z.object({
  visibility: z.enum(["private", "trainer", "public"]),
});

const trainerNoteSchema = z.object({
  clientProfileId: z.string().min(1),
  body: z.string().min(2).max(2000),
  visibleToClient: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v !== "false"),
});

const assignTrainerSchema = z.object({
  trainerProfileId: z.string().min(1),
  clientProfileId: z.string().min(1),
});

export type ProfileFormState = { ok: boolean; message: string; deltas?: Record<string, number> };

const measurementFieldLabels: Record<string, string> = {
  ...MEASUREMENT_FIELD_LABELS,
  weight_lbs: "weight",
};

const buildProgressMessage = (name: string, deltas: Record<string, number>, templates: string[]) => {
  const changes = Object.entries(deltas)
    .map(([key, delta]) => {
      const label = measurementFieldLabels[key] ?? key;
      const sign = delta > 0 ? "+" : "";
      return `${label} ${sign}${delta}${key.includes("pct") ? "%" : key.includes("lbs") ? " lbs" : key.includes("_in") ? '"' : ""}`;
    })
    .join(", ");

  const template =
    templates[Math.floor(Math.random() * templates.length)] ?? "Great work, {name}! {changes} — keep stacking wins.";

  return template.replace("{name}", name).replace("{changes}", changes);
};

const buildMeasurementSnapshot = (
  parsed: z.infer<typeof fitnessProfileSchema>,
  previousProfile: Awaited<ReturnType<typeof getProfileById>>,
) => {
  const fromFields = Object.fromEntries(
    ALL_MEASUREMENT_FIELDS.map((field) => {
      const parsedValue = parsed[field.formName as keyof typeof parsed] as number | undefined;
      const previousKey = field.key === "weight_lbs" ? "bodyweight_lbs" : field.key;
      const previousValue = previousProfile?.[previousKey as keyof NonNullable<typeof previousProfile>];
      return [field.key, parsedValue ?? (typeof previousValue === "number" ? previousValue : null)];
    }),
  );

  return {
    height_in: fromFields.height_in as number | null,
    weight_lbs: fromFields.weight_lbs as number | null,
    gender_division: parsed.genderDivision as GenderDivision,
    chest_in: fromFields.chest_in as number | null,
    waist_in: fromFields.waist_in as number | null,
    hips_in: fromFields.hips_in as number | null,
    neck_in: fromFields.neck_in as number | null,
    shoulders_in: fromFields.shoulders_in as number | null,
    glutes_in: fromFields.glutes_in as number | null,
    biceps_left_in: fromFields.biceps_left_in as number | null,
    biceps_right_in: fromFields.biceps_right_in as number | null,
    forearm_left_in: fromFields.forearm_left_in as number | null,
    forearm_right_in: fromFields.forearm_right_in as number | null,
    wrist_in: fromFields.wrist_in as number | null,
    thigh_left_in: fromFields.thigh_left_in as number | null,
    thigh_right_in: fromFields.thigh_right_in as number | null,
    calf_left_in: fromFields.calf_left_in as number | null,
    calf_right_in: fromFields.calf_right_in as number | null,
    ankle_in: fromFields.ankle_in as number | null,
    body_fat_pct: fromFields.body_fat_pct as number | null,
    notes: parsed.notes ?? null,
  };
};

const persistFitnessUpdate = async (
  profileId: string,
  gymId: string,
  parsed: z.infer<typeof fitnessProfileSchema>,
  previousProfile: Awaited<ReturnType<typeof getProfileById>>,
) => {
  const snapshot = buildMeasurementSnapshot(parsed, previousProfile);

  const history = await getMeasurementHistory(profileId, 1);
  const previous = history[0] ?? previousProfile;
  const deltas = computeMeasurementDeltas(previous, snapshot);

  if (!hasSupabase) {
    const measurement = addDemoMeasurement({
      id: `measure-${Date.now()}`,
      profile_id: profileId,
      recorded_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      source: "manual",
      ...snapshot,
    });

    updateDemoProfile(profileId, {
      display_name: parsed.displayName ?? previousProfile?.display_name,
      bio: parsed.bio ?? previousProfile?.bio ?? null,
      bodyweight_lbs: snapshot.weight_lbs,
      height_in: snapshot.height_in,
      chest_in: snapshot.chest_in,
      waist_in: snapshot.waist_in,
      hips_in: snapshot.hips_in,
      neck_in: snapshot.neck_in,
      shoulders_in: snapshot.shoulders_in,
      glutes_in: snapshot.glutes_in,
      biceps_left_in: snapshot.biceps_left_in,
      biceps_right_in: snapshot.biceps_right_in,
      forearm_left_in: snapshot.forearm_left_in,
      forearm_right_in: snapshot.forearm_right_in,
      wrist_in: snapshot.wrist_in,
      thigh_left_in: snapshot.thigh_left_in,
      thigh_right_in: snapshot.thigh_right_in,
      calf_left_in: snapshot.calf_left_in,
      calf_right_in: snapshot.calf_right_in,
      ankle_in: snapshot.ankle_in,
      body_fat_pct: snapshot.body_fat_pct,
      gender_division: snapshot.gender_division,
    });

    if (parsed.shareToFeed && Object.keys(deltas).length > 0) {
      const config = getGymConfig();
      const profile = demoProfiles.find((p) => p.id === profileId)!;
      addDemoPost({
        id: `post-${Date.now()}`,
        gym_id: gymId,
        profile_id: profileId,
        post_type: "progress",
        content: buildProgressMessage(profile.display_name, deltas, config.labels.progressCelebrations),
        pr_submission_id: null,
        metadata: {
          kind: "body_progress",
          snapshot_id: measurement.id,
          deltas,
          shared_fields: Object.keys(deltas),
        } satisfies BodyProgressMetadata,
        created_at: new Date().toISOString(),
      });
    }

    return { deltas, snapshotId: measurement.id };
  }

  const supabase = await createClerkSupabaseClient();

  const { data: measurement, error: measureError } = await supabase
    .from("profile_measurements")
    .insert({
      profile_id: profileId,
      ...snapshot,
      weight_lbs: snapshot.weight_lbs,
      source: "manual",
    })
    .select("*")
    .single();

  if (measureError || !measurement) {
    throw new Error(measureError?.message ?? "Failed to save measurement");
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.displayName ?? previousProfile?.display_name,
      bio: parsed.bio ?? previousProfile?.bio,
      bodyweight_lbs: snapshot.weight_lbs,
      height_in: snapshot.height_in,
      chest_in: snapshot.chest_in,
      waist_in: snapshot.waist_in,
      hips_in: snapshot.hips_in,
      neck_in: snapshot.neck_in,
      shoulders_in: snapshot.shoulders_in,
      glutes_in: snapshot.glutes_in,
      biceps_left_in: snapshot.biceps_left_in,
      biceps_right_in: snapshot.biceps_right_in,
      forearm_left_in: snapshot.forearm_left_in,
      forearm_right_in: snapshot.forearm_right_in,
      wrist_in: snapshot.wrist_in,
      thigh_left_in: snapshot.thigh_left_in,
      thigh_right_in: snapshot.thigh_right_in,
      calf_left_in: snapshot.calf_left_in,
      calf_right_in: snapshot.calf_right_in,
      ankle_in: snapshot.ankle_in,
      body_fat_pct: snapshot.body_fat_pct,
      gender_division: snapshot.gender_division,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profileId);

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (parsed.shareToFeed && Object.keys(deltas).length > 0) {
    const config = getGymConfig();
    const metadata: BodyProgressMetadata = {
      kind: "body_progress",
      snapshot_id: measurement.id,
      deltas,
      shared_fields: Object.keys(deltas),
    };

    await supabase.from("posts").insert({
      gym_id: gymId,
      profile_id: profileId,
      post_type: "progress",
      content: buildProgressMessage(
        parsed.displayName ?? previousProfile?.display_name ?? "Member",
        deltas,
        config.labels.progressCelebrations,
      ),
      metadata,
    });
  }

  return { deltas, snapshotId: measurement.id };
};

export const updateFitnessProfileAction = async (
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> => {
  try {
    const ctx = await requireMember();
    if (!ctx.profileId) {
      return { ok: false, message: "Profile not found." };
    }

    const parsed = parseFitnessProfileFormData(formData);

    if (!parsed.success) {
      return { ok: false, message: "Please check your entries and try again." };
    }

    const previousProfile = await getProfileById(ctx.profileId);
    const gymId = ctx.gymId ?? DEMO_GYM_ID;
    const { deltas } = await persistFitnessUpdate(ctx.profileId, gymId, parsed.data, previousProfile);

    const actor = await resolveAuditActor(ctx);
    const deltaCount = Object.keys(deltas).length;
    await logUserAuditEvent({
      gymId,
      actor,
      action: USER_AUDIT_ACTIONS.PROFILE_FITNESS_UPDATE,
      resourceType: "profiles",
      resourceId: ctx.profileId,
      summary:
        deltaCount > 0
          ? `Updated fitness profile (${deltaCount} measurement${deltaCount === 1 ? "" : "s"} changed)`
          : "Updated fitness profile",
      metadata: {
        changes: buildChangeSet(
          {
            display_name: previousProfile?.display_name,
            bio: previousProfile?.bio,
            visibility: previousProfile?.visibility,
          },
          {
            display_name: parsed.data.displayName,
            bio: parsed.data.bio,
          },
          ["display_name", "bio"],
        ),
        measurementDeltas: deltas,
        sharedToFeed: parsed.data.shareToFeed && deltaCount > 0,
      },
    });

    if (parsed.data.shareToFeed && deltaCount > 0) {
      await logUserAuditEvent({
        gymId,
        actor,
        action: USER_AUDIT_ACTIONS.POST_PROGRESS_CREATE,
        resourceType: "posts",
        resourceId: ctx.profileId,
        summary: "Shared body progress update to feed",
        metadata: { deltas },
      });
    }

    revalidatePath("/profile");
    revalidatePath("/feed");
    revalidatePath("/dashboard");
    revalidatePath("/trainer/clients");

    return {
      ok: true,
      message:
        deltaCount > 0
          ? `Profile updated! ${deltaCount} measurement${deltaCount === 1 ? "" : "s"} changed.`
          : "Profile saved.",
      deltas,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not save profile. Please try again.";
    if (process.env.NODE_ENV === "development") {
      console.error("[updateFitnessProfileAction]", err);
    }
    return {
      ok: false,
      message:
        message === "Gym membership unavailable"
          ? "Your gym is not set up yet. Ask an admin to finish onboarding."
          : message === "Profile not found"
            ? "Profile not found."
            : "Could not save profile. Please try again.",
    };
  }
};

export const updateMeasurementGoalsAction = async (
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> => {
  try {
    const ctx = await requireMember();
    if (!ctx.profileId) {
      return { ok: false, message: "Profile not found." };
    }

    const parsed = parseMeasurementGoalsFormData(formData);
    if (!parsed.success) {
      return { ok: false, message: "Please check your goal entries and try again." };
    }

    const goalsSnapshot = goalsInputToSnapshot(parsed.data);
    await upsertMeasurementGoalsForProfile(ctx.profileId, goalsSnapshot);

    const actor = await resolveAuditActor(ctx);
    const gymId = ctx.gymId ?? DEMO_GYM_ID;
    await logUserAuditEvent({
      gymId,
      actor,
      action: USER_AUDIT_ACTIONS.PROFILE_GOALS_UPDATE,
      resourceType: "profile_measurement_goals",
      resourceId: ctx.profileId,
      summary: "Updated measurement goals",
      metadata: { goalFields: Object.keys(goalsSnapshot) },
    });

    revalidatePath("/profile");

    return { ok: true, message: "Goals saved! We'll track your progress from here." };
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("[updateMeasurementGoalsAction]", err);
    }
    return { ok: false, message: "Could not save goals. Please try again." };
  }
};

export const updateProfilePrivacyAction = async (
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> => {
  try {
    const ctx = await requireMember();
    if (!ctx.profileId) {
      return { ok: false, message: "Profile not found." };
    }

    const parsed = privacySchema.safeParse({
      visibility: formData.get("visibility"),
    });

    if (!parsed.success) {
      return { ok: false, message: "Invalid privacy setting." };
    }

    const previousProfile = await getProfileById(ctx.profileId);
    const gymId = ctx.gymId ?? DEMO_GYM_ID;

    if (!hasSupabase) {
      updateDemoProfile(ctx.profileId, {
        visibility: parsed.data.visibility as ProfileVisibility,
      });
    } else {
      const supabase = await createClerkSupabaseClient();
      const { error } = await supabase
        .from("profiles")
        .update({
          visibility: parsed.data.visibility,
          updated_at: new Date().toISOString(),
        })
        .eq("id", ctx.profileId);

      if (error) throw new Error(error.message);
    }

    const actor = await resolveAuditActor(ctx);
    await logUserAuditEvent({
      gymId,
      actor,
      action: USER_AUDIT_ACTIONS.PROFILE_PRIVACY_UPDATE,
      resourceType: "profiles",
      resourceId: ctx.profileId,
      summary: `Changed profile visibility to ${parsed.data.visibility}`,
      metadata: {
        changes: buildChangeSet({ visibility: previousProfile?.visibility }, { visibility: parsed.data.visibility }, [
          "visibility",
        ]),
      },
    });

    revalidatePath("/profile");
    return { ok: true, message: "Privacy settings updated." };
  } catch {
    return { ok: false, message: "Could not update privacy settings." };
  }
};

export const addTrainerNoteAction = async (_prev: ProfileFormState, formData: FormData): Promise<ProfileFormState> => {
  try {
    const ctx = await requireTrainer();
    const parsed = trainerNoteSchema.safeParse({
      clientProfileId: formData.get("clientProfileId"),
      body: formData.get("body"),
      visibleToClient: formData.get("visibleToClient"),
    });

    if (!parsed.success) {
      return { ok: false, message: "Please enter a valid note." };
    }

    const gymId = ctx.gymId ?? DEMO_GYM_ID;

    if (!hasSupabase) {
      addDemoTrainerNote({
        id: `note-${Date.now()}`,
        gym_id: gymId,
        trainer_profile_id: ctx.profileId!,
        client_profile_id: parsed.data.clientProfileId,
        body: parsed.data.body,
        visible_to_client: parsed.data.visibleToClient,
        created_at: new Date().toISOString(),
      });
    } else {
      const supabase = await createClerkSupabaseClient();
      const { error } = await supabase.from("trainer_notes").insert({
        gym_id: gymId,
        trainer_profile_id: ctx.profileId,
        client_profile_id: parsed.data.clientProfileId,
        body: parsed.data.body,
        visible_to_client: parsed.data.visibleToClient,
      });

      if (error) throw new Error(error.message);
    }

    const actor = await resolveAuditActor(ctx);
    const clientProfile = await getProfileById(parsed.data.clientProfileId);
    await logAdminAuditEvent({
      gymId,
      actor,
      action: ADMIN_AUDIT_ACTIONS.TRAINER_NOTE_CREATE,
      resourceType: "trainer_notes",
      resourceId: parsed.data.clientProfileId,
      summary: `Added trainer note for ${clientProfile?.display_name ?? "client"}`,
      metadata: {
        visibleToClient: parsed.data.visibleToClient,
        bodyLength: parsed.data.body.length,
      },
    });

    revalidatePath("/trainer/clients");
    return { ok: true, message: "Note saved for client." };
  } catch {
    return { ok: false, message: "Could not save trainer note." };
  }
};

export const assignTrainerAction = async (_prev: ProfileFormState, formData: FormData): Promise<ProfileFormState> => {
  try {
    const ctx = await requireManager();
    const parsed = assignTrainerSchema.safeParse({
      trainerProfileId: formData.get("trainerProfileId"),
      clientProfileId: formData.get("clientProfileId"),
    });

    if (!parsed.success) {
      return { ok: false, message: "Select both trainer and client." };
    }

    if (parsed.data.trainerProfileId === parsed.data.clientProfileId) {
      return { ok: false, message: "Trainer and client must be different people." };
    }

    const gymId = ctx.gymId ?? DEMO_GYM_ID;

    if (!hasSupabase) {
      addDemoTrainerAssignment({
        id: `assign-${Date.now()}`,
        gym_id: gymId,
        trainer_profile_id: parsed.data.trainerProfileId,
        client_profile_id: parsed.data.clientProfileId,
        active: true,
        assigned_by: ctx.profileId,
        assigned_at: new Date().toISOString(),
      });
    } else {
      const supabase = await createClerkSupabaseClient();
      const { error } = await supabase.from("trainer_assignments").upsert(
        {
          gym_id: gymId,
          trainer_profile_id: parsed.data.trainerProfileId,
          client_profile_id: parsed.data.clientProfileId,
          active: true,
          assigned_by: ctx.profileId,
        },
        { onConflict: "gym_id,trainer_profile_id,client_profile_id" },
      );

      if (error) throw new Error(error.message);

      await supabase
        .from("gym_memberships")
        .update({ role: "personal_trainer" })
        .eq("gym_id", gymId)
        .eq("profile_id", parsed.data.trainerProfileId);
    }

    const actor = await resolveAuditActor(ctx);
    const trainerProfile = await getProfileById(parsed.data.trainerProfileId);
    const clientProfile = await getProfileById(parsed.data.clientProfileId);
    await logAdminAuditEvent({
      gymId,
      actor,
      action: ADMIN_AUDIT_ACTIONS.TRAINER_ASSIGN,
      resourceType: "trainer_assignments",
      resourceId: parsed.data.clientProfileId,
      summary: `Assigned ${trainerProfile?.display_name ?? "trainer"} to ${clientProfile?.display_name ?? "client"}`,
      metadata: {
        trainerProfileId: parsed.data.trainerProfileId,
        clientProfileId: parsed.data.clientProfileId,
      },
    });

    revalidatePath("/admin/trainers");
    revalidatePath("/trainer/clients");
    return { ok: true, message: "Trainer assigned successfully." };
  } catch {
    return { ok: false, message: "Could not assign trainer." };
  }
};

export const listGymProfilesForAdmin = async () => {
  await requireManager();
  if (!hasSupabase) {
    return demoProfiles.map((p) => ({
      id: p.id,
      display_name: p.display_name,
      role: getDemoMembership(p.id).role,
    }));
  }

  const ctx = await requireManager();
  const supabase = await createClerkSupabaseClient();
  const { data } = await supabase
    .from("gym_memberships")
    .select("role, profiles(id, display_name)")
    .eq("gym_id", ctx.gymId!);

  type MembershipProfile = { id: string; display_name: string };

  const asProfile = (value: unknown): MembershipProfile | null => {
    if (!value) return null;
    if (Array.isArray(value)) return asProfile(value[0]);
    if (typeof value === "object" && "id" in value && "display_name" in value) {
      return value as MembershipProfile;
    }
    return null;
  };

  return (
    data?.flatMap((row) => {
      const profile = asProfile(row.profiles);
      if (!profile) return [];
      return [
        {
          id: profile.id,
          display_name: profile.display_name,
          role: row.role,
        },
      ];
    }) ?? []
  );
};
