-- Update invitation logic to use username instead of email in profiles
-- Update create_team_invitation function
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

  -- Check if user is already a member (using username as email)
  if exists (
    select 1 from team_members tm
    join profiles p on p.id = tm.user_id
    where tm.team_id = p_team_id and p.username = p_invitee_email
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