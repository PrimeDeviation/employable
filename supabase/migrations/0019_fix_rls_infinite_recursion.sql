-- Fix infinite recursion in RLS policies

-- Drop and recreate team_members policies to fix infinite recursion
drop policy if exists "Team owners and admins can manage team members." on team_members;
drop policy if exists "Team members and admins can view team membership." on team_members;

-- Simple, non-recursive policies for team_members
create policy "Users can view team memberships" on team_members for
  select using (true);

create policy "Team owners can manage members" on team_members for
  all using (
    exists (
      select 1 from teams 
      where teams.id = team_members.team_id 
      and teams.owner_id = auth.uid()
    )
  );

create policy "Admins can manage all team members" on team_members for
  all using (
    exists (
      select 1 from profiles 
      where profiles.id = auth.uid() 
      and profiles.role = 'admin'
    )
  );

-- Fix teams policies to avoid recursion
drop policy if exists "Team members can view teams they belong to." on teams;

create policy "Users can view teams they belong to" on teams for
  select using (
    owner_id = auth.uid()
    or exists (
      select 1 from team_members tm 
      where tm.team_id = teams.id 
      and tm.user_id = auth.uid()
    )
    or exists (
      select 1 from profiles 
      where profiles.id = auth.uid() 
      and profiles.role = 'admin'
    )
  );

-- Refresh schema cache by updating a comment
comment on table teams is 'Teams table - updated to refresh schema cache';
comment on table profiles is 'Profiles table - updated to refresh schema cache'; 