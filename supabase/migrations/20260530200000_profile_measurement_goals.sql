-- Target measurements per profile (all optional; height excluded — set once on profile)

create table profile_measurement_goals (
  profile_id uuid primary key references profiles(id) on delete cascade,
  weight_lbs numeric,
  body_fat_pct numeric,
  neck_in numeric,
  shoulders_in numeric,
  chest_in numeric,
  waist_in numeric,
  hips_in numeric,
  glutes_in numeric,
  biceps_left_in numeric,
  biceps_right_in numeric,
  forearm_left_in numeric,
  forearm_right_in numeric,
  wrist_in numeric,
  thigh_left_in numeric,
  thigh_right_in numeric,
  calf_left_in numeric,
  calf_right_in numeric,
  ankle_in numeric,
  show_progress_on_profile boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table profile_measurement_goals enable row level security;

create policy "Select goals with profile privacy"
  on profile_measurement_goals for select
  using (app_private.can_view_profile(profile_id));

create policy "Insert own goals"
  on profile_measurement_goals for insert
  with check (profile_id = app_private.current_profile_id());

create policy "Update own goals"
  on profile_measurement_goals for update
  using (profile_id = app_private.current_profile_id())
  with check (profile_id = app_private.current_profile_id());

create policy "Delete own goals"
  on profile_measurement_goals for delete
  using (profile_id = app_private.current_profile_id());
