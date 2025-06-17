-- Enable RLS on profiles if not enabled, prerequisite for team_members FK
do $$
begin
  if not exists (
    select 1 from pg_tables where schemaname = 'public' and tablename = 'profiles' and rowsecurity = 't'
  ) then
    alter table public.profiles enable row level security;
  end if;
end $$;

-- Create a "teams" table
create table if not exists teams (
  id serial primary key,
  owner_id uuid references auth.users not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a "team_members" table to link users to teams
create table if not exists team_members (
  team_id integer references teams(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  primary key (team_id, user_id)
);

-- RLS policies for teams
-- Enable RLS on teams if not enabled
do $$
begin
  if not exists (
    select 1 from pg_tables where schemaname = 'public' and tablename = 'teams' and rowsecurity = 't'
  ) then
    alter table teams enable row level security;
  end if;
end $$;

drop policy if exists "Individuals can create their own teams." on teams;
create policy "Individuals can create their own teams." on teams for
  insert with check (auth.uid() = owner_id);

drop policy if exists "Individuals can view their own teams." on teams;
drop policy if exists "Team members can view teams they belong to." on teams;
create policy "Team members can view teams they belong to." on teams for
  select using (id in (select team_id from team_members where user_id = auth.uid()));

drop policy if exists "Team owners can update their own teams." on teams;
create policy "Team owners can update their own teams." on teams for
  update using (auth.uid() = owner_id);

drop policy if exists "Team owners can delete their own teams." on teams;
create policy "Team owners can delete their own teams." on teams for
  delete using (auth.uid() = owner_id);

-- RLS policies for team_members
-- Enable RLS on team_members if not enabled
do $$
begin
  if not exists (
    select 1 from pg_tables where schemaname = 'public' and tablename = 'team_members' and rowsecurity = 't'
  ) then
    alter table team_members enable row level security;
  end if;
end $$;

drop policy if exists "Team members can view their own team membership." on team_members;
create policy "Team members can view their own team membership." on team_members for
  select using (auth.uid() = user_id);

drop policy if exists "Team owners can manage team members." on team_members;
create policy "Team owners can manage team members." on team_members for
  all using (
    auth.uid() in (
      select owner_id from teams where id = team_id
    )
  );

-- Function to handle new team creation and owner insertion
create or replace function public.create_team(name text)
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

  -- Add the owner as a member of the team if they aren't already
  insert into public.team_members (team_id, user_id)
  values (new_team.id, auth.uid())
  on conflict (team_id, user_id) do nothing;
  
  return new_team;
end;
$$; 