-- Migration: Set all usernames to email for all users (using join with auth.users)
update profiles
set username = u.email
from auth.users u
where profiles.id = u.id; 