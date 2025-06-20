-- Create MCP tokens table for user-generated API keys
create table if not exists public.mcp_tokens (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  token_hash text not null unique,
  created_at timestamp with time zone default now(),
  expires_at timestamp with time zone,
  last_used_at timestamp with time zone,
  is_active boolean default true,
  
  constraint token_name_length check (char_length(name) >= 1 and char_length(name) <= 100)
);

-- Set up Row Level Security (RLS)
alter table public.mcp_tokens enable row level security;

-- Users can only see their own tokens
drop policy if exists "Users can view own MCP tokens." on public.mcp_tokens;
create policy "Users can view own MCP tokens." on public.mcp_tokens
  for select using (auth.uid() = user_id);

-- Users can insert their own tokens
drop policy if exists "Users can insert own MCP tokens." on public.mcp_tokens;
create policy "Users can insert own MCP tokens." on public.mcp_tokens
  for insert with check (auth.uid() = user_id);

-- Users can update their own tokens (for revoking/deactivating)
drop policy if exists "Users can update own MCP tokens." on public.mcp_tokens;
create policy "Users can update own MCP tokens." on public.mcp_tokens
  for update using (auth.uid() = user_id);

-- Users can delete their own tokens
drop policy if exists "Users can delete own MCP tokens." on public.mcp_tokens;
create policy "Users can delete own MCP tokens." on public.mcp_tokens
  for delete using (auth.uid() = user_id);

-- Function to generate simple hash-based MCP token
create or replace function public.generate_mcp_token(
  p_name text,
  p_expires_days integer default 365
)
returns json
language plpgsql
security definer
as $$
declare
  token_id uuid;
  raw_token text;
  token_hash text;
  expires_at timestamp with time zone;
begin
  -- Generate a random token (32 bytes = 64 hex chars)
  raw_token := encode(gen_random_bytes(32), 'hex');
  
  -- Hash the token for storage
  token_hash := encode(digest(raw_token, 'sha256'), 'hex');
  
  -- Calculate expiration
  expires_at := now() + (p_expires_days || ' days')::interval;
  
  -- Insert the token record
  insert into public.mcp_tokens (user_id, name, token_hash, expires_at)
  values (auth.uid(), p_name, token_hash, expires_at)
  returning id into token_id;
  
  -- Return the raw token (only time it's visible)
  return json_build_object(
    'id', token_id,
    'token', 'mcp_' || raw_token,
    'name', p_name,
    'expires_at', expires_at
  );
end;
$$;

-- Function to validate hash-based MCP token
create or replace function public.validate_mcp_token(p_token text)
returns uuid
language plpgsql
security definer
as $$
declare
  token_hash text;
  user_id uuid;
begin
  -- Remove 'mcp_' prefix if present
  if p_token like 'mcp_%' then
    p_token := substring(p_token from 5);
  end if;
  
  -- Hash the provided token
  token_hash := encode(digest(p_token, 'sha256'), 'hex');
  
  -- Find matching active token
  select mt.user_id into user_id
  from public.mcp_tokens mt
  where mt.token_hash = token_hash
    and mt.is_active = true
    and (mt.expires_at is null or mt.expires_at > now());
  
  -- Update last_used_at if token found
  if user_id is not null then
    update public.mcp_tokens 
    set last_used_at = now()
    where token_hash = token_hash;
  end if;
  
  return user_id;
end;
$$; 