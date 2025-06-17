-- Drop the old, incorrect policy
drop policy if exists "Individuals can view their own teams." on public.teams;

-- Create the new, correct policy
create policy "Team members can view teams they belong to." on public.teams for
  select using (id in (select team_id from public.team_members where user_id = auth.uid())); 