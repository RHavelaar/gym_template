-- Contact & pricing CMS pages + membership plan cards

create type pricing_billing_interval as enum (
  'day',
  'week',
  'month',
  'year',
  'one_time',
  'custom'
);

alter table gym_pages
  add column if not exists settings jsonb not null default '{}'::jsonb;

create table gym_pricing_plans (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references gyms(id) on delete cascade,
  sort_order int not null default 0,
  enabled boolean not null default true,
  name text not null,
  tagline text not null default '',
  description text not null default '',
  price_display text not null,
  price_cents int,
  compare_at_display text not null default '',
  billing_interval pricing_billing_interval not null default 'month',
  duration_label text not null default '',
  features text[] not null default '{}',
  image_url text not null default '',
  badge text not null default '',
  is_featured boolean not null default false,
  cta_label text not null default 'Get started',
  cta_href text not null default '/sign-up',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index gym_pricing_plans_gym_sort_idx on gym_pricing_plans (gym_id, sort_order);

alter table gym_pricing_plans enable row level security;

create policy "Public read enabled pricing plans"
  on gym_pricing_plans for select
  using (enabled = true);

create policy "Owners insert pricing plans"
  on gym_pricing_plans for insert
  with check (app_private.is_gym_owner(gym_id));

create policy "Owners update pricing plans"
  on gym_pricing_plans for update
  using (app_private.is_gym_owner(gym_id))
  with check (app_private.is_gym_owner(gym_id));

create policy "Owners delete pricing plans"
  on gym_pricing_plans for delete
  using (app_private.is_gym_owner(gym_id));

create policy "Staff read all pricing plans"
  on gym_pricing_plans for select
  using (app_private.is_gym_manager_or_above(gym_id));
