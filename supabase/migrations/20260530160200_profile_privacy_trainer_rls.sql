-- Privacy: owner, public, or assigned trainer when visibility allows (uses trainer enum)

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
      join trainer_assignments ta
        on ta.client_profile_id = p.id
      join gym_memberships gm
        on gm.profile_id = ta.trainer_profile_id
        and gm.gym_id = ta.gym_id
      where p.id = p_profile_id
        and p.visibility = 'trainer'
        and ta.trainer_profile_id = app_private.current_profile_id()
        and ta.active = true
        and gm.role = 'personal_trainer'
    );
$$;
