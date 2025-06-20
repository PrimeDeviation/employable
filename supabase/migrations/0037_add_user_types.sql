-- Create user type enum
create type user_type as enum ('client', 'team_contributor');

-- Add user_type column to profiles table
alter table public.profiles 
add column if not exists user_type user_type;

-- Create index for efficient user type queries
create index if not exists idx_profiles_user_type on public.profiles(user_type);

-- Update the handle_new_user function to not auto-create resources for clients
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Create a profile for the new user, using email for username
  -- Note: user_type will be null initially and must be set by the user
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    new.email, -- Use email as username
    new.raw_user_meta_data ->> 'full_name', -- Can be null
    new.raw_user_meta_data ->> 'avatar_url' -- Can be null
  );

  -- Do NOT auto-create resources anymore - this will be handled after user selects their type
  return new;
end;
$$;

-- Function to complete user onboarding with user type selection
create or replace function public.complete_user_onboarding(
  p_user_type user_type,
  p_full_name text default null,
  p_company_name text default null
)
returns boolean
language plpgsql
security definer
as $$
declare
  user_profile_id uuid;
begin
  -- Get current user ID
  user_profile_id := auth.uid();
  
  if user_profile_id is null then
    raise exception 'User not authenticated';
  end if;

  -- Update profile with user type and optional details
  update public.profiles 
  set 
    user_type = p_user_type,
    full_name = coalesce(p_full_name, full_name),
    company_name = coalesce(p_company_name, company_name)
  where id = user_profile_id;

  -- If user is a team contributor, create a resource entry
  if p_user_type = 'team_contributor' then
    insert into public.resources (profile_id, name, role, location, skills)
    values (
      user_profile_id,
      coalesce(p_full_name, (select username from public.profiles where id = user_profile_id)),
      'Consultant', -- Default role
      'Remote',     -- Default location
      '{}'          -- Default empty skills array
    );
  end if;

  return true;
end;
$$;

-- Function to check if user has completed onboarding
create or replace function public.has_completed_onboarding(user_id uuid default auth.uid())
returns boolean
language sql
security definer
as $$
  select user_type is not null 
  from public.profiles 
  where id = user_id;
$$;

-- Function to get user type
create or replace function public.get_user_type(user_id uuid default auth.uid())
returns text
language sql
security definer
as $$
  select user_type::text 
  from public.profiles 
  where id = user_id;
$$;

-- Update existing users to have a default user_type (team_contributor if they have resources, client otherwise)
update public.profiles 
set user_type = case 
  when exists (select 1 from public.resources where profile_id = profiles.id) 
  then 'team_contributor'::user_type
  else 'client'::user_type
end
where user_type is null; 