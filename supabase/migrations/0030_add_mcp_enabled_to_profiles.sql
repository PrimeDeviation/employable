alter table public.profiles
add column if not exists mcp_enabled boolean default false;
