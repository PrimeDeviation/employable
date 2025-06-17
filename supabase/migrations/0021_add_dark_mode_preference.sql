-- Add dark_mode preference to profiles table
alter table public.profiles 
add column if not exists dark_mode boolean default false;

-- Create index for performance if needed
create index if not exists idx_profiles_dark_mode on public.profiles(dark_mode);

-- Update RLS policies are already handled by existing policies since this is just a column addition 