-- Add OAuth provider support and enhance profile system
-- This migration enhances the existing auth system to work better with OAuth providers

-- Add OAuth provider information to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS oauth_provider text,
ADD COLUMN IF NOT EXISTS oauth_provider_id text,
ADD COLUMN IF NOT EXISTS avatar_url text; -- Make sure this exists

-- Create index for OAuth lookups
CREATE INDEX IF NOT EXISTS idx_profiles_oauth_provider_id 
ON public.profiles(oauth_provider, oauth_provider_id);

-- Update the handle_new_user function to support OAuth providers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  provider_name text;
  provider_id text;
  user_name text;
  display_name text;
  profile_avatar text;
BEGIN
  -- Extract OAuth provider information
  provider_name := COALESCE(
    new.raw_app_meta_data ->> 'provider',
    'email'
  );
  
  provider_id := CASE 
    WHEN provider_name = 'github' THEN new.raw_user_meta_data ->> 'user_name'
    WHEN provider_name = 'google' THEN new.raw_user_meta_data ->> 'sub'
    ELSE new.email
  END;
  
  -- Determine username and display name based on provider
  user_name := CASE 
    WHEN provider_name = 'github' THEN new.raw_user_meta_data ->> 'user_name'
    WHEN provider_name = 'google' THEN SPLIT_PART(new.email, '@', 1)
    ELSE new.email
  END;
  
  display_name := COALESCE(
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name',
    user_name,
    new.email
  );
  
  profile_avatar := new.raw_user_meta_data ->> 'avatar_url';

  -- Create a profile for the new user
  INSERT INTO public.profiles (
    id, 
    username, 
    full_name, 
    avatar_url,
    oauth_provider,
    oauth_provider_id
  )
  VALUES (
    new.id,
    new.email, -- Always use email as username for consistency
    display_name,
    profile_avatar,
    provider_name,
    provider_id
  );

  -- Create a corresponding resource entry
  INSERT INTO public.resources (
    profile_id, 
    name, 
    role, 
    location, 
    skills
  )
  VALUES (
    new.id,
    display_name,
    'Consultant', -- Default role
    'Remote',     -- Default location
    '{}'          -- Default empty skills array
  );
  
  RETURN new;
END;
$$;

-- Function to link OAuth accounts (for future use)
CREATE OR REPLACE FUNCTION public.link_oauth_account(
  p_provider text,
  p_provider_id text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    oauth_provider = p_provider,
    oauth_provider_id = p_provider_id
  WHERE id = auth.uid();
  
  RETURN FOUND;
END;
$$;

-- Function to get OAuth connection status
CREATE OR REPLACE FUNCTION public.get_oauth_connections(user_id uuid DEFAULT auth.uid())
RETURNS json
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'github', CASE WHEN oauth_provider = 'github' THEN oauth_provider_id ELSE null END,
    'google', CASE WHEN oauth_provider = 'google' THEN oauth_provider_id ELSE null END,
    'email', CASE WHEN oauth_provider = 'email' THEN 'connected' ELSE null END
  )
  FROM public.profiles 
  WHERE id = user_id;
$$;

-- Update RLS policies to work with OAuth
-- (The existing policies should already work, but let's ensure they're compatible)

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.link_oauth_account(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_oauth_connections(uuid) TO authenticated;

-- Add helpful comments
COMMENT ON COLUMN public.profiles.oauth_provider IS 'OAuth provider used for authentication (github, google, email)';
COMMENT ON COLUMN public.profiles.oauth_provider_id IS 'Unique identifier from the OAuth provider';
COMMENT ON FUNCTION public.link_oauth_account(text, text) IS 'Links an OAuth account to the current user profile';
COMMENT ON FUNCTION public.get_oauth_connections(uuid) IS 'Returns OAuth connection status for a user'; 