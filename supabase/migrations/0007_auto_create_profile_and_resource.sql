-- Function to be called by the trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Create a profile for the new user
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'user_name', -- From GitHub/etc.
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );

  -- Create a corresponding resource for the new user
  insert into public.resources (profile_id, name, role, location, skills)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name', -- Use full_name for resource name
    'Consultant', -- Default role
    'Remote',     -- Default location
    '{}'          -- Default empty skills array
  );
  return new;
end;
$$;

-- Trigger to call the function on new user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user(); 