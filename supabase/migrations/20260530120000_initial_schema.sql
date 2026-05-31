-- Gym platform initial schema
create extension if not exists "pgcrypto";

create type membership_role as enum ('member', 'staff', 'admin');
create type pr_status as enum ('pending', 'approved', 'rejected', 'flagged');
create type competition_status as enum ('draft', 'open', 'closed', 'completed');
create type post_type as enum ('pr', 'progress', 'win', 'general');
create type reaction_type as enum ('pump_up', 'respect', 'beast_mode');
create type gender_division as enum ('open', 'male', 'female', 'non_binary');
create type scoring_method as enum ('best_single', 'wilks', 'total', 'points');
create type homepage_section_type as enum (
  'hero', 'cta', 'hours', 'location', 'membership', 'gallery', 'announcements'
);

create table gyms (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  tagline text,
  phone text,
  email text,
  address_line1 text,
  city text,
  state text,
  zip text,
  timezone text not null default 'America/Chicago',
  created_at timestamptz not null default now()
);

create table gym_branding (
  gym_id uuid primary key references gyms(id) on delete cascade,
  logo_url text,
  theme jsonb not null default '{}'::jsonb,
  labels jsonb not null default '{}'::jsonb,
  feature_flags jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table gym_pages (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references gyms(id) on delete cascade,
  slug text not null,
  title text not null,
  is_published boolean not null default true,
  unique (gym_id, slug)
);

create table gym_page_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references gym_pages(id) on delete cascade,
  section_key text not null,
  section_type homepage_section_type not null,
  sort_order int not null default 0,
  enabled boolean not null default true,
  props jsonb not null default '{}'::jsonb,
  unique (page_id, section_key)
);

create table profiles (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,
  display_name text not null,
  username text unique,
  avatar_url text,
  bio text,
  bodyweight_lbs numeric,
  gender_division gender_division not null default 'open',
  created_at timestamptz not null default now()
);

create table gym_memberships (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references gyms(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  role membership_role not null default 'member',
  joined_at timestamptz not null default now(),
  unique (gym_id, profile_id)
);

create table machines (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references gyms(id) on delete cascade,
  name text not null,
  slug text not null,
  category text not null default 'general',
  description text,
  is_active boolean not null default true,
  unique (gym_id, slug)
);

create table lifts (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references gyms(id) on delete cascade,
  name text not null,
  slug text not null,
  category text not null default 'general',
  unit text not null default 'lbs',
  is_active boolean not null default true,
  unique (gym_id, slug)
);

create table pr_submissions (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references gyms(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  machine_id uuid references machines(id) on delete set null,
  lift_id uuid references lifts(id) on delete set null,
  value numeric not null check (value > 0),
  unit text not null default 'lbs',
  bodyweight_lbs numeric,
  gender_division gender_division not null default 'open',
  notes text,
  status pr_status not null default 'pending',
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  submitted_at timestamptz not null default now(),
  check (machine_id is not null or lift_id is not null)
);

create table pr_records (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references gyms(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  machine_id uuid references machines(id) on delete set null,
  lift_id uuid references lifts(id) on delete set null,
  best_value numeric not null,
  unit text not null default 'lbs',
  bodyweight_lbs numeric,
  gender_division gender_division not null default 'open',
  pr_submission_id uuid references pr_submissions(id),
  achieved_at timestamptz not null default now(),
  unique nulls not distinct (gym_id, profile_id, machine_id, lift_id, gender_division)
);

create table posts (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references gyms(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  post_type post_type not null default 'general',
  content text not null,
  pr_submission_id uuid references pr_submissions(id) on delete set null,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create table post_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  reaction reaction_type not null,
  created_at timestamptz not null default now(),
  unique (post_id, profile_id, reaction)
);

create table badges (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid references gyms(id) on delete cascade,
  code text not null,
  name text not null,
  description text,
  icon text,
  unique (gym_id, code)
);

create table member_badges (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  badge_id uuid not null references badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique (profile_id, badge_id)
);

create table competitions (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references gyms(id) on delete cascade,
  title text not null,
  slug text not null,
  description text,
  status competition_status not null default 'draft',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  rules_summary text,
  scoring_method scoring_method not null default 'best_single',
  unique (gym_id, slug)
);

create table competition_divisions (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references competitions(id) on delete cascade,
  name text not null,
  gender_division gender_division not null default 'open',
  bodyweight_min numeric,
  bodyweight_max numeric
);

create table competition_rules (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references competitions(id) on delete cascade,
  rule_text text not null,
  sort_order int not null default 0
);

create table competition_registrations (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references competitions(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  division_id uuid references competition_divisions(id),
  registered_at timestamptz not null default now(),
  unique (competition_id, profile_id)
);

create table competition_results (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references competitions(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  division_id uuid references competition_divisions(id),
  score numeric not null,
  placement int,
  notes text
);

-- Leaderboard view
create or replace view leaderboard_entries as
select
  pr.gym_id,
  pr.profile_id,
  p.display_name,
  coalesce(m.name, l.name) as target_name,
  pr.machine_id,
  pr.lift_id,
  pr.best_value as value,
  pr.unit,
  pr.bodyweight_lbs,
  pr.gender_division,
  pr.achieved_at,
  rank() over (
    partition by pr.gym_id, pr.machine_id, pr.lift_id, pr.gender_division
    order by pr.best_value desc, pr.achieved_at asc
  ) as rank
from pr_records pr
join profiles p on p.id = pr.profile_id
left join machines m on m.id = pr.machine_id
left join lifts l on l.id = pr.lift_id;

alter table gyms enable row level security;
alter table gym_branding enable row level security;
alter table gym_pages enable row level security;
alter table gym_page_sections enable row level security;
alter table profiles enable row level security;
alter table gym_memberships enable row level security;
alter table machines enable row level security;
alter table lifts enable row level security;
alter table pr_submissions enable row level security;
alter table pr_records enable row level security;
alter table posts enable row level security;
alter table post_reactions enable row level security;
alter table badges enable row level security;
alter table member_badges enable row level security;
alter table competitions enable row level security;
alter table competition_divisions enable row level security;
alter table competition_rules enable row level security;
alter table competition_registrations enable row level security;
alter table competition_results enable row level security;

-- Public read policies (anon + authenticated)
create policy "Public read gyms" on gyms for select using (true);
create policy "Public read branding" on gym_branding for select using (true);
create policy "Public read pages" on gym_pages for select using (is_published = true);
create policy "Public read sections" on gym_page_sections for select using (enabled = true);
create policy "Public read machines" on machines for select using (is_active = true);
create policy "Public read lifts" on lifts for select using (is_active = true);
create policy "Public read competitions" on competitions for select using (status in ('open', 'closed', 'completed'));
create policy "Public read pr records" on pr_records for select using (true);
create policy "Public read posts" on posts for select using (is_hidden = false);
create policy "Public read badges" on badges for select using (true);

-- Profiles: users read all display fields, update own (via service role in MVP webhook sync)
create policy "Read profiles" on profiles for select using (true);

-- Authenticated members can insert own PRs and posts (Clerk JWT sub matched in app layer for MVP)
create policy "Insert pr submissions" on pr_submissions for insert with check (true);
create policy "Read pr submissions" on pr_submissions for select using (true);
create policy "Insert posts" on posts for insert with check (true);
create policy "Insert reactions" on post_reactions for insert with check (true);
create policy "Read reactions" on post_reactions for select using (true);

-- Staff policies use service role in server actions for MVP; tighten with JWT claims later

create index idx_pr_submissions_gym_status on pr_submissions(gym_id, status);
create index idx_pr_records_gym on pr_records(gym_id, machine_id, lift_id);
create index idx_posts_gym_created on posts(gym_id, created_at desc);
create index idx_competitions_gym_status on competitions(gym_id, status);
