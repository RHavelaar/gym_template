-- Public buckets serve files by URL without a broad SELECT policy.
-- Restrict listing to gym owners for their slug prefix only (media library admin).

drop policy if exists "Public read gym assets" on storage.objects;

create policy "Owners read gym assets"
  on storage.objects for select
  using (
    bucket_id = 'gym-assets'
    and app_private.is_gym_owner_by_slug(split_part(name, '/', 1))
  );
