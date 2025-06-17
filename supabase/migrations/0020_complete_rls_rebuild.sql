-- Complete RLS policy rebuild to eliminate infinite recursion

-- Disable RLS temporarily to clear all policies
alter table public.teams disable row level security;
alter table public.team_members disable row level security;

-- Drop ALL existing policies on both tables
drop policy if exists "Users can view teams they belong to" on teams;
drop policy if exists "Team members can view teams they belong to." on teams;
drop policy if exists "Team owners and admins can update teams." on teams;
drop policy if exists "Team owners and admins can delete teams." on teams;
drop policy if exists "Individuals can create their own teams." on teams;
drop policy if exists "Team owners can update their own teams." on teams;
drop policy if exists "Team owners can delete their own teams." on teams;

drop policy if exists "Users can view team memberships" on team_members;
drop policy if exists "Team owners can manage members" on team_members;
drop policy if exists "Admins can manage all team members" on team_members;
drop policy if exists "Team owners and admins can manage team members." on team_members;
drop policy if exists "Team members and admins can view team membership." on team_members;
drop policy if exists "Team members can view their own team membership." on team_members;
drop policy if exists "Team owners can manage team members." on team_members;

-- Re-enable RLS
alter table public.teams enable row level security;
alter table public.team_members enable row level security;

-- Create simple, non-recursive policies for teams
create policy "Anyone can view teams" on teams for select using (true);

create policy "Users can create teams" on teams for insert 
with check (auth.uid() = owner_id);

create policy "Owners can update teams" on teams for update 
using (auth.uid() = owner_id);

create policy "Owners can delete teams" on teams for delete 
using (auth.uid() = owner_id);

-- Create simple, non-recursive policies for team_members  
create policy "Anyone can view team members" on team_members for select using (true);

create policy "Team owners can add members" on team_members for insert
with check (
  auth.uid() in (
    select owner_id from teams where id = team_id
  )
);

create policy "Team owners can remove members" on team_members for delete
using (
  auth.uid() in (
    select owner_id from teams where id = team_id
  )
);

create policy "Users can remove themselves" on team_members for delete
using (auth.uid() = user_id); 