-- Create a "teams" table
create table teams (
  id serial primary key,
  owner_id uuid references auth.users not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a "team_members" table to link users to teams
create table team_members (
  team_id integer references teams(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  primary key (team_id, user_id)
);

-- RLS policies for teams
alter table teams enable row level security;
create policy "Individuals can create their own teams." on teams for
  insert with check (auth.uid() = owner_id);
create policy "Individuals can view their own teams." on teams for
  select using (auth.uid() = owner_id);
create policy "Team owners can update their own teams." on teams for
  update using (auth.uid() = owner_id);
create policy "Team owners can delete their own teams." on teams for
  delete using (auth.uid() = owner_id);

-- RLS policies for team_members
alter table team_members enable row level security;
create policy "Team members can view their own team membership." on team_members for
  select using (auth.uid() = user_id);
-- A more complex policy would be needed to let owners see all members.
-- For now, let's allow team owners to manage members.
create policy "Team owners can manage team members." on team_members for
  all using (
    auth.uid() in (
      select owner_id from teams where id = team_id
    )
  );

-- Function to handle new team creation and owner insertion
create function public.create_team(name text)
returns teams
language plpgsql
as $$
declare
  new_team teams;
begin
  -- Create the new team
  insert into public.teams (name, owner_id)
  values (name, auth.uid())
  returning * into new_team;

  -- Add the owner as a member of the team
  insert into public.team_members (team_id, user_id)
  values (new_team.id, auth.uid());
  
  return new_team;
end;
$$; 