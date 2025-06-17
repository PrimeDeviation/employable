-- Create user roles system for admin access and permissions
do $$ begin
  create type user_role as enum ('user', 'admin', 'moderator');
exception
  when duplicate_object then null;
end $$;

-- Add role column to profiles table
do $$ begin
  alter table public.profiles add column role user_role default 'user';
exception
  when duplicate_column then null;
end $$;

-- Create index for efficient role-based queries
create index if not exists idx_profiles_role on public.profiles(role);

-- Create function to check if user is admin
create or replace function public.is_admin(user_id uuid default auth.uid())
returns boolean
language sql
security definer
as $$
  select exists (
    select 1 from public.profiles 
    where id = user_id and role = 'admin'
  );
$$;

-- Create function to check if user is admin or moderator
create or replace function public.is_admin_or_moderator(user_id uuid default auth.uid())
returns boolean
language sql
security definer
as $$
  select exists (
    select 1 from public.profiles 
    where id = user_id and role in ('admin', 'moderator')
  );
$$;

-- Update teams table to allow admins to view all teams
drop policy if exists "Team members can view teams they belong to." on teams;
create policy "Team members can view teams they belong to." on teams for
  select using (
    -- Team members can see their teams
    id in (select team_id from team_members where user_id = auth.uid())
    -- Admins can see all teams
    or public.is_admin()
  );

-- Allow admins to manage any team
drop policy if exists "Team owners can update their own teams." on teams;
create policy "Team owners and admins can update teams." on teams for
  update using (
    auth.uid() = owner_id 
    or public.is_admin()
  );

drop policy if exists "Team owners can delete their own teams." on teams;
create policy "Team owners and admins can delete teams." on teams for
  delete using (
    auth.uid() = owner_id 
    or public.is_admin()
  );

-- Allow admins to manage team membership
drop policy if exists "Team owners can manage team members." on team_members;
create policy "Team owners and admins can manage team members." on team_members for
  all using (
    auth.uid() in (
      select owner_id from teams where id = team_id
    )
    or public.is_admin()
  );

-- Allow admins to view all team memberships
drop policy if exists "Team members can view their own team membership." on team_members;
create policy "Team members and admins can view team membership." on team_members for
  select using (
    auth.uid() = user_id 
    or public.is_admin()
  );

-- Function to promote user to admin (can only be called by existing admin or first user)
create or replace function public.promote_to_admin(target_user_id uuid)
returns boolean
language plpgsql
security definer
as $$
declare
  admin_count integer;
begin
  -- Count existing admins
  select count(*) into admin_count from public.profiles where role = 'admin';
  
  -- If no admins exist (first user scenario) or current user is admin, allow promotion
  if admin_count = 0 or public.is_admin() then
    update public.profiles 
    set role = 'admin' 
    where id = target_user_id;
    
    return true;
  end if;
  
  return false;
end;
$$;

-- Function to get user role
create or replace function public.get_user_role(user_id uuid default auth.uid())
returns text
language sql
security definer
as $$
  select role::text from public.profiles where id = user_id;
$$;

-- Function to assign team ownership to user (admin function)
create or replace function public.assign_team_ownership(team_id integer, new_owner_id uuid)
returns boolean
language plpgsql
security definer
as $$
begin
  -- Only admins can reassign team ownership
  if not public.is_admin() then
    return false;
  end if;
  
  -- Update team owner
  update public.teams 
  set owner_id = new_owner_id 
  where id = team_id;
  
  -- Ensure new owner is a member of the team
  insert into public.team_members (team_id, user_id)
  values (team_id, new_owner_id)
  on conflict (team_id, user_id) do nothing;
  
  return true;
end;
$$;

-- Function to claim orphaned teams (admin function)
create or replace function public.claim_orphaned_teams(new_owner_id uuid)
returns integer
language plpgsql
security definer
as $$
declare
  claimed_count integer := 0;
  team_record record;
begin
  -- Only admins can claim orphaned teams
  if not public.is_admin() then
    return 0;
  end if;
  
  -- Find teams with owners that don't exist in profiles
  for team_record in 
    select t.id from public.teams t
    left join public.profiles p on t.owner_id = p.id
    where p.id is null
  loop
    -- Assign ownership to new owner
    update public.teams 
    set owner_id = new_owner_id 
    where id = team_record.id;
    
    -- Ensure new owner is a member
    insert into public.team_members (team_id, user_id)
    values (team_record.id, new_owner_id)
    on conflict (team_id, user_id) do nothing;
    
    claimed_count := claimed_count + 1;
  end loop;
  
  return claimed_count;
end;
$$; 