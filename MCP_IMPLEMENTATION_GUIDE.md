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

#### Through Cursor Chat Interface (Primary Method)
**This is the preferred testing method for Cursor-based implementations:**

1. **Tool Discovery**: Ask the user "What tools do you see available?" to verify your new tool appears in their MCP interface
2. **Basic Functionality Test**: Test the tool directly in chat:
   ```
   User: "let's test the browseTeams tool through this chat. Do you see it listed?"
   Assistant: Use mcp_employable-agents_browseTeams with basic parameters
   ```

3. **Parameter Validation**: Test different parameter combinations:
   ```
   // Basic call
   mcp_employable-agents_browseTeams(limit: 5, offset: 0)
   
   // With filters
   mcp_employable-agents_browseTeams(skills_filter: ["AI", "DevOps"], limit: 3)
   
   // Search functionality
   mcp_employable-agents_browseTeams(search: "AI", limit: 1)
   ```

4. **Edge Case Testing**: Test edge cases through chat:
   - Empty results scenarios
   - Invalid parameter values
   - Missing required parameters
   - Large result sets (pagination)

#### Through MCP Tools Panel
Use the MCP tools panel in Cursor as backup verification:
- Verify tool appears in interface
- Cross-reference tool count (e.g., 8 → 9 tools)
- Validate parameter schema display

#### Direct API Testing (Development Only)
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

#### Cursor Chat Regression Testing
**Example from browseTeams implementation:**

1. **Tool Count Verification**: 
   ```
   User: "Check again" (to verify tool count)
   Assistant confirms: "I can see all 9 tools are now available"
   ```

2. **Sequential Tool Testing**: Test read-only tools in chat:
   ```
   // Test core functionality remains intact
   mcp_employable-agents_browseOffers()
   mcp_employable-agents_browseResources()  
   mcp_employable-agents_getOfferDetail(offer_id: 1)
   mcp_employable-agents_getResourceDetail(resource_id: 1)
   mcp_employable-agents_browseTeams(limit: 2) // Your new tool
   ```

3. **Response Quality Check**: Verify each tool returns:
   - Properly formatted responses
   - Expected data structure
   - No error messages
   - Consistent styling and emojis

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
- [ ] Existing tools return expected data through chat testing
- [ ] Response formatting consistent across all tools
- [ ] No database query errors in server logs
- [ ] Server processing requests without crashes
- [ ] User confirms regression testing successful

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

## Collaborative Testing with Cursor User

### Key Testing Partnership
The Cursor user plays a crucial role in testing MCP tools since they have direct access to the MCP interface:

#### User's Role:
- **Visual Confirmation**: User can see the MCP tools panel and confirm tool availability
- **Real-time Testing**: User requests specific tool tests through chat
- **Interface Validation**: User provides screenshots/feedback on tool visibility
- **Regression Confirmation**: User validates that all tools still work

#### Assistant's Role:
- **Implementation Testing**: Call tools directly in chat to demonstrate functionality
- **Parameter Exploration**: Test various parameter combinations systematically
- **Error Handling**: Test edge cases and validate error responses
- **Documentation**: Explain what each test validates

#### Example Testing Dialog:
```
User: "I see 9 tools now"
Assistant: "Great! Let me test the new browseTeams tool:"
         [calls mcp_employable-agents_browseTeams]
User: "let's regression test each of the other tools"
Assistant: [systematically tests each read-only tool]
User: "great work. And good call not testing the additive tools"
```

### Testing Best Practices:
1. **Always confirm tool visibility** with user before testing functionality
2. **Test incrementally** - one tool at a time with user feedback
3. **Explain what you're testing** so user understands the validation process
4. **Get user confirmation** before proceeding to regression testing
5. **Document any issues** the user reports about tool behavior

## Deployment & Commit Process

1. **Test Locally**: Verify all functionality works
2. **Test with User**: Collaborative testing through Cursor chat interface
3. **Run Regression Tests**: Ensure no breaking changes
4. **Get User Approval**: User confirms all tools working properly
5. **Commit Changes**:
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