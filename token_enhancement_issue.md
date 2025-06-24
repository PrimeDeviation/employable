## Overview
Enhance the MCP token system to support long-lasting tokens with flexible expiration options for AI agents and MCP clients that need persistent access beyond OAuth session lifetimes.

## Problem Statement
OAuth session tokens are excellent for web applications but have limitations for MCP clients:
- **Short-lived**: OAuth tokens typically expire in 1 hour
- **Refresh dependency**: Require browser-based refresh flows
- **Client limitations**: Many MCP clients can't handle token refresh
- **Automation needs**: CI/CD and automation require stable, long-lasting tokens

## Enhanced Token System ✅

### **Long-Lasting Token Options**
- **1 Year** (Recommended): Good balance of security and convenience
- **5 Years**: For long-term integrations and automation  
- **Never Expires**: Maximum convenience but requires careful security management

### **Token Management UI ✅**
Enhanced `MCPTokenManager` component provides:
- Token lifetime selection during creation
- Clear expiration status display  
- OAuth provider connection status
- Comprehensive setup instructions for MCP clients
- Security warnings for never-expiring tokens

### **Database Schema Updates ✅**
- Modified `generate_mcp_jwt_token` to accept `null` expiration (never expires)
- Enhanced token display to show "Never Expires" status
- Proper handling of nullable `expires_at` field

## Security Features

### **Token Scoping**
- All tokens scoped to the creating user's permissions
- No privilege escalation possible
- Full audit trail with creation/usage timestamps

### **Token Revocation**
- Users can revoke tokens at any time
- Immediate effect across all MCP clients
- Clear UI for token management

### **Usage Tracking**
- Last used timestamp for each token
- Helps users identify unused tokens for cleanup
- Security audit capabilities

## MCP Client Integration

### **Setup Instructions Provided**
Enhanced UI includes copy-paste ready configurations for:

**Cursor IDE:**
```json
{
  "mcpServers": {
    "employable-agents": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase"],
      "env": {
        "SUPABASE_URL": "https://kvtqkvifglyytdsvsyzo.supabase.co",
        "SUPABASE_ANON_KEY": "[long-lasting-token]"
      }
    }
  }
}
```

**Claude Desktop:**
```json
{
  "mcpServers": {
    "employable": {
      "command": "node",
      "args": ["path/to/mcp-client.js"],
      "env": {
        "MCP_TOKEN": "[long-lasting-token]",
        "MCP_SERVER_URL": "https://kvtqkvifglyytdsvsyzo.supabase.co/functions/v1/mcp-server"
      }
    }
  }
}
```

## Implementation Status ✅

### **Backend Changes**
- [x] Enhanced `generate_mcp_jwt_token` function for flexible expiration
- [x] Updated token validation to handle never-expiring tokens
- [x] Modified database queries to handle null expiration dates

### **Frontend Changes**  
- [x] New token lifetime selection UI
- [x] Enhanced token display with expiration status
- [x] OAuth provider connection indicators
- [x] Comprehensive setup instructions
- [x] Security warnings and best practices

### **Database Migration**
- [x] Support for nullable `expires_at` in `mcp_tokens` table
- [x] Proper indexing for token lookups
- [x] Audit trail capabilities

## Benefits

### **For Users**
- Set-and-forget token setup for MCP clients
- Clear understanding of token lifetimes
- Easy token management and revocation
- Works with any OAuth provider (GitHub, Google, email)

### **For Developers** 
- Stable tokens for CI/CD automation
- No complex refresh logic needed in MCP clients
- Clear documentation and setup instructions
- Flexible security policies

### **For Platform**
- Maintains OAuth security benefits
- User-controlled token lifecycle
- Comprehensive audit capabilities  
- Supports all MCP client types

## Testing Requirements

- [ ] Test token creation with all expiration options
- [ ] Verify never-expiring tokens work long-term
- [ ] Test token revocation immediately disables access
- [ ] Verify UI correctly displays token status
- [ ] Test OAuth user token generation
- [ ] Confirm setup instructions work with real MCP clients

## Related Issues
- #49 refactor: Update MCP Server to Validate OAuth Tokens
- #69 feat: Configure GitHub and Google OAuth Providers in Supabase
- #53 Epic: Multi-Platform MCP Client Support

## Success Criteria
- [x] Users can create tokens with flexible expiration
- [x] Clear UI for token management and status
- [x] OAuth users can generate long-lasting tokens
- [x] Setup instructions provided for major MCP clients
- [x] Security warnings and best practices included

Part of Epic #46 and #53. 