# MCP Tool Implementation Guide

This guide documents the process for implementing and testing new MCP (Model Context Protocol) tools in the Employable platform.

## For Cursor AI Assistants Reading This Guide

**Context**: You are a Cursor AI assistant working with a developer to implement MCP tools for the Employable marketplace. This guide contains everything you need to know to implement and test MCP tools without requiring detailed explanations from the user.

**Key Points**:
- The user expects you to be proactive in testing tools via Cursor chat
- You have direct access to MCP tools in Cursor with the `mcp_employable-agents_` prefix
- Follow the patterns established in existing tools (see `browseTeams` as reference)
- The Supabase functions server may need multiple startup attempts - this is normal
- Cursor chat testing is preferred over systematic API testing

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

**Important for Cursor AI Assistants**: When the user asks you to implement an MCP tool, follow these steps exactly. You should proactively implement, test, and iterate without waiting for detailed instructions.

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

1. **Start the Functions Server** (may require multiple attempts):
   ```bash
   cd /path/to/employable
   npx supabase functions serve
   ```
   
   **Common Issues & Solutions**:
   - If server terminates immediately, try restarting: `npx supabase functions serve`
   - Ignore env file errors - basic command usually works without env files
   - Watch for "Listening on http://localhost:9999/" in terminal output
   - Debug logs showing dependency loading are normal and expected

2. **Verify Server Status**:
   - Check terminal shows "Listening on http://localhost:9999/"
   - Server should show debug output for incoming requests
   - Don't worry about initial "name resolution failed" errors - often temporary

### Primary Testing Method: Cursor Chat Interface

**This is the main testing approach we use:**

#### For the Assistant/Model:
You can directly test MCP tools from chat without asking the user for permission or explanation. The tools are automatically available in your interface with the prefix `mcp_employable-agents_`.

**Standard Testing Flow:**
1. **Tool Discovery**: Check if new tool appears by calling it directly
2. **Basic Functionality Test**: 
   ```
   mcp_employable-agents_browseTeams(limit: 2)
   ```
3. **Parameter Testing**: Test different combinations as needed:
   ```
   mcp_employable-agents_browseTeams(skills_filter: ["AI", "DevOps"], limit: 3)
   mcp_employable-agents_browseTeams(search: "AI", limit: 1)
   ```

**Available MCP Tools for Testing:**
- `mcp_employable-agents_browseOffers()`
- `mcp_employable-agents_browseResources()`
- `mcp_employable-agents_browseTeams()`
- `mcp_employable-agents_getResourceDetail(resource_id: number)`
- `mcp_employable-agents_getOfferDetail(offer_id: number)`
- `mcp_employable-agents_getProfile(username: string)`

**Testing Instructions for Model:**
- Call tools directly without asking user first
- If tool responds with data, it's working correctly
- Report any errors or unexpected responses
- User expects you to test tools proactively during development

**If tool calls work from chat, that's sufficient for validation.**

### Troubleshooting: If Chat Testing Fails

If tool calls don't work from chat or you need deeper debugging, use these systematic methods:

#### 1. Verify Tool Registration
```bash
curl -X POST http://localhost:9999/mcp-server \
  -H "Content-Type: application/json" \
  -d '{"method": "tools/list", "jsonrpc": "2.0", "id": 1}'
```
Expected: Tool count should increase (e.g., 8 → 9 tools)

#### 2. Direct API Testing
```bash
curl -X POST http://localhost:9999/mcp-server \
  -H "Content-Type: application/json" \
  -d '{
    "method": "tools/call",
    "params": {
      "name": "browseTeams",
      "arguments": {"limit": 2}
    },
    "jsonrpc": "2.0",
    "id": 1
  }'
```

#### 3. Check Server Logs
- Look for compilation errors in terminal
- Check for database connection issues
- Verify proper JSON-RPC request parsing

#### 4. Parameter Validation Testing
Test different parameter combinations systematically:
- Basic call with minimal parameters
- With optional filters
- Edge cases (empty results, invalid values)

### Regression Testing (Optional but Recommended)

**Goal**: Verify existing tools still work after adding new ones.

#### Quick Regression Check via Chat:
Ask user to confirm tool count, then test a few existing tools:
```
User: "I see 9 tools now" (confirms tool count increased)
Assistant: "Great! Let me test a couple existing tools:"
mcp_employable-agents_browseOffers()
mcp_employable-agents_browseResources()
mcp_employable-agents_browseTeams(limit: 2) // Your new tool
```

**If existing tools respond normally from chat, regression testing is complete.**

#### Safe Tools for Testing (Read-Only):
✅ Always safe to test:
- `browseOffers`, `browseResources`, `browseTeams`
- `getResourceDetail`, `getOfferDetail`

❌ Avoid testing (modify data):
- `createOffer`, `updateMyProfile`

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

### Example: browseTeams Implementation (Use as Template)
**For AI Assistants**: Always reference this implementation when creating new tools. It contains all the patterns you need:

Located in `supabase/functions/mcp-server/index.ts` around line 1430, this tool shows:
- Comprehensive filtering options (skills, location, availability, search)
- Proper response formatting with emojis and human-readable text
- Pagination support (limit/offset)
- Public access (no auth required - uses anon key)
- Error handling patterns
- Database query patterns with proper joins

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

**For AI Assistants**: Follow this exact sequence when implementing new tools:

1. **Implement Tool**: Add to AVAILABLE_TOOLS and implement handler
2. **Start Server**: Help user start `npx supabase functions serve` (expect multiple attempts)
3. **Test Proactively**: Call your new tool directly from chat to verify it works
4. **Quick Regression**: Test 2-3 existing tools to ensure no breakage
5. **Report Results**: Tell user "Tool implemented and tested successfully"
6. **Commit Changes** (user will do this part):
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

**For AI Assistants implementing tools:**

1. **Start Simple**: Implement basic functionality first, add features incrementally
2. **Follow Patterns**: Always use `browseTeams` as your template - copy its structure
3. **Test Immediately**: Call your tool from chat as soon as you implement it
4. **Be Proactive**: Don't wait for user instructions - implement, test, report results
5. **Safety First**: Only test read-only tools during regression (browse*, get*)
6. **Performance**: Use appropriate limits and pagination for large datasets
7. **Error Context**: If something fails, check server logs and explain what you see

## Future Considerations

- Consider implementing `getTeamDetail` as a companion to `browseTeams`
- Explore bidirectional team invitation workflows
- Add team member management capabilities
- Implement team performance metrics and analytics

---

*This guide was created based on the successful implementation of the `browseTeams` tool in January 2025.* 