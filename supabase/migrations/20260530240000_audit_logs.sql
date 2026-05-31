-- Append-only audit logs (user + admin streams), monthly partitions, owner read RLS.
-- Roll forward partitions monthly, e.g.:
--   CREATE TABLE gym_user_audit_events_2026_08 PARTITION OF gym_user_audit_events
--     FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');

-- ---------------------------------------------------------------------------
-- User activity audit
-- ---------------------------------------------------------------------------

create table gym_user_audit_events (
  id uuid not null default gen_random_uuid(),
  gym_id uuid not null references gyms(id) on delete cascade,
  created_at timestamptz not null default now(),
  actor_profile_id uuid references profiles(id) on delete set null,
  actor_role membership_role,
  actor_display_name text,
  action text not null,
  resource_type text not null,
  resource_id text,
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  primary key (id, created_at)
) partition by range (created_at);

create table gym_user_audit_events_default partition of gym_user_audit_events default;

create table gym_user_audit_events_2026_05 partition of gym_user_audit_events
  for values from ('2026-05-01') to ('2026-06-01');

create table gym_user_audit_events_2026_06 partition of gym_user_audit_events
  for values from ('2026-06-01') to ('2026-07-01');

create table gym_user_audit_events_2026_07 partition of gym_user_audit_events
  for values from ('2026-07-01') to ('2026-08-01');

create index gym_user_audit_events_gym_created_idx
  on gym_user_audit_events (gym_id, created_at desc, id desc);

create index gym_user_audit_events_gym_actor_idx
  on gym_user_audit_events (gym_id, actor_profile_id, created_at desc);

create index gym_user_audit_events_gym_action_idx
  on gym_user_audit_events (gym_id, action, created_at desc);

alter table gym_user_audit_events enable row level security;

create policy "Owners read user audit"
  on gym_user_audit_events for select
  using (app_private.is_gym_owner(gym_id));

-- ---------------------------------------------------------------------------
-- Admin / staff / site activity audit
-- ---------------------------------------------------------------------------

create table gym_admin_audit_events (
  id uuid not null default gen_random_uuid(),
  gym_id uuid not null references gyms(id) on delete cascade,
  created_at timestamptz not null default now(),
  actor_profile_id uuid references profiles(id) on delete set null,
  actor_role membership_role,
  actor_display_name text,
  action text not null,
  resource_type text not null,
  resource_id text,
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  primary key (id, created_at)
) partition by range (created_at);

create table gym_admin_audit_events_default partition of gym_admin_audit_events default;

create table gym_admin_audit_events_2026_05 partition of gym_admin_audit_events
  for values from ('2026-05-01') to ('2026-06-01');

create table gym_admin_audit_events_2026_06 partition of gym_admin_audit_events
  for values from ('2026-06-01') to ('2026-07-01');

create table gym_admin_audit_events_2026_07 partition of gym_admin_audit_events
  for values from ('2026-07-01') to ('2026-08-01');

create index gym_admin_audit_events_gym_created_idx
  on gym_admin_audit_events (gym_id, created_at desc, id desc);

create index gym_admin_audit_events_gym_actor_idx
  on gym_admin_audit_events (gym_id, actor_profile_id, created_at desc);

create index gym_admin_audit_events_gym_action_idx
  on gym_admin_audit_events (gym_id, action, created_at desc);

alter table gym_admin_audit_events enable row level security;

create policy "Owners read admin audit"
  on gym_admin_audit_events for select
  using (app_private.is_gym_owner(gym_id));
