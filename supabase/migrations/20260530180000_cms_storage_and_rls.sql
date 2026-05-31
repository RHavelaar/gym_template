-- CMS content columns, owner RLS, and gym-assets storage

alter table gyms add column if not exists description text;

alter table gym_branding
  add column if not exists images jsonb not null default '{}'::jsonb,
  add column if not exists nav jsonb not null default '{}'::jsonb,
  add column if not exists business jsonb not null default '{}'::jsonb;

create or replace function app_private.is_gym_owner(p_gym_id uuid)
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
      and gm.role = 'owner'
  );
$$;

create or replace function app_private.is_gym_owner_by_slug(p_slug text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from gym_memberships gm
    join gyms g on g.id = gm.gym_id
    where g.slug = p_slug
      and gm.profile_id = app_private.current_profile_id()
      and gm.role = 'owner'
  );
$$;

-- Owner write policies for CMS tables
create policy "Owners update gyms"
  on gyms for update
  using (app_private.is_gym_owner(id))
  with check (app_private.is_gym_owner(id));

create policy "Owners insert branding"
  on gym_branding for insert
  with check (app_private.is_gym_owner(gym_id));

create policy "Owners update branding"
  on gym_branding for update
  using (app_private.is_gym_owner(gym_id))
  with check (app_private.is_gym_owner(gym_id));

create policy "Owners insert pages"
  on gym_pages for insert
  with check (app_private.is_gym_owner(gym_id));

create policy "Owners update pages"
  on gym_pages for update
  using (app_private.is_gym_owner(gym_id))
  with check (app_private.is_gym_owner(gym_id));

create policy "Owners delete pages"
  on gym_pages for delete
  using (app_private.is_gym_owner(gym_id));

create policy "Owners insert sections"
  on gym_page_sections for insert
  with check (
    app_private.is_gym_owner(
      (select gp.gym_id from gym_pages gp where gp.id = page_id)
    )
  );

create policy "Owners update sections"
  on gym_page_sections for update
  using (
    app_private.is_gym_owner(
      (select gp.gym_id from gym_pages gp where gp.id = page_id)
    )
  )
  with check (
    app_private.is_gym_owner(
      (select gp.gym_id from gym_pages gp where gp.id = page_id)
    )
  );

create policy "Owners delete sections"
  on gym_page_sections for delete
  using (
    app_private.is_gym_owner(
      (select gp.gym_id from gym_pages gp where gp.id = page_id)
    )
  );

-- Staff read all sections (including disabled) for admin preview
create policy "Staff read all sections"
  on gym_page_sections for select
  using (
    app_private.is_gym_manager_or_above(
      (select gp.gym_id from gym_pages gp where gp.id = page_id)
    )
  );

-- Supabase Storage: gym-assets bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gym-assets',
  'gym-assets',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public read gym assets"
  on storage.objects for select
  using (bucket_id = 'gym-assets');

create policy "Owners upload gym assets"
  on storage.objects for insert
  with check (
    bucket_id = 'gym-assets'
    and app_private.is_gym_owner_by_slug(split_part(name, '/', 1))
  );

create policy "Owners update gym assets"
  on storage.objects for update
  using (
    bucket_id = 'gym-assets'
    and app_private.is_gym_owner_by_slug(split_part(name, '/', 1))
  )
  with check (
    bucket_id = 'gym-assets'
    and app_private.is_gym_owner_by_slug(split_part(name, '/', 1))
  );

create policy "Owners delete gym assets"
  on storage.objects for delete
  using (
    bucket_id = 'gym-assets'
    and app_private.is_gym_owner_by_slug(split_part(name, '/', 1))
  );
