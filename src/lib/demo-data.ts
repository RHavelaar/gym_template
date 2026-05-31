import type {
  Competition,
  Lift,
  Machine,
  MembershipRole,
  Post,
  PrSubmission,
  Profile,
  ProfileMeasurement,
  ProfileMeasurementGoals,
  TrainerAssignment,
  TrainerNote,
} from "@/types/database";
import { getGymConfig } from "@/config";

const gym = getGymConfig();

export const DEMO_GYM_ID = "gym-iron-asylum";

const now = new Date();
const weekAgo = new Date(now.getTime() - 7 * 86400000);
const twoWeeksAgo = new Date(now.getTime() - 14 * 86400000);

const emptyMeasurements = {
  neck_in: null,
  shoulders_in: null,
  glutes_in: null,
  biceps_left_in: null,
  biceps_right_in: null,
  forearm_left_in: null,
  forearm_right_in: null,
  wrist_in: null,
  thigh_left_in: null,
  thigh_right_in: null,
  calf_left_in: null,
  calf_right_in: null,
  ankle_in: null,
};

export const demoProfiles: Profile[] = [
  {
    id: "profile-1",
    clerk_user_id: "demo-admin",
    display_name: "Coach Rex",
    username: "coachrex",
    avatar_url: null,
    bio: "Head coach",
    gender_division: "male",
    visibility: "public",
    created_at: twoWeeksAgo.toISOString(),
    updated_at: now.toISOString(),
    ...emptyMeasurements,
    bodyweight_lbs: 220,
    height_in: 72,
    chest_in: 48,
    waist_in: 36,
    hips_in: 40,
    biceps_left_in: 17,
    biceps_right_in: 17.25,
    thigh_left_in: 28,
    thigh_right_in: 28,
    body_fat_pct: 18,
    neck_in: 16.5,
    shoulders_in: 52,
  },
  {
    id: "profile-2",
    clerk_user_id: "demo-member",
    display_name: "Jordan Steel",
    username: "jsteel",
    avatar_url: null,
    bio: "Powerlifter",
    gender_division: "male",
    visibility: "trainer",
    created_at: twoWeeksAgo.toISOString(),
    updated_at: now.toISOString(),
    ...emptyMeasurements,
    bodyweight_lbs: 194,
    height_in: 70,
    chest_in: 44,
    waist_in: 34,
    hips_in: 38,
    biceps_left_in: 16,
    biceps_right_in: 16,
    thigh_left_in: 26,
    thigh_right_in: 26.5,
    body_fat_pct: 15,
    neck_in: 15.5,
    shoulders_in: 48,
    forearm_left_in: 13,
    forearm_right_in: 13.25,
  },
  {
    id: "profile-3",
    clerk_user_id: "demo-trainer",
    display_name: "Sam Vega",
    username: "samvega",
    avatar_url: null,
    bio: "Personal trainer — strength & conditioning",
    gender_division: "female",
    visibility: "private",
    created_at: twoWeeksAgo.toISOString(),
    updated_at: now.toISOString(),
    ...emptyMeasurements,
    bodyweight_lbs: 185,
    height_in: 69,
    chest_in: 42,
    waist_in: 32,
    hips_in: 37,
    biceps_left_in: 15.5,
    biceps_right_in: 15.5,
    thigh_left_in: 25,
    thigh_right_in: 25,
    body_fat_pct: 12,
    neck_in: 14,
    shoulders_in: 44,
  },
];

export const demoMeasurements: ProfileMeasurement[] = [
  {
    id: "measure-1",
    profile_id: "profile-2",
    recorded_at: twoWeeksAgo.toISOString(),
    gender_division: "male",
    notes: "Starting baseline",
    source: "manual",
    created_at: twoWeeksAgo.toISOString(),
    ...emptyMeasurements,
    height_in: 70,
    weight_lbs: 198,
    chest_in: 43,
    waist_in: 35,
    hips_in: 38,
    biceps_left_in: 15.5,
    biceps_right_in: 15.5,
    thigh_left_in: 25,
    thigh_right_in: 25,
    body_fat_pct: 16,
    neck_in: 15.5,
    shoulders_in: 47,
  },
  {
    id: "measure-2",
    profile_id: "profile-2",
    recorded_at: weekAgo.toISOString(),
    gender_division: "male",
    notes: "Cutting phase week 1",
    source: "manual",
    created_at: weekAgo.toISOString(),
    ...emptyMeasurements,
    height_in: 70,
    weight_lbs: 196,
    chest_in: 43.5,
    waist_in: 34.5,
    hips_in: 38,
    biceps_left_in: 15.75,
    biceps_right_in: 16,
    thigh_left_in: 25.5,
    thigh_right_in: 25.5,
    body_fat_pct: 15.5,
    neck_in: 15.5,
    shoulders_in: 47.5,
  },
  {
    id: "measure-3",
    profile_id: "profile-2",
    recorded_at: now.toISOString(),
    gender_division: "male",
    notes: "Feeling strong — PR week!",
    source: "manual",
    created_at: now.toISOString(),
    ...emptyMeasurements,
    height_in: 70,
    weight_lbs: 194,
    chest_in: 44,
    waist_in: 34,
    hips_in: 38,
    biceps_left_in: 16,
    biceps_right_in: 16,
    thigh_left_in: 26,
    thigh_right_in: 26.5,
    body_fat_pct: 15,
    neck_in: 15.5,
    shoulders_in: 48,
    forearm_left_in: 13,
    forearm_right_in: 13.25,
  },
];

export const demoMeasurementGoals: ProfileMeasurementGoals[] = [
  {
    profile_id: "profile-2",
    weight_lbs: 185,
    body_fat_pct: 12,
    neck_in: null,
    shoulders_in: 50,
    chest_in: 46,
    waist_in: 32,
    hips_in: null,
    glutes_in: null,
    biceps_left_in: 17,
    biceps_right_in: 17,
    forearm_left_in: null,
    forearm_right_in: null,
    wrist_in: null,
    thigh_left_in: 28,
    thigh_right_in: 28,
    calf_left_in: null,
    calf_right_in: null,
    ankle_in: null,
    show_progress_on_profile: true,
    updated_at: now.toISOString(),
  },
];

export const demoTrainerAssignments: TrainerAssignment[] = [
  {
    id: "assign-1",
    gym_id: DEMO_GYM_ID,
    trainer_profile_id: "profile-3",
    client_profile_id: "profile-2",
    active: true,
    assigned_by: "profile-1",
    assigned_at: weekAgo.toISOString(),
  },
];

export const demoTrainerNotes: TrainerNote[] = [
  {
    id: "note-1",
    gym_id: DEMO_GYM_ID,
    trainer_profile_id: "profile-3",
    client_profile_id: "profile-2",
    body: "Great progress on waist measurement — keep protein high on training days.",
    visible_to_client: true,
    created_at: weekAgo.toISOString(),
  },
];

export const demoMachines: Machine[] = [
  {
    id: "machine-leg-press",
    gym_id: DEMO_GYM_ID,
    name: "Hammer Strength Leg Press",
    slug: "leg-press",
    category: "legs",
    description: "Plate-loaded leg press",
    is_active: true,
  },
  {
    id: "machine-hack-squat",
    gym_id: DEMO_GYM_ID,
    name: "Hack Squat",
    slug: "hack-squat",
    category: "legs",
    description: null,
    is_active: true,
  },
];

export const demoLifts: Lift[] = [
  {
    id: "lift-squat",
    gym_id: DEMO_GYM_ID,
    name: "Back Squat",
    slug: "back-squat",
    category: "powerlifting",
    unit: "lbs",
    is_active: true,
  },
  {
    id: "lift-bench",
    gym_id: DEMO_GYM_ID,
    name: "Bench Press",
    slug: "bench-press",
    category: "powerlifting",
    unit: "lbs",
    is_active: true,
  },
  {
    id: "lift-deadlift",
    gym_id: DEMO_GYM_ID,
    name: "Deadlift",
    slug: "deadlift",
    category: "powerlifting",
    unit: "lbs",
    is_active: true,
  },
];

export const demoPrSubmissions: PrSubmission[] = [
  {
    id: "pr-1",
    gym_id: DEMO_GYM_ID,
    profile_id: "profile-2",
    machine_id: "machine-leg-press",
    lift_id: null,
    value: 820,
    unit: "lbs",
    bodyweight_lbs: 198,
    gender_division: "male",
    notes: "Deep reps, no half reps.",
    status: "approved",
    submitted_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "pr-2",
    gym_id: DEMO_GYM_ID,
    profile_id: "profile-2",
    machine_id: null,
    lift_id: "lift-deadlift",
    value: 525,
    unit: "lbs",
    bodyweight_lbs: 198,
    gender_division: "male",
    notes: null,
    status: "pending",
    submitted_at: new Date().toISOString(),
  },
];

export const demoCompetitions: Competition[] = [
  {
    id: "comp-1",
    gym_id: DEMO_GYM_ID,
    title: "March PR Board Challenge",
    slug: "march-pr-board",
    description: "Top PRs on selected machines win merch and bragging rights.",
    status: "open",
    starts_at: new Date().toISOString(),
    ends_at: new Date(Date.now() + 14 * 86400000).toISOString(),
    rules_summary: "Submit PRs on leg press or hack squat. Best single wins per division.",
    scoring_method: "best_single",
  },
];

export const demoPosts: Post[] = [
  {
    id: "post-1",
    gym_id: DEMO_GYM_ID,
    profile_id: "profile-2",
    post_type: "pr",
    content: "New leg press PR — 820! Thanks for the pump up crew.",
    pr_submission_id: "pr-1",
    metadata: {},
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "post-2",
    gym_id: DEMO_GYM_ID,
    profile_id: "profile-2",
    post_type: "progress",
    content: "Crushing it, Jordan! Down 4 lbs and waist tightened up — keep stacking wins.",
    pr_submission_id: null,
    metadata: {
      kind: "body_progress",
      snapshot_id: "measure-3",
      deltas: { weight_lbs: -2, waist_in: -0.5, body_fat_pct: -0.5 },
      shared_fields: ["weight_lbs", "waist_in", "body_fat_pct"],
    },
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
];

export const getDemoProfile = (clerkUserId: string) =>
  demoProfiles.find((p) => p.clerk_user_id === clerkUserId) ??
  demoProfiles.find((p) => p.clerk_user_id === "demo-member");

export const getDemoMembership = (profileId: string) => {
  const roleByProfile: Record<string, MembershipRole> = {
    "profile-1": "manager",
    "profile-2": "user",
    "profile-3": "personal_trainer",
  };
  return {
    gym_id: DEMO_GYM_ID,
    profile_id: profileId,
    role: roleByProfile[profileId] ?? "user",
  };
};

export const getLeaderboardRows = () => {
  const approved = demoPrSubmissions.filter((p) => p.status === "approved");
  return approved.map((pr, index) => {
    const profile = demoProfiles.find((p) => p.id === pr.profile_id);
    const machine = demoMachines.find((m) => m.id === pr.machine_id);
    const lift = demoLifts.find((l) => l.id === pr.lift_id);
    return {
      rank: index + 1,
      profileName: profile?.display_name ?? "Unknown",
      targetName: machine?.name ?? lift?.name ?? "PR",
      value: pr.value,
      unit: pr.unit,
      bodyweight: pr.bodyweight_lbs,
      division: pr.gender_division,
      date: pr.submitted_at,
    };
  });
};

export const getGymDisplayName = () => gym.name;

export const updateDemoProfile = (profileId: string, updates: Partial<Profile>) => {
  const idx = demoProfiles.findIndex((p) => p.id === profileId);
  if (idx === -1) return null;
  demoProfiles[idx] = {
    ...demoProfiles[idx],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  return demoProfiles[idx];
};

export const addDemoMeasurement = (measurement: ProfileMeasurement) => {
  demoMeasurements.unshift(measurement);
  return measurement;
};

export const upsertDemoMeasurementGoals = (
  profileId: string,
  snapshot: Record<string, number | null | boolean>,
): ProfileMeasurementGoals => {
  const existing = demoMeasurementGoals.find((g) => g.profile_id === profileId);
  const row: ProfileMeasurementGoals = {
    profile_id: profileId,
    weight_lbs: (snapshot.weight_lbs as number | null) ?? null,
    body_fat_pct: (snapshot.body_fat_pct as number | null) ?? null,
    neck_in: (snapshot.neck_in as number | null) ?? null,
    shoulders_in: (snapshot.shoulders_in as number | null) ?? null,
    chest_in: (snapshot.chest_in as number | null) ?? null,
    waist_in: (snapshot.waist_in as number | null) ?? null,
    hips_in: (snapshot.hips_in as number | null) ?? null,
    glutes_in: (snapshot.glutes_in as number | null) ?? null,
    biceps_left_in: (snapshot.biceps_left_in as number | null) ?? null,
    biceps_right_in: (snapshot.biceps_right_in as number | null) ?? null,
    forearm_left_in: (snapshot.forearm_left_in as number | null) ?? null,
    forearm_right_in: (snapshot.forearm_right_in as number | null) ?? null,
    wrist_in: (snapshot.wrist_in as number | null) ?? null,
    thigh_left_in: (snapshot.thigh_left_in as number | null) ?? null,
    thigh_right_in: (snapshot.thigh_right_in as number | null) ?? null,
    calf_left_in: (snapshot.calf_left_in as number | null) ?? null,
    calf_right_in: (snapshot.calf_right_in as number | null) ?? null,
    ankle_in: (snapshot.ankle_in as number | null) ?? null,
    show_progress_on_profile: snapshot.show_progress_on_profile !== false,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    Object.assign(existing, row);
    return existing;
  }

  demoMeasurementGoals.push(row);
  return row;
};

export const addDemoPost = (post: Post) => {
  demoPosts.unshift(post);
  return post;
};

export const addDemoTrainerNote = (note: TrainerNote) => {
  demoTrainerNotes.unshift(note);
  return note;
};

export const addDemoTrainerAssignment = (assignment: TrainerAssignment) => {
  const existing = demoTrainerAssignments.findIndex(
    (a) =>
      a.gym_id === assignment.gym_id &&
      a.trainer_profile_id === assignment.trainer_profile_id &&
      a.client_profile_id === assignment.client_profile_id,
  );
  if (existing >= 0) {
    demoTrainerAssignments[existing] = assignment;
    return demoTrainerAssignments[existing];
  }
  demoTrainerAssignments.push(assignment);
  return assignment;
};
