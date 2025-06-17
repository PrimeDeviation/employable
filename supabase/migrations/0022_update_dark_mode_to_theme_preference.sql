-- Create theme preference enum
create type theme_preference as enum ('light', 'dark', 'system');

-- Add new theme column
alter table public.profiles 
add column if not exists theme theme_preference default 'system';

-- Migrate existing dark_mode data to theme
update public.profiles 
set theme = case 
  when dark_mode = true then 'dark'::theme_preference
  when dark_mode = false then 'light'::theme_preference
  else 'system'::theme_preference
end;

-- Drop the old dark_mode column
alter table public.profiles drop column if exists dark_mode;

-- Create index for performance
create index if not exists idx_profiles_theme on public.profiles(theme); 