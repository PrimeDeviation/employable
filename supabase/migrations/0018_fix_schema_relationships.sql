-- Fix schema relationships and missing columns

-- Add missing created_at column to profiles if it doesn't exist
do $$ begin
  alter table public.profiles add column created_at timestamp with time zone default timezone('utc'::text, now());
exception
  when duplicate_column then null;
end $$;

-- Ensure foreign key constraint exists for teams.owner_id -> profiles.id
do $$ begin
  alter table public.teams 
  add constraint teams_owner_id_fkey 
  foreign key (owner_id) references public.profiles(id) on delete cascade;
exception
  when duplicate_object then null;
end $$;

-- Fix any missing profiles for existing users
insert into public.profiles (id, username, created_at)
select 
  u.id,
  u.email,
  u.created_at
from auth.users u
where not exists (
  select 1 from public.profiles p where p.id = u.id
)
on conflict (id) do nothing;

-- Fix any orphaned teams (teams with owner_id that doesn't exist in profiles)
update public.teams 
set owner_id = (
  select id from public.profiles limit 1
)
where owner_id not in (
  select id from public.profiles
) and exists (
  select 1 from public.profiles limit 1
);

-- Ensure all team owners are also team members
insert into public.team_members (team_id, user_id)
select t.id, t.owner_id
from public.teams t
where not exists (
  select 1 from public.team_members tm 
  where tm.team_id = t.id and tm.user_id = t.owner_id
)
on conflict (team_id, user_id) do nothing; 