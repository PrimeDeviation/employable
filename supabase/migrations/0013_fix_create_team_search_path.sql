-- Correct the search_path for the create_team function to enhance security
create or replace function public.create_team(name text)
returns teams
language plpgsql
security definer
set search_path = public
as $$
declare
  new_team teams;
begin
  -- Create the new team
  insert into public.teams (name, owner_id)
  values (name, auth.uid())
  returning * into new_team;

  -- Add the owner as a member of the team if they aren't already
  insert into public.team_members (team_id, user_id)
  values (new_team.id, auth.uid())
  on conflict (team_id, user_id) do nothing;
  
  return new_team;
end;
$$; 