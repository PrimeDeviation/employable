-- Create team_invitations table
create table if not exists team_invitations (
  id uuid primary key default gen_random_uuid(),
  team_id integer references teams(id) on delete cascade not null,
  inviter_id uuid references auth.users not null,
  invitee_email text not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'expired')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone default (timezone('utc'::text, now()) + interval '7 days') not null,
  accepted_at timestamp with time zone,
  declined_at timestamp with time zone
);

-- Enable RLS on team_invitations
alter table team_invitations enable row level security;

-- RLS policies for team_invitations
create policy "Team owners can create invitations" on team_invitations for
  insert with check (
    auth.uid() in (
      select owner_id from teams where id = team_id
    )
  );

create policy "Team owners can view their team invitations" on team_invitations for
  select using (
    auth.uid() in (
      select owner_id from teams where id = team_id
    )
  );

create policy "Users can view invitations sent to their email" on team_invitations for
  select using (
    invitee_email = (
      select email from auth.users where id = auth.uid()
    )
  );

create policy "Team owners can update their team invitations" on team_invitations for
  update using (
    auth.uid() in (
      select owner_id from teams where id = team_id
    )
  );

create policy "Users can update invitations sent to their email" on team_invitations for
  update using (
    invitee_email = (
      select email from auth.users where id = auth.uid()
    )
  );

-- Function to create team invitation
create or replace function public.create_team_invitation(
  p_team_id integer,
  p_invitee_email text
)
returns team_invitations
language plpgsql
security definer
as $$
declare
  invitation team_invitations;
begin
  -- Check if user is team owner
  if not exists (
    select 1 from teams where id = p_team_id and owner_id = auth.uid()
  ) then
    raise exception 'Only team owners can create invitations';
  end if;

  -- Check if invitation already exists
  if exists (
    select 1 from team_invitations 
    where team_id = p_team_id 
    and invitee_email = p_invitee_email 
    and status = 'pending'
  ) then
    raise exception 'Invitation already exists for this email';
  end if;

  -- Check if user is already a member
  if exists (
    select 1 from team_members tm
    join profiles p on p.id = tm.user_id
    where tm.team_id = p_team_id and p.email = p_invitee_email
  ) then
    raise exception 'User is already a member of this team';
  end if;

  -- Create invitation
  insert into team_invitations (team_id, inviter_id, invitee_email)
  values (p_team_id, auth.uid(), p_invitee_email)
  returning * into invitation;

  return invitation;
end;
$$;

-- Function to accept team invitation
create or replace function public.accept_team_invitation(
  p_invitation_id uuid
)
returns boolean
language plpgsql
security definer
as $$
declare
  invitation team_invitations;
  user_profile_id uuid;
begin
  -- Get invitation
  select * into invitation from team_invitations where id = p_invitation_id;
  
  if not found then
    raise exception 'Invitation not found';
  end if;

  -- Check if invitation is for current user
  if invitation.invitee_email != (
    select email from auth.users where id = auth.uid()
  ) then
    raise exception 'You can only accept invitations sent to your email';
  end if;

  -- Check if invitation is still pending
  if invitation.status != 'pending' then
    raise exception 'Invitation is no longer pending';
  end if;

  -- Check if invitation has expired
  if invitation.expires_at < now() then
    raise exception 'Invitation has expired';
  end if;

  -- Get user's profile ID
  select id into user_profile_id from profiles where id = auth.uid();
  
  if not found then
    raise exception 'User profile not found';
  end if;

  -- Add user to team
  insert into team_members (team_id, user_id)
  values (invitation.team_id, user_profile_id)
  on conflict (team_id, user_id) do nothing;

  -- Update invitation status
  update team_invitations 
  set status = 'accepted', accepted_at = now()
  where id = p_invitation_id;

  return true;
end;
$$;

-- Function to decline team invitation
create or replace function public.decline_team_invitation(
  p_invitation_id uuid
)
returns boolean
language plpgsql
security definer
as $$
declare
  invitation team_invitations;
begin
  -- Get invitation
  select * into invitation from team_invitations where id = p_invitation_id;
  
  if not found then
    raise exception 'Invitation not found';
  end if;

  -- Check if invitation is for current user
  if invitation.invitee_email != (
    select email from auth.users where id = auth.uid()
  ) then
    raise exception 'You can only decline invitations sent to your email';
  end if;

  -- Check if invitation is still pending
  if invitation.status != 'pending' then
    raise exception 'Invitation is no longer pending';
  end if;

  -- Update invitation status
  update team_invitations 
  set status = 'declined', declined_at = now()
  where id = p_invitation_id;

  return true;
end;
$$;

-- Function to get user's pending invitations
create or replace function public.get_user_invitations()
returns table (
  id uuid,
  team_id integer,
  team_name text,
  inviter_name text,
  created_at timestamp with time zone,
  expires_at timestamp with time zone
)
language plpgsql
security definer
as $$
begin
  return query
  select 
    ti.id,
    ti.team_id,
    t.name as team_name,
    p.full_name as inviter_name,
    ti.created_at,
    ti.expires_at
  from team_invitations ti
  join teams t on t.id = ti.team_id
  join profiles p on p.id = ti.inviter_id
  where ti.invitee_email = (
    select email from auth.users where id = auth.uid()
  )
  and ti.status = 'pending'
  and ti.expires_at > now()
  order by ti.created_at desc;
end;
$$; 