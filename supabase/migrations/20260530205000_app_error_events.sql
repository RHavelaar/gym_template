-- App error events: user-facing error log for owner review
create table public.app_error_events (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  error_code text not null,
  message text not null,
  detail text,
  source text not null check (source in ('client', 'server_action', 'api', 'boundary')),
  route text,
  user_agent text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index app_error_events_gym_created_idx
  on public.app_error_events (gym_id, created_at desc);

create index app_error_events_code_idx
  on public.app_error_events (gym_id, error_code);

alter table public.app_error_events enable row level security;

-- INSERT: authenticated gym members can report errors
create policy "Members can report errors for their gym"
  on public.app_error_events for insert
  with check (
    exists (
      select 1
      from public.gym_memberships gm
      where gm.gym_id = app_error_events.gym_id
        and gm.profile_id = app_private.current_profile_id()
    )
    or app_private.is_gym_owner(app_error_events.gym_id)
  );

-- SELECT: owner only
create policy "Owners can view gym error log"
  on public.app_error_events for select
  using (app_private.is_gym_owner(gym_id));
