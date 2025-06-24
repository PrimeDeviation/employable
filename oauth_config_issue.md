## Overview
Configure GitHub and Google OAuth providers in Supabase to enable OAuth authentication for the employable platform. This is required for the OAuth implementation in issue #49.

## OAuth Provider Configuration Required

### 🔧 **GitHub OAuth App**
Configure GitHub OAuth application for employable platform:

**Required Settings:**
- **Application Name**: `Employable - AI Agent Platform`
- **Homepage URL**: `https://employable-dev.web.app` (or custom domain)
- **Authorization Callback URL**: `https://kvtqkvifglyytdsvsyzo.supabase.co/auth/v1/callback`
- **Application Description**: Platform for connecting AI agents with professional teams and opportunities

**Supabase Configuration:**
```
Provider: GitHub
Client ID: [from GitHub OAuth app]
Client Secret: [from GitHub OAuth app]
Redirect URL: https://kvtqkvifglyytdsvsyzo.supabase.co/auth/v1/callback
```

### 🔧 **Google OAuth App**
Configure Google OAuth application via Google Cloud Console:

**Required Settings:**
- **Application Name**: `Employable`
- **Authorized Origins**: `https://employable-dev.web.app`, `https://kvtqkvifglyytdsvsyzo.supabase.co`
- **Authorized Redirect URIs**: `https://kvtqkvifglyytdsvsyzo.supabase.co/auth/v1/callback`
- **OAuth Consent Screen**: External users, professional scope

**Supabase Configuration:**
```
Provider: Google
Client ID: [from Google Cloud Console]
Client Secret: [from Google Cloud Console]  
Redirect URL: https://kvtqkvifglyytdsvsyzo.supabase.co/auth/v1/callback
```

## Implementation Steps

### 1. **Create OAuth Applications**
- [ ] Create GitHub OAuth App in GitHub Developer Settings
- [ ] Create Google OAuth App in Google Cloud Console
- [ ] Configure consent screens and branding

### 2. **Configure Supabase Providers**
- [ ] Add GitHub provider in Supabase Auth settings
- [ ] Add Google provider in Supabase Auth settings
- [ ] Test callback URLs and redirect flows

### 3. **Update Environment Variables**
- [ ] Add OAuth client IDs to environment variables (if needed)
- [ ] Update frontend environment with OAuth settings
- [ ] Configure production vs development OAuth apps

### 4. **Test OAuth Flows**
- [ ] Test GitHub OAuth login → profile creation
- [ ] Test Google OAuth login → profile creation
- [ ] Verify OAuth provider data in profiles table
- [ ] Test OAuth token generation for MCP

## Security Considerations

### **OAuth App Security**
- Use separate OAuth apps for development and production
- Restrict redirect URLs to known domains only
- Enable OAuth app security features (require HTTPS, etc.)

### **Scope Permissions**
- **GitHub**: `user:email` (access to email address)
- **Google**: `email profile` (basic profile and email)
- Minimal scope principle - only request necessary permissions

### **Token Management**
- OAuth session tokens are short-lived (handled by Supabase)
- Long-lasting MCP tokens generated separately after OAuth login
- Users can revoke OAuth connections independently

## Testing Checklist

- [ ] GitHub OAuth login works in development
- [ ] Google OAuth login works in development  
- [ ] Profile creation includes OAuth provider information
- [ ] OAuth users can generate MCP tokens
- [ ] OAuth connections displayed in account settings
- [ ] Production OAuth configuration tested

## Related Issues
- #49 refactor: Update MCP Server to Validate OAuth Tokens
- #53 Epic: Multi-Platform MCP Client Support
- #51 feat: Implement Developer Application Registration

## Dependencies
- Requires Supabase project admin access
- Requires GitHub organization OAuth app creation permissions
- Requires Google Cloud Console project access

Part of Epic #46 and #53. 