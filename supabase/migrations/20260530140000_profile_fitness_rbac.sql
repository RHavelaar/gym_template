-- Fitness profiles, expanded RBAC, trainer access, and privacy

create type profile_visibility as enum ('private', 'gym', 'public');

create type membership_role_v2 as enum (
  'user',
  'personal_trainer',
  'employee',
  'manager',
  'owner'
);

-- Migrate gym_memberships.role to new enum
alter table gym_memberships
  alter column role drop default;

alter table gym_memberships
  alter column role type membership_role_v2
  using (
    case role::text
      when 'member' then 'user'
      when 'staff' then 'employee'
      when 'admin' then 'manager'
      else 'user'
    end
  )::membership_role_v2;

alter table gym_memberships
  alter column role set default 'user';

drop type membership_role;

alter type membership_role_v2 rename to membership_role;

-- Extend profiles with fitness snapshot + privacy
alter table profiles
  add column height_in numeric,
  add column chest_in numeric,
  add column waist_in numeric,
  add column hips_in numeric,
  add column biceps_in numeric,
  add column thighs_in numeric,
  add column body_fat_pct numeric,
  add column visibility profile_visibility not null default 'private',
  add column updated_at timestamptz not null default now();

-- Measurement history (append-only check-ins)
create table profile_measurements (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  recorded_at timestamptz not null default now(),
  height_in numeric,
  weight_lbs numeric,
  gender_division gender_division not null default 'open',
  chest_in numeric,
  waist_in numeric,
  hips_in numeric,
  biceps_in numeric,
  thighs_in numeric,
  body_fat_pct numeric,
  notes text,
  source text not null default 'manual',
  created_at timestamptz not null default now()
);

create index idx_profile_measurements_profile_recorded
  on profile_measurements(profile_id, recorded_at desc);

-- Trainer-client relationships
create table trainer_assignments (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references gyms(id) on delete cascade,
  trainer_profile_id uuid not null references profiles(id) on delete cascade,
  client_profile_id uuid not null references profiles(id) on delete cascade,
  active boolean not null default true,
  assigned_by uuid references profiles(id) on delete set null,
  assigned_at timestamptz not null default now(),
  unique (gym_id, trainer_profile_id, client_profile_id),
  check (trainer_profile_id <> client_profile_id)
);

create index idx_trainer_assignments_trainer
  on trainer_assignments(gym_id, trainer_profile_id)
  where active = true;

create index idx_trainer_assignments_client
  on trainer_assignments(gym_id, client_profile_id)
  where active = true;

-- Trainer notes on client progress
create table trainer_notes (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references gyms(id) on delete cascade,
  trainer_profile_id uuid not null references profiles(id) on delete cascade,
  client_profile_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  visible_to_client boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_trainer_notes_client
  on trainer_notes(gym_id, client_profile_id, created_at desc);

-- Feed progress metadata
alter table posts
  add column metadata jsonb not null default '{}'::jsonb;

-- Private schema for security definer helpers
create schema if not exists app_private;

create or replace function app_private.current_clerk_user_id()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(auth.jwt() ->> 'sub', '');
$$;

create or replace function app_private.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from profiles
  where clerk_user_id = app_private.current_clerk_user_id()
  limit 1;
$$;

create or replace function app_private.is_gym_manager_or_above(p_gym_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from gym_memberships gm
    where gm.gym_id = p_gym_id
      and gm.profile_id = app_private.current_profile_id()
      and gm.role in ('employee', 'manager', 'owner')
  );
$$;

create or replace function app_private.is_active_trainer_for_client(
  p_gym_id uuid,
  p_client_profile_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from trainer_assignments ta
    join gym_memberships gm
      on gm.profile_id = ta.trainer_profile_id
      and gm.gym_id = ta.gym_id
    where ta.gym_id = p_gym_id
      and ta.client_profile_id = p_client_profile_id
      and ta.trainer_profile_id = app_private.current_profile_id()
      and ta.active = true
      and gm.role = 'personal_trainer'
  );
$$;

create or replace function app_private.can_view_profile(p_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    p_profile_id = app_private.current_profile_id()
    or exists (
      select 1
      from profiles p
      where p.id = p_profile_id
        and p.visibility = 'public'
    )
    or exists (
      select 1
      from profiles p
      join gym_memberships viewer_gm
        on viewer_gm.profile_id = app_private.current_profile_id()
      join gym_memberships target_gm
        on target_gm.profile_id = p_profile_id
        and target_gm.gym_id = viewer_gm.gym_id
      where p.id = p_profile_id
        and p.visibility = 'gym'
        and app_private.current_clerk_user_id() <> ''
    )
    or exists (
      select 1
      from gym_memberships viewer_gm
      join gym_memberships target_gm
        on target_gm.profile_id = p_profile_id
        and target_gm.gym_id = viewer_gm.gym_id
      where viewer_gm.profile_id = app_private.current_profile_id()
        and viewer_gm.role in ('manager', 'owner')
    )
    or exists (
      select 1
      from trainer_assignments ta
      join gym_memberships gm
        on gm.profile_id = ta.trainer_profile_id
        and gm.gym_id = ta.gym_id
      where ta.client_profile_id = p_profile_id
        and ta.trainer_profile_id = app_private.current_profile_id()
        and ta.active = true
        and gm.role = 'personal_trainer'
    );
$$;

-- Drop old permissive profile read policy
drop policy if exists "Read profiles" on profiles;

create policy "Select profiles with privacy"
  on profiles for select
  using (app_private.can_view_profile(id));

create policy "Update own profile"
  on profiles for update
  using (id = app_private.current_profile_id())
  with check (id = app_private.current_profile_id());

create policy "Insert own profile"
  on profiles for insert
  with check (clerk_user_id = app_private.current_clerk_user_id());

-- Measurement history
alter table profile_measurements enable row level security;

create policy "Select measurements with privacy"
  on profile_measurements for select
  using (app_private.can_view_profile(profile_id));

create policy "Insert own measurements"
  on profile_measurements for insert
  with check (profile_id = app_private.current_profile_id());

-- Trainer assignments
alter table trainer_assignments enable row level security;

create policy "Trainers read own assignments"
  on trainer_assignments for select
  using (
    trainer_profile_id = app_private.current_profile_id()
    or client_profile_id = app_private.current_profile_id()
    or app_private.is_gym_manager_or_above(gym_id)
  );

create policy "Managers manage trainer assignments"
  on trainer_assignments for insert
  with check (app_private.is_gym_manager_or_above(gym_id));

create policy "Managers update trainer assignments"
  on trainer_assignments for update
  using (app_private.is_gym_manager_or_above(gym_id))
  with check (app_private.is_gym_manager_or_above(gym_id));

-- Trainer notes
alter table trainer_notes enable row level security;

create policy "Select trainer notes"
  on trainer_notes for select
  using (
    app_private.is_gym_manager_or_above(gym_id)
    or (
      trainer_profile_id = app_private.current_profile_id()
      and app_private.is_active_trainer_for_client(gym_id, client_profile_id)
    )
    or (
      client_profile_id = app_private.current_profile_id()
      and visible_to_client = true
    )
  );

create policy "Trainers insert notes for assigned clients"
  on trainer_notes for insert
  with check (
    trainer_profile_id = app_private.current_profile_id()
    and (
      app_private.is_active_trainer_for_client(gym_id, client_profile_id)
      or app_private.is_gym_manager_or_above(gym_id)
    )
  );

-- Gym memberships: users read own; managers read gym roster
create policy "Read own membership"
  on gym_memberships for select
  using (
    profile_id = app_private.current_profile_id()
    or app_private.is_gym_manager_or_above(gym_id)
  );

create policy "Managers update memberships"
  on gym_memberships for update
  using (app_private.is_gym_manager_or_above(gym_id))
  with check (app_private.is_gym_manager_or_above(gym_id));

create policy "Managers insert memberships"
  on gym_memberships for insert
  with check (app_private.is_gym_manager_or_above(gym_id));
