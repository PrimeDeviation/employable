-- Add JWT-based MCP token generation and validation
-- This complements the existing hash-based tokens

-- Function to generate JWT-based MCP token
create or replace function public.generate_mcp_jwt_token(
  p_name text,
  p_expires_days integer default 365
)
returns json
language plpgsql
security definer
as $$
declare
  token_id uuid;
  jwt_token text;
  expires_at timestamp with time zone;
  payload json;
begin
  -- Generate token ID
  token_id := gen_random_uuid();
  
  -- Calculate expiration
  expires_at := now() + (p_expires_days || ' days')::interval;
  
  -- Create JWT payload
  payload := json_build_object(
    'iss', 'employable-mcp',
    'sub', auth.uid()::text,
    'aud', 'mcp-client',
    'exp', extract(epoch from expires_at)::integer,
    'iat', extract(epoch from now())::integer,
    'token_type', 'mcp',
    'user_id', auth.uid()::text,
    'token_id', token_id::text
  );
  
  -- Generate JWT token using pgjwt extension
  -- Using a simple secret for now (in production, use a proper secret)
  jwt_token := extensions.sign(payload, 'your-secret-key', 'HS256');
  
  -- Store token metadata (not the actual token)
  insert into public.mcp_tokens (id, user_id, name, token_hash, expires_at)
  values (token_id, auth.uid(), p_name, 'jwt_' || token_id::text, expires_at);
  
  -- Return the JWT token
  return json_build_object(
    'id', token_id,
    'token', jwt_token,
    'name', p_name,
    'expires_at', expires_at
  );
end;
$$;

-- Function to validate JWT-based MCP token
create or replace function public.validate_mcp_jwt_token(p_token text)
returns uuid
language plpgsql
security definer
as $$
declare
  payload json;
  user_id uuid;
  token_id uuid;
  exp_timestamp integer;
begin
  -- Verify and decode JWT token
  begin
    payload := extensions.verify(p_token, 'your-secret-key', 'HS256');
  exception when others then
    return null; -- Invalid token
  end;
  
  -- Extract user_id and token_id from payload
  user_id := (payload->>'user_id')::uuid;
  token_id := (payload->>'token_id')::uuid;
  exp_timestamp := (payload->>'exp')::integer;
  
  -- Check if token is expired
  if exp_timestamp < extract(epoch from now())::integer then
    return null; -- Token expired
  end if;
  
  -- Check if token exists and is active in our database
  if not exists (
    select 1 from public.mcp_tokens 
    where id = token_id 
    and user_id = validate_mcp_jwt_token.user_id
    and is_active = true
    and (expires_at is null or expires_at > now())
  ) then
    return null; -- Token not found or inactive
  end if;
  
  -- Update last_used_at
  update public.mcp_tokens 
  set last_used_at = now()
  where id = token_id;
  
  return user_id;
end;
$$; 