-- Add email column to profiles if it doesn't exist
alter table profiles add column if not exists email text;

-- Backfill email from auth.users where profiles.id = auth.users.id
update profiles
set email = u.email
from auth.users u
where profiles.id = u.id; 