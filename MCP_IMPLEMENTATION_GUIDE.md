# MCP Tool Implementation Guide

This guide documents the process for implementing and testing new MCP (Model Context Protocol) tools in the Employable platform.

## Overview

The MCP server is implemented as a Supabase Edge Function that provides programmatic access to the Employable marketplace through a standardized protocol interface.

**Server Location**: `supabase/functions/mcp-server/index.ts`
**Endpoint**: `http://localhost:9999/mcp-server` (development)

## Current Tool Inventory

### Profile Management
- `getProfile` - Get user profile by username/email
- `getMyProfile` - Get authenticated user's profile
- `updateMyProfile` - Update authenticated user's profile

### Marketplace Operations
- `browseOffers` - Browse available job offers with filtering
- `getOfferDetail` - Get detailed offer information including bids
- `createOffer` - Create new marketplace offers (authenticated)

### Resource & Team Management
- `browseResources` - Browse available consultants/freelancers
- `getResourceDetail` - Get detailed resource profile information
- `browseTeams` - Browse available teams with filtering *(Latest Addition)*

## Implementation Process

### Step 1: Tool Definition

Add your tool to the `AVAILABLE_TOOLS` array in `supabase/functions/mcp-server/index.ts`:

```typescript
{
  name: "toolName",
  description: "Clear description of what the tool does",
  inputSchema: {
    type: "object",
    properties: {
      parameterName: {
        type: "string|number|array",
        description: "Parameter description"
      }
    },
    required: ["requiredParam"]
  }
}
```

### Step 2: Handler Implementation

Add a handler in the main request processing switch statement:

```typescript
if (serviceName === 'toolName') {
  // Authentication check (if required)
  if (requiresAuth) {
    const token = getAuthToken(request);
    const user = await validateAuth(token);
    if (!user) {
      return createErrorResponse(id, -32600, 'Authentication required');
    }
  }

  // Parameter extraction
  const { param1, param2 } = params.arguments || {};

  // Database operations
  let query = supabase.from('table_name').select('*');
  
  // Apply filters
  if (param1) query = query.eq('column', param1);
  
  // Execute query
  const { data, error } = await query;

  // Response formatting
  return createSuccessResponse(id, formatResponse(data));
}
```

### Step 3: Response Formatting

Follow consistent response patterns:

```typescript
// For listing results
const formatResponse = (data) => {
  const header = `🏢 Available Items (${data.length} found):\n\n`;
  
  const items = data.map((item, index) => {
    return `${index + 1}. ${item.name}
   Key Info: ${item.info}
   Additional: ${item.details}
   ID: ${item.id}`;
  }).join('\n\n');

  const footer = '\n💡 Use getItemDetail with an ID for more information.';
  return header + items + footer;
};
```

## Testing Strategy

### Development Server Setup

1. **Start the Functions Server**:
   ```bash
   cd /path/to/employable
   npx supabase functions serve
   ```

2. **Verify Server Status**:
   - Check terminal output for "Listening on http://localhost:9999/"
   - Server should show debug output for requests

### Tool Discovery Testing

Test that your new tool appears in the available tools list:

```bash
curl -X POST http://localhost:9999/mcp-server \
  -H "Content-Type: application/json" \
  -d '{"method": "tools/list", "jsonrpc": "2.0", "id": 1}'
```

Expected: Tool count should increase (e.g., 8 → 9 tools)

### Functional Testing

#### Through MCP Interface
Use the MCP tools panel in Cursor to test your implementation:
- Verify tool appears in interface
- Test with various parameter combinations
- Validate response formatting
- Check edge cases (empty results, invalid params)

#### Direct API Testing
```bash
curl -X POST http://localhost:9999/mcp-server \
  -H "Content-Type: application/json" \
  -d '{
    "method": "tools/call",
    "params": {
      "name": "yourToolName",
      "arguments": {"param": "value"}
    },
    "jsonrpc": "2.0",
    "id": 1
  }'
```

### Regression Testing Protocol

**CRITICAL**: Always test existing tools after adding new ones.

#### Safe Tests (Read-Only)
✅ Test these without data concerns:
- `browseOffers`
- `browseResources` 
- `browseTeams`
- `getResourceDetail`
- `getOfferDetail`

#### Avoid in Testing (Write Operations)
❌ Don't test these during regression:
- `createOffer`
- `updateMyProfile`
- Any tool that modifies data

#### Regression Test Checklist
- [ ] All tools visible in MCP interface
- [ ] Existing tools return expected data
- [ ] Response formatting consistent
- [ ] No database query errors
- [ ] Server processing requests without crashes

## Architecture Patterns

### Authentication Handling
```typescript
// For public tools (browsing)
// No auth check required

// For authenticated tools
const token = getAuthToken(request);
const user = await validateAuth(token);
if (!user) {
  return createErrorResponse(id, -32600, 'Authentication required');
}
```

### Database Query Patterns
```typescript
// Basic query with filtering
let query = supabase
  .from('table_name')
  .select('column1, column2, related_table(field)');

// Apply conditional filters
if (filterParam) {
  query = query.eq('column', filterParam);
}

// Handle array filters
if (arrayFilter && arrayFilter.length > 0) {
  query = query.overlaps('array_column', arrayFilter);
}

// Pagination
const limit = Math.min(params.limit || 10, 50);
const offset = params.offset || 0;
query = query.range(offset, offset + limit - 1);
```

### Error Handling
```typescript
const { data, error } = await query;

if (error) {
  console.error('Database error:', error);
  return createErrorResponse(id, -32603, 'Database query failed');
}

if (!data || data.length === 0) {
  return createSuccessResponse(id, 'No results found');
}
```

## Common Patterns & Examples

### Example: browseTeams Implementation
Reference the `browseTeams` tool implementation for a complete example including:
- Comprehensive filtering options
- Proper response formatting
- Pagination support
- Public access (no auth required)

### Database Schema Integration
- Use proper table relationships with `.select()` joins
- Handle nullable fields gracefully
- Apply appropriate RLS (Row Level Security) policies

### Response Consistency
- Use emojis and clear formatting for readability
- Include counts in headers
- Provide actionable next steps in footers
- Maintain consistent field naming

## Deployment & Commit Process

1. **Test Locally**: Verify all functionality works
2. **Run Regression Tests**: Ensure no breaking changes
3. **Commit Changes**:
   ```bash
   git add supabase/functions/mcp-server/index.ts
   git commit -m "Add [toolName] MCP tool for [purpose]
   
   - Added [toolName] to AVAILABLE_TOOLS array
   - Implemented handler with [features]
   - Added [specific functionality]
   - Successfully tested and verified [X] tools now available"
   ```
4. **Push to Remote**: `git push`

## Troubleshooting

### Server Won't Start
- Check for TypeScript syntax errors
- Verify import statements
- Ensure proper JSON formatting in tool definitions

### Tool Not Appearing
- Check server logs for compilation errors
- Verify tool added to AVAILABLE_TOOLS array
- Restart functions server after changes

### Database Errors
- Verify table/column names match schema
- Check RLS policies allow access
- Validate query syntax

### Authentication Issues
- Ensure proper token extraction
- Verify JWT validation logic
- Check database user permissions

## Best Practices

1. **Start Simple**: Implement basic functionality first, add features incrementally
2. **Follow Patterns**: Use existing tools as templates for consistency
3. **Test Thoroughly**: Both positive and negative test cases
4. **Document Changes**: Clear commit messages and inline comments
5. **Safety First**: Avoid modifying data during regression testing
6. **Performance**: Use appropriate limits and pagination for large datasets

## Future Considerations

- Consider implementing `getTeamDetail` as a companion to `browseTeams`
- Explore bidirectional team invitation workflows
- Add team member management capabilities
- Implement team performance metrics and analytics

---

*This guide was created based on the successful implementation of the `browseTeams` tool in January 2025.* 