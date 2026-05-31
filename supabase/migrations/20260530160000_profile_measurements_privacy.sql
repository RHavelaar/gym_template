-- Expanded body measurements (enum + RLS in follow-up migrations)

update profiles set visibility = 'private' where visibility = 'gym';

-- Expand profile snapshot columns
alter table profiles
  add column if not exists neck_in numeric,
  add column if not exists shoulders_in numeric,
  add column if not exists glutes_in numeric,
  add column if not exists biceps_left_in numeric,
  add column if not exists biceps_right_in numeric,
  add column if not exists forearm_left_in numeric,
  add column if not exists forearm_right_in numeric,
  add column if not exists wrist_in numeric,
  add column if not exists thigh_left_in numeric,
  add column if not exists thigh_right_in numeric,
  add column if not exists calf_left_in numeric,
  add column if not exists calf_right_in numeric,
  add column if not exists ankle_in numeric;

update profiles
set
  biceps_left_in = coalesce(biceps_left_in, biceps_in),
  biceps_right_in = coalesce(biceps_right_in, biceps_in),
  thigh_left_in = coalesce(thigh_left_in, thighs_in),
  thigh_right_in = coalesce(thigh_right_in, thighs_in)
where biceps_in is not null or thighs_in is not null;

alter table profiles
  drop column if exists biceps_in,
  drop column if exists thighs_in;

-- Expand measurement history columns
alter table profile_measurements
  add column if not exists neck_in numeric,
  add column if not exists shoulders_in numeric,
  add column if not exists glutes_in numeric,
  add column if not exists biceps_left_in numeric,
  add column if not exists biceps_right_in numeric,
  add column if not exists forearm_left_in numeric,
  add column if not exists forearm_right_in numeric,
  add column if not exists wrist_in numeric,
  add column if not exists thigh_left_in numeric,
  add column if not exists thigh_right_in numeric,
  add column if not exists calf_left_in numeric,
  add column if not exists calf_right_in numeric,
  add column if not exists ankle_in numeric;

update profile_measurements
set
  biceps_left_in = coalesce(biceps_left_in, biceps_in),
  biceps_right_in = coalesce(biceps_right_in, biceps_in),
  thigh_left_in = coalesce(thigh_left_in, thighs_in),
  thigh_right_in = coalesce(thigh_right_in, thighs_in)
where biceps_in is not null or thighs_in is not null;

alter table profile_measurements
  drop column if exists biceps_in,
  drop column if exists thighs_in;
