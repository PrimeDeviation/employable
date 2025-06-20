-- Ensures the handle_new_user function and on_auth_user_created trigger are correctly defined.

-- Drop the trigger first if it exists, as it depends on the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Then, drop the function if it exists
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Define the function to automatically create a profile and resource for a new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
begin
  -- Create a profile for the new user, using email for username
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    new.email, -- Use email as username
    new.raw_user_meta_data ->> 'full_name', -- Can be null
    new.raw_user_meta_data ->> 'avatar_url' -- Can be null
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
$$;

-- Create the trigger to call the function after a new user is inserted into auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user(); 