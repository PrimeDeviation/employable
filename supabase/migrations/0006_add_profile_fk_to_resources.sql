-- Add a foreign key to link resources to profiles
alter table public.resources
  add column if not exists profile_id uuid references public.profiles(id); 