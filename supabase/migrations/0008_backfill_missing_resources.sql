-- Backfill resources for any existing profiles that are missing one.
-- This ensures that all users have a corresponding resource entry.
insert into public.resources (profile_id, name, role, location, skills)
select
  p.id as profile_id,
  coalesce(p.full_name, p.username, u.email) as name,
  'Consultant' as role,
  'Remote' as location,
  '{}' as skills
from
  public.profiles p
  join auth.users u on p.id = u.id -- Join to get email as a fallback for name
where
  not exists (
    select 1
    from public.resources r
    where r.profile_id = p.id
  ); 