## Overview
Refactor the MCP server's authentication middleware to accept and validate OAuth 2.0 bearer tokens from GitHub and Google OAuth providers. The server must be able to extract user identity and scope from tokens to enforce authorization checks on incoming requests.

## Current Implementation Status ✅
- **Supabase Auth Integration**: Already supports OAuth session tokens via `supabase.auth.getUser(token)`
- **Custom JWT Tokens**: Working system for long-lasting tokens via `generate_mcp_jwt_token`
- **Hybrid Authentication**: Both OAuth and custom tokens supported in MCP server

## OAuth Provider Implementation 

### ✅ **GitHub OAuth** 
- Login UI implemented with GitHub provider
- Automatic profile creation with GitHub metadata
- Provider information stored in profiles table
- Session tokens work with existing MCP authentication

### ✅ **Google OAuth**
- Login UI implemented with Google provider  
- Automatic profile creation with Google metadata
- Provider information stored in profiles table
- Session tokens work with existing MCP authentication

## Authentication Flow Architecture

1. **OAuth Session Tokens** (Short-lived, auto-refresh)
   - GitHub/Google OAuth → Supabase session token
   - Used for web app and short-term MCP access
   - Automatically refreshed by Supabase

2. **Long-Lasting MCP Tokens** (1 year, 5 years, or never expire)
   - Generated after OAuth login via `generate_mcp_jwt_token`
   - Used for MCP clients that need persistent access
   - Stored securely, can be revoked by user

## MCP Server Token Validation Priority

```typescript
// 1. Try Supabase OAuth session token first
const { data: { user } } = await supabaseAdmin.auth.getUser(token);

// 2. Fall back to custom JWT tokens  
if (token.includes('.')) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  if (payload.token_type === 'mcp') { /* validate */ }
}

// 3. Fall back to hash-based tokens
const tokenData = await supabase.from('mcp_tokens').select('*').eq('token', token);
```

## Database Schema Updates ✅

Migration `0040_add_oauth_support.sql` adds:
- `oauth_provider` column (github, google, email)
- `oauth_provider_id` column for external IDs
- Enhanced `handle_new_user()` function for OAuth users
- OAuth connection status functions

## UI/UX Updates ✅

- **LoginPage**: GitHub and Google OAuth buttons
- **MCPTokenManager**: Long-lasting token generation with expiration options
- **Account Settings**: OAuth connection status display

## Testing Requirements

- [ ] Test GitHub OAuth login → profile creation → MCP token generation
- [ ] Test Google OAuth login → profile creation → MCP token generation  
- [ ] Verify OAuth session tokens work with MCP server
- [ ] Verify long-lasting tokens work for MCP clients
- [ ] Test token revocation and management

## Related Issues
- #53 Epic: Multi-Platform MCP Client Support
- #68 Fix: Production MCP Server Not Loading Tools
- #51 feat: Implement Developer Application Registration

Part of Epic #46 and #53. 