alter table "public"."profiles" drop column "email";

alter table "public"."profiles" add column "skills" text[];

alter table "public"."profiles" add column "stripe_customer_id" text;

alter table "public"."profiles" alter column "availability" set default 'available'::text;

alter table "public"."profiles" alter column "role" drop default;

alter table "public"."profiles" alter column "role" set data type text using "role"::text;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.accept_team_invitation(p_invitation_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.create_team_invitation(p_team_id integer, p_invitee_email text)
 RETURNS team_invitations
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.decline_team_invitation(p_invitation_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_invitations()
 RETURNS TABLE(id uuid, team_id integer, team_name text, inviter_name text, created_at timestamp with time zone, expires_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  -- Create a profile for the new user, using email for username
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    new.email, -- Use email as username
    new.raw_user_meta_data ->> 'full_name', -- Can be null
    new.raw_user_meta_data ->> 'avatar_url'
  );

  -- Create a corresponding resource, using email for the name
  insert into public.resources (profile_id, name, role, location, skills)
  values (
    new.id,
    new.email, -- Use email as the resource name
    'Consultant', -- Default role
    'Remote',     -- Default location
    '{}'          -- Default empty skills array
  );
  return new;
end;
$function$
;


