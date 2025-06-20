-- Enable pgjwt extension for JWT token generation
create extension if not exists pgjwt with schema extensions;
 
-- Grant usage on extensions schema to authenticated users
grant usage on schema extensions to authenticated;
grant execute on all functions in schema extensions to authenticated; 