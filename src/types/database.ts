export type MembershipRole = "user" | "personal_trainer" | "employee" | "manager" | "owner";

export type ProfileVisibility = "private" | "trainer" | "public";

export type PrStatus = "pending" | "approved" | "rejected" | "flagged";
export type CompetitionStatus = "draft" | "open" | "closed" | "completed";
export type PostType = "pr" | "progress" | "win" | "general";
export type ReactionType = "pump_up" | "respect" | "beast_mode";
export type GenderDivision = "open" | "male" | "female" | "non_binary";
export type ScoringMethod = "best_single" | "wilks" | "total" | "points";
export type ContactInquiryTopic = "membership" | "training" | "billing" | "feedback" | "other";
export type ContactInquiryStatus = "new" | "read" | "archived";

export type PricingBillingInterval = "day" | "week" | "month" | "year" | "one_time" | "custom";

export type GymPricingPlanRow = {
  id: string;
  gym_id: string;
  sort_order: number;
  enabled: boolean;
  name: string;
  tagline: string;
  description: string;
  price_display: string;
  price_cents: number | null;
  compare_at_display: string;
  billing_interval: PricingBillingInterval;
  duration_label: string;
  features: string[];
  image_url: string;
  badge: string;
  is_featured: boolean;
  cta_label: string;
  cta_href: string;
  created_at: string;
  updated_at: string;
};

export type ContactInquiry = {
  id: string;
  gym_id: string;
  profile_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  topic: ContactInquiryTopic;
  message: string;
  status: ContactInquiryStatus;
  read_at: string | null;
  email_sent_at: string | null;
  email_error: string | null;
  created_at: string;
};

export type Profile = {
  id: string;
  clerk_user_id: string;
  display_name: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  bodyweight_lbs: number | null;
  height_in: number | null;
  chest_in: number | null;
  waist_in: number | null;
  hips_in: number | null;
  neck_in: number | null;
  shoulders_in: number | null;
  glutes_in: number | null;
  biceps_left_in: number | null;
  biceps_right_in: number | null;
  forearm_left_in: number | null;
  forearm_right_in: number | null;
  wrist_in: number | null;
  thigh_left_in: number | null;
  thigh_right_in: number | null;
  calf_left_in: number | null;
  calf_right_in: number | null;
  ankle_in: number | null;
  body_fat_pct: number | null;
  gender_division: GenderDivision;
  visibility: ProfileVisibility;
  created_at: string;
  updated_at: string;
};

export type ProfileMeasurement = {
  id: string;
  profile_id: string;
  recorded_at: string;
  height_in: number | null;
  weight_lbs: number | null;
  gender_division: GenderDivision;
  chest_in: number | null;
  waist_in: number | null;
  hips_in: number | null;
  neck_in: number | null;
  shoulders_in: number | null;
  glutes_in: number | null;
  biceps_left_in: number | null;
  biceps_right_in: number | null;
  forearm_left_in: number | null;
  forearm_right_in: number | null;
  wrist_in: number | null;
  thigh_left_in: number | null;
  thigh_right_in: number | null;
  calf_left_in: number | null;
  calf_right_in: number | null;
  ankle_in: number | null;
  body_fat_pct: number | null;
  notes: string | null;
  source: string;
  created_at: string;
};

export type ProfileMeasurementGoals = {
  profile_id: string;
  weight_lbs: number | null;
  body_fat_pct: number | null;
  neck_in: number | null;
  shoulders_in: number | null;
  chest_in: number | null;
  waist_in: number | null;
  hips_in: number | null;
  glutes_in: number | null;
  biceps_left_in: number | null;
  biceps_right_in: number | null;
  forearm_left_in: number | null;
  forearm_right_in: number | null;
  wrist_in: number | null;
  thigh_left_in: number | null;
  thigh_right_in: number | null;
  calf_left_in: number | null;
  calf_right_in: number | null;
  ankle_in: number | null;
  show_progress_on_profile: boolean;
  updated_at: string;
};

export type MeasurementGoalSnapshot = Partial<
  Record<
    | "weight_lbs"
    | "body_fat_pct"
    | "neck_in"
    | "shoulders_in"
    | "chest_in"
    | "waist_in"
    | "hips_in"
    | "glutes_in"
    | "biceps_left_in"
    | "biceps_right_in"
    | "forearm_left_in"
    | "forearm_right_in"
    | "wrist_in"
    | "thigh_left_in"
    | "thigh_right_in"
    | "calf_left_in"
    | "calf_right_in"
    | "ankle_in",
    number | null
  >
>;

export type TrainerAssignment = {
  id: string;
  gym_id: string;
  trainer_profile_id: string;
  client_profile_id: string;
  active: boolean;
  assigned_by: string | null;
  assigned_at: string;
};

export type TrainerNote = {
  id: string;
  gym_id: string;
  trainer_profile_id: string;
  client_profile_id: string;
  body: string;
  visible_to_client: boolean;
  created_at: string;
};

export type BodyProgressMetadata = {
  kind: "body_progress";
  snapshot_id: string;
  deltas: Record<string, number>;
  shared_fields: string[];
};

export type GymMembership = {
  id: string;
  gym_id: string;
  profile_id: string;
  role: MembershipRole;
  joined_at: string;
};

export type Gym = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  phone: string | null;
  email: string | null;
  address_line1: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  timezone: string;
  created_at: string;
};

export type Machine = {
  id: string;
  gym_id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  is_active: boolean;
};

export type Lift = {
  id: string;
  gym_id: string;
  name: string;
  slug: string;
  category: string;
  unit: string;
  is_active: boolean;
};

export type PrSubmission = {
  id: string;
  gym_id: string;
  profile_id: string;
  machine_id: string | null;
  lift_id: string | null;
  value: number;
  unit: string;
  bodyweight_lbs: number | null;
  gender_division: GenderDivision;
  notes: string | null;
  status: PrStatus;
  submitted_at: string;
};

export type Competition = {
  id: string;
  gym_id: string;
  title: string;
  slug: string;
  description: string | null;
  status: CompetitionStatus;
  starts_at: string;
  ends_at: string;
  rules_summary: string | null;
  scoring_method: ScoringMethod;
};

export type Post = {
  id: string;
  gym_id: string;
  profile_id: string;
  post_type: PostType;
  content: string;
  pr_submission_id: string | null;
  metadata: BodyProgressMetadata | Record<string, unknown>;
  created_at: string;
};

export type AuditChange = {
  field: string;
  old: unknown;
  new: unknown;
};

export type AuditMetadata = {
  changes?: AuditChange[];
  [key: string]: unknown;
};

export type AuditEventRow = {
  id: string;
  gym_id: string;
  created_at: string;
  actor_profile_id: string | null;
  actor_role: MembershipRole | null;
  actor_display_name: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  summary: string;
  metadata: AuditMetadata;
};

export const USER_AUDIT_ACTIONS = {
  PROFILE_FITNESS_UPDATE: "profile.fitness.update",
  PROFILE_GOALS_UPDATE: "profile.goals.update",
  PROFILE_PRIVACY_UPDATE: "profile.privacy.update",
  POST_PROGRESS_CREATE: "post.progress.create",
  PR_SUBMIT: "pr.submit",
} as const;

export const ADMIN_AUDIT_ACTIONS = {
  CMS_BRAND_UPDATE: "cms.brand.update",
  CMS_BUSINESS_UPDATE: "cms.business.update",
  CMS_MEDIA_UPDATE: "cms.media.update",
  CMS_NAV_UPDATE: "cms.nav.update",
  CMS_FEATURES_UPDATE: "cms.features.update",
  CMS_HOMEPAGE_SECTIONS_SAVE: "cms.homepage.sections.save",
  CMS_CONTACT_PAGE_UPDATE: "cms.contact.page.update",
  CMS_PRICING_PAGE_UPDATE: "cms.pricing.page.update",
  CMS_PRICING_PLANS_SAVE: "cms.pricing.plans.save",
  CMS_HERO_UPDATE: "cms.hero.update",
  STORAGE_ASSET_UPLOAD: "storage.asset.upload",
  STORAGE_ASSET_RENAME: "storage.asset.rename",
  TRAINER_NOTE_CREATE: "trainer.note.create",
  TRAINER_ASSIGN: "trainer.assign",
  EQUIPMENT_ADD: "equipment.add",
  COMPETITION_CREATE: "competition.create",
  PR_MODERATE: "pr.moderate",
  CONTACT_INQUIRY_RECEIVED: "contact.inquiry.received",
  CONTACT_INQUIRY_READ: "contact.inquiry.read",
  SYSTEM_PROFILE_UPSERT: "system.profile.upsert",
  SYSTEM_PROFILE_DELETE: "system.profile.delete",
} as const;

export type MeasurementDeltas = Partial<{
  height_in: number;
  weight_lbs: number;
  neck_in: number;
  shoulders_in: number;
  chest_in: number;
  waist_in: number;
  hips_in: number;
  glutes_in: number;
  biceps_left_in: number;
  biceps_right_in: number;
  forearm_left_in: number;
  forearm_right_in: number;
  wrist_in: number;
  thigh_left_in: number;
  thigh_right_in: number;
  calf_left_in: number;
  calf_right_in: number;
  ankle_in: number;
  body_fat_pct: number;
}>;
