-- Public contact form submissions + owner/staff inbox (server writes via service role or RLS insert policy)

create type contact_inquiry_status as enum ('new', 'read', 'archived');
create type contact_inquiry_topic as enum ('membership', 'training', 'billing', 'feedback', 'other');

create table contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references gyms(id) on delete cascade,
  profile_id uuid references profiles(id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  topic contact_inquiry_topic not null default 'other',
  message text not null,
  status contact_inquiry_status not null default 'new',
  read_at timestamptz,
  email_sent_at timestamptz,
  email_error text,
  created_at timestamptz not null default now()
);

create index contact_inquiries_gym_status_created_idx
  on contact_inquiries (gym_id, status, created_at desc);

alter table contact_inquiries enable row level security;

-- Staff/owners read and update inbox items for their gym
create policy "Managers can view gym contact inquiries"
  on contact_inquiries for select
  using (app_private.is_gym_manager_or_above(gym_id));

create policy "Managers can update gym contact inquiries"
  on contact_inquiries for update
  using (app_private.is_gym_manager_or_above(gym_id))
  with check (app_private.is_gym_manager_or_above(gym_id));

-- Anonymous visitors cannot insert directly; server action uses service role.
