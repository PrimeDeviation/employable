-- Add availability and rate columns to the profiles table if they don't exist
alter table public.profiles
  add column if not exists hourly_rate numeric(10, 2) check (hourly_rate >= 0),
  add column if not exists availability text default 'available';

-- Note: We could use an enum for availability, but text is more flexible for now.
-- Example values: 'available', 'unavailable', 'on-request'

-- RLS policies do not need to be updated for this as the existing policies on `profiles`
-- already grant the correct update/select permissions to the row owner. 