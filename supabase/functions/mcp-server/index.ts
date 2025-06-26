import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { v4 as uuidv4 } from "https://deno.land/std@0.168.0/uuid/mod.ts";

const MCP_PROTOCOL_VERSION = '2024-11-05';

// Available tools
const AVAILABLE_TOOLS = [
  {
    name: 'getProfile',
    description: 'Get a user profile by username/email',
    inputSchema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          description: 'The username/email of the user to look up'
        }
      },
      required: ['username']
    }
  },
  {
    name: 'getMyProfile', 
    description: 'Get your own profile (requires authentication)',
    inputSchema: {
      type: 'object',
      properties: {
        random_string: {
          type: 'string',
          description: 'Dummy parameter for no-parameter tools'
        }
      },
      required: ['random_string']
    }
  },
  {
    name: 'updateMyProfile',
    description: 'Update your own profile (requires authentication)',
    inputSchema: {
      type: 'object',
      properties: {
        bio: {
          type: 'string',
          description: 'Your professional bio'
        },
        company_name: {
          type: 'string', 
          description: 'Your company name'
        },
        website: {
          type: 'string',
          description: 'Your website URL'
        }
      },
      required: []
    }
  },
  {
    name: 'browseOffers',
    description: 'Browse available job offers in the marketplace',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of offers to return (default: 10)'
        },
        offset: {
          type: 'number',
          description: 'Number of offers to skip for pagination (default: 0)'
        }
      },
      required: []
    }
  },
  {
    name: 'getOfferDetail',
    description: 'Get detailed information about a specific offer including bids',
    inputSchema: {
      type: 'object',
      properties: {
        offer_id: {
          type: 'number',
          description: 'The ID of the offer to get details for (obtained from browseOffers)'
        }
      },
      required: ['offer_id']
    }
  },
  {
    name: 'createOffer',
    description: 'Create a new offer in the marketplace (requires authentication)',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Title of the offer'
        },
        description: {
          type: 'string',
          description: 'Detailed description of the offer'
        },
        offer_type: {
          type: 'string',
          enum: ['client_offer', 'team_offer'],
          description: 'Type of offer: client_offer (looking for team) or team_offer (offering services)'
        },
        team_id: {
          type: 'number',
          description: 'ID of the team this offer is for (required - every offer must be associated with a team)'
        },
        objectives: {
          type: 'array',
          items: { type: 'string' },
          description: 'Project objectives (required for client offers)'
        },
        required_skills: {
          type: 'array',
          items: { type: 'string' },
          description: 'Required skills (required for client offers)'
        },
        services_offered: {
          type: 'array',
          items: { type: 'string' },
          description: 'Services offered (required for team offers)'
        },
        budget_min: {
          type: 'number',
          description: 'Minimum budget (optional)'
        },
        budget_max: {
          type: 'number',
          description: 'Maximum budget (optional)'
        },
        budget_type: {
          type: 'string',
          enum: ['fixed', 'hourly', 'milestone', 'negotiable'],
          description: 'Budget type (default: negotiable)'
        },
        team_size: {
          type: 'number',
          description: 'Team size (for team offers)'
        },
        experience_level: {
          type: 'string',
          enum: ['junior', 'mid', 'senior', 'expert'],
          description: 'Experience level (for team offers, default: mid)'
        }
      },
      required: ['title', 'description', 'offer_type', 'team_id']
    }
  },
  {
    name: 'getMyTeams',
    description: 'Get teams that the authenticated user belongs to (for offer creation)',
    inputSchema: {
      type: 'object',
      properties: {
        random_string: {
          type: 'string',
          description: 'Dummy parameter for no-parameter tools'
        }
      },
      required: ['random_string']
    }
  },
  {
    name: 'browseResources',
    description: 'Browse available resources (consultants and teams) in the marketplace',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of resources to return (default: 10)',
          default: 10
        },
        offset: {
          type: 'number',
          description: 'Number of resources to skip for pagination (default: 0)',
          default: 0
        },
        role_filter: {
          type: 'string',
          description: 'Filter by role (optional)'
        },
        location_filter: {
          type: 'string',
          description: 'Filter by location (optional)'
        },
        skill_filter: {
          type: 'string',
          description: 'Filter by specific skill (optional)'
        },
        availability_filter: {
          type: 'string',
          enum: ['available', 'on-request', 'unavailable'],
          description: 'Filter by availability status (optional)'
        },
        search: {
          type: 'string',
          description: 'Search by name, role, location, or skills (optional)'
        }
      },
      required: []
    }
  },
  {
    name: 'getResourceDetail',
    description: 'Get detailed information about a specific resource including profile, skills, and work history',
    inputSchema: {
      type: 'object',
      properties: {
        resource_id: {
          type: 'number',
          description: 'The ID of the resource to get details for (obtained from browseResources)'
        }
      },
      required: ['resource_id']
    }
  },
  {
    name: 'createBid',
    description: 'Create a new bid on an offer (requires authentication)',
    inputSchema: {
      type: 'object',
      properties: {
        offer_id: {
          type: 'number',
          description: 'The ID of the offer to bid on'
        },
        proposal: {
          type: 'string',
          description: 'Your bid proposal describing how you will complete the project'
        },
        proposed_budget: {
          type: 'number',
          description: 'Your proposed budget for the project (optional)'
        },
        proposed_timeline: {
          type: 'string',
          description: 'Your proposed timeline for completion (optional)'
        },
        why_choose_us: {
          type: 'string', 
          description: 'Why the client should choose your team (optional)'
        },
        approach: {
          type: 'string',
          description: 'Your technical/methodological approach (optional)'
        },
        questions: {
          type: 'array',
          items: { type: 'string' },
          description: 'Any questions you have about the project (optional)'
        }
      },
      required: ['offer_id', 'proposal']
    }
  },
  {
    name: 'browseTeams',
    description: 'Browse available teams in the marketplace',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of teams to return (default: 10)'
        },
        offset: {
          type: 'number',
          description: 'Number of teams to skip for pagination (default: 0)'
        },
        skills_filter: {
          type: 'array',
          items: { type: 'string' },
          description: 'Filter by skills (optional)'
        },
        location_filter: {
          type: 'string',
          description: 'Filter by location (optional)'
        },
        availability_filter: {
          type: 'string',
          enum: ['available', 'busy', 'unavailable'],
          description: 'Filter by availability status (optional)'
        },
        remote_work_filter: {
          type: 'boolean',
          description: 'Filter by remote work capability (optional)'
        },
        search: {
          type: 'string',
          description: 'Search by team name or description (optional)'
        }
      },
      required: []
    }
  },
  {
    name: 'getTeamDetail',
    description: 'Get detailed information about a specific team including members, skills, and contact information',
    inputSchema: {
      type: 'object',
      properties: {
        team_id: {
          type: 'number',
          description: 'The ID of the team to get details for (obtained from browseTeams)'
        }
      },
      required: ['team_id']
    }
  }
];

// --- WebSocket Handler ---
function handleWebSocket(socket: WebSocket) {
  socket.onopen = () => {
    console.log('WebSocket connection opened');
    
    // Send initial server info
    const serverInfo = {
      jsonrpc: '2.0',
      method: 'notifications/initialized',
      params: {
        protocolVersion: MCP_PROTOCOL_VERSION,
        capabilities: {
          tools: {}
        },
        serverInfo: {
          name: 'employable-profiles',
          version: '1.0.0'
        }
      }
    };
    
    socket.send(JSON.stringify(serverInfo));
  };

  socket.onmessage = async (event) => {
    try {
      const message = JSON.parse(event.data);
      console.log('Received message:', message);
      
      if (message.method === 'tools/list') {
        const response = {
          jsonrpc: '2.0',
          id: message.id,
          result: {
            tools: AVAILABLE_TOOLS
          }
        };
        socket.send(JSON.stringify(response));
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  };

  socket.onclose = () => {
    console.log('WebSocket connection closed');
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
}

// --- Authentication ---
interface AuthResult {
  userId: string;
  scopes: string[];
  sessionToken?: string; // Store the original session token for user-authenticated queries
}

// Helper function to create a user-authenticated Supabase client
async function createUserAuthenticatedClient(sessionToken?: string) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!
  );
  
  if (sessionToken) {
    // Set the session for user-authenticated operations
    await supabase.auth.setSession({
      access_token: sessionToken,
      refresh_token: ''
    });
  }
  
  return supabase;
}

async function authenticateRequest(req: Request): Promise<AuthResult | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Try Supabase session token validation first
    try {
      const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
      if (!userError && user) {
        console.log('Supabase session token validated for user:', user.id);
        return { userId: user.id, scopes: ['*'], sessionToken: token };
      }
    } catch (error) {
      console.log('Supabase session validation failed:', error);
    }

    // Try JWT validation for custom MCP tokens (have dots)
    if (token.includes('.')) {
      try {
        // Simple JWT payload extraction (not validating signature for now)
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          if (payload.user_id && payload.token_type === 'mcp') {
            console.log('JWT token validated for user:', payload.user_id);
            return { userId: payload.user_id, scopes: ['*'] };
          }
        }
      } catch (error) {
        console.log('JWT parsing failed:', error);
      }
    }

    // Fall back to database token lookup for hash-based tokens
    const { data: tokenData, error } = await supabaseAdmin
      .from('mcp_tokens')
      .select('user_id, expires_at')
      .eq('token', token)
      .single();

    if (error || !tokenData) {
      console.log('Token validation failed:', error);
      return null;
    }

    // Check if token is expired
    if (tokenData.expires_at && new Date(tokenData.expires_at) < new Date()) {
      console.log('Token expired');
      return null;
    }

    return {
      userId: tokenData.user_id,
      scopes: ['*']
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

function hasPermission(authResult: AuthResult, requiredScope: string): boolean {
  return authResult.scopes.includes(requiredScope) || authResult.scopes.includes('*');
}

// --- Main Handler ---
serve(async (req) => {
  const url = new URL(req.url);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // Handle WebSocket upgrade
  if (req.headers.get('upgrade') === 'websocket') {
    const { socket, response } = Deno.upgradeWebSocket(req);
    handleWebSocket(socket);
    return response;
  }

  // --- MCP Tool Discovery ---
  // On GET /, return the list of available tools (no auth required)
  if (req.method === 'GET' && url.pathname === '/') {
    console.log('[DEBUG] GET request for tools list, returning', AVAILABLE_TOOLS.length, 'tools');
    const responseBody = {
      tools: AVAILABLE_TOOLS,
    };
    return new Response(JSON.stringify(responseBody), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Multi-Client-Proxy-Protocol': `v${MCP_PROTOCOL_VERSION}`,
      },
    });
  }

  // --- MCP Service Execution ---
  // On POST / or /mcp-server, execute the requested service
  if (req.method === 'POST' && (url.pathname === '/' || url.pathname === '/mcp-server')) {
    console.log('[DEBUG] Processing POST request to', url.pathname);
    let requestBody;
    try {
      const bodyText = await req.text();
      console.log('[DEBUG] Request body text length:', bodyText.length);
      if (!bodyText.trim()) {
        console.log('[DEBUG] Empty request body detected');
        return new Response(JSON.stringify({ error: 'Empty request body' }), { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
        });
      }
      requestBody = JSON.parse(bodyText);
      console.log('[DEBUG] Successfully parsed JSON body:', requestBody);
    } catch (error) {
      console.error('[DEBUG] Invalid JSON in request body:', error);
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
      });
    }
    
    // Handle JSON-RPC format (used by Cursor MCP)
    if (requestBody.jsonrpc && requestBody.method) {
      console.log('[DEBUG] Handling JSON-RPC request:', requestBody.method);
      
      // Handle initialize request (no auth required)
      if (requestBody.method === 'initialize') {
        const response = {
          jsonrpc: '2.0',
          id: requestBody.id,
          result: {
            protocolVersion: MCP_PROTOCOL_VERSION,
            capabilities: {
              tools: {},
              prompts: {},
              resources: {},
              logging: {}
            },
            serverInfo: {
              name: 'employable-agents',
              version: '1.0.0'
            }
          }
        };
        return new Response(JSON.stringify(response), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
      
      // Handle notifications/initialized (no auth required, no response needed)
      if (requestBody.method === 'notifications/initialized') {
        return new Response(null, {
          status: 204,
          headers: { 'Access-Control-Allow-Origin': '*' }
        });
      }
      
      // Handle tools/list request (no auth required)
      if (requestBody.method === 'tools/list') {
        console.log('[DEBUG] Returning tools list:', AVAILABLE_TOOLS.length, 'tools');
        const response = {
          jsonrpc: '2.0',
          id: requestBody.id,
          result: {
            tools: AVAILABLE_TOOLS
          }
        };
        return new Response(JSON.stringify(response), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
      
      // Handle tools/call requests
      if (requestBody.method === 'tools/call') {
        const toolName = requestBody.params?.name;
        const toolArgs = requestBody.params?.arguments || {};
        
        // Convert JSON-RPC format to internal format and continue with tool handling
        requestBody.serviceName = toolName;
        requestBody.parameters = toolArgs;
        requestBody.isJsonRpc = true;
        requestBody.jsonRpcId = requestBody.id;
        
        // Fall through to tool handling logic below
      } else {
        // Unknown JSON-RPC method
        const errorResponse = {
          jsonrpc: '2.0',
          id: requestBody.id,
          error: {
            code: -32601,
            message: 'Method not found'
          }
        };
        return new Response(JSON.stringify(errorResponse), {
          status: 404,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }
    
    // Handle both JSON-RPC and legacy custom format
    const { serviceName, parameters, isJsonRpc, jsonRpcId } = requestBody;

    // --- Secure services that require authentication ---
    if (serviceName === 'getMyProfile') {
      const authResult = await authenticateRequest(req);

      if (!authResult) {
        return new Response(JSON.stringify({ error: 'Authentication failed. Please check your token.' }), { 
          status: 401, 
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
        });
      }

      if (!hasPermission(authResult, 'profile:read')) {
        return new Response(JSON.stringify({ error: 'Your token does not have permission to perform this action.' }), { 
          status: 403, 
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
        });
      }

      try {
        const supabaseAdmin = createClient(
          Deno.env.get('SUPABASE_URL')!,
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );
        const { data, error } = await supabaseAdmin.from('profiles').select('*').eq('id', authResult.userId).single();
        if (error) throw error;
        
        const formattedProfile = `
Your Employable Profile:
Name: ${data.full_name || 'Not provided'}
Email: ${data.username}
Bio: ${data.bio || 'Not provided'}
Website: ${data.website || 'Not provided'}
Company: ${data.company_name || 'Not provided'}
        `.trim();

        // Format response based on request type
        const responseData = isJsonRpc 
          ? {
              jsonrpc: '2.0',
              id: jsonRpcId,
              result: {
                content: [{ type: 'text', text: formattedProfile }]
              }
            }
          : { content: formattedProfile };

        return new Response(JSON.stringify(responseData), { 
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Could not retrieve profile.' }), { 
          status: 404, 
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
        });
      }
    }

    if (serviceName === 'updateMyProfile') {
      const authResult = await authenticateRequest(req);

      if (!authResult) {
        return new Response(JSON.stringify({ error: 'Authentication failed. Please check your token.' }), { 
          status: 401, 
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
        });
      }

      if (!hasPermission(authResult, 'profile:read')) {
        return new Response(JSON.stringify({ error: 'Your token does not have permission to perform this action.' }), { 
          status: 403, 
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
        });
      }

      try {
        const supabaseAdmin = createClient(
          Deno.env.get('SUPABASE_URL')!,
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

        // Extract update fields from parameters
        const updateData: any = {};
        if (parameters?.bio !== undefined) updateData.bio = parameters.bio;
        if (parameters?.company_name !== undefined) updateData.company_name = parameters.company_name;
        if (parameters?.website !== undefined) updateData.website = parameters.website;

        if (Object.keys(updateData).length === 0) {
          return new Response(JSON.stringify({ error: 'No valid fields provided for update.' }), { 
            status: 400, 
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
          });
        }

        // Update the profile
        const { data, error } = await supabaseAdmin
          .from('profiles')
          .update(updateData)
          .eq('id', authResult.userId)
          .select()
          .single();

        if (error) throw error;
        
        const successMessage = `Profile updated successfully! Updated fields: ${Object.keys(updateData).join(', ')}`;
        
        // Format response based on request type
        const responseData = isJsonRpc 
          ? {
              jsonrpc: '2.0',
              id: jsonRpcId,
              result: {
                content: [{ type: 'text', text: successMessage }]
              }
            }
          : { content: successMessage };

        return new Response(JSON.stringify(responseData), { 
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
        });
      } catch (error) {
        console.error('Error updating profile:', error);
        return new Response(JSON.stringify({ error: 'Could not update profile.' }), { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
        });
      }
    }
      
    if (serviceName === 'getProfile') {
      const targetUsername = parameters?.username;
      if (!targetUsername) {
        return new Response(JSON.stringify({ error: 'Username is required to fetch a profile.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }

      try {
        // Use the public anon key for this query
        const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('username, full_name, avatar_url, bio, website, company_name, ( select role, location, skills from resources where resources.profile_id = profiles.id )')
          .eq('username', targetUsername)
          .eq('mcp_enabled', true) // <-- The important security check
          .single();

        if (error) {
          // Do not throw error, which could leak user existence.
          return new Response(JSON.stringify({ error: 'Profile not found or MCP access is disabled.' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
        }
        
        // Format the data for the client
        const resource = data.resources && data.resources.length > 0 ? data.resources[0] : {};
        const formattedProfile = `
          User Profile for ${data.full_name || data.username}:
          Bio: ${data.bio || 'Not provided.'}
          Website: ${data.website || 'Not provided.'}
          Role: ${resource.role || 'Not provided.'}
          Location: ${resource.location || 'Not provided.'}
          Skills: ${(resource.skills || []).join(', ')}
        `.trim();
        
        // Format response based on request type
        const responseData = isJsonRpc 
          ? {
              jsonrpc: '2.0',
              id: jsonRpcId,
              result: {
                content: [{ type: 'text', text: formattedProfile }]
              }
            }
          : { content: formattedProfile };

        return new Response(JSON.stringify(responseData), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });

      } catch (error) {
        console.error('Error in getProfile:', error);
        return new Response(JSON.stringify({ error: 'An internal error occurred.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      }
    }
    
    if (serviceName === 'browseOffers') {
      try {
        // Use the public anon key for this query
        const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!);
        
        const limit = parameters?.limit || 10;
        const offset = parameters?.offset || 0;
        
        const { data, error } = await supabase
          .from('offers')
          .select(`
            id,
            title,
            description,
            status,
            budget_min,
            budget_max,
            budget_type,
            created_at,
            created_by,
            offer_type,
            client_offers (
              objectives,
              success_criteria,
              deliverables,
              required_skills,
              preferred_skills,
              project_type,
              technical_requirements,
              timeline,
              start_date,
              deadline,
              estimated_duration,
              team_size_preference,
              experience_level,
              communication_style,
              project_management_style
            )
          `)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) throw error;
        
        if (!data || data.length === 0) {
          const noOffersMessage = 'No job offers are currently available in the marketplace.';
          
          // Format response based on request type
          const responseData = isJsonRpc 
            ? {
                jsonrpc: '2.0',
                id: jsonRpcId,
                result: {
                  content: [{ type: 'text', text: noOffersMessage }]
                }
              }
            : { content: noOffersMessage };

          return new Response(JSON.stringify(responseData), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        }
        
        // Format the offers for display
        const formattedOffers = data.map((offer, index) => {
          const budget = offer.budget_min && offer.budget_max 
            ? `$${offer.budget_min} - $${offer.budget_max} (${offer.budget_type || 'fixed'})`
            : offer.budget_min 
            ? `$${offer.budget_min}+ (${offer.budget_type || 'budget'})`
            : 'Budget negotiable';
            
          return `
${index + 1}. ${offer.title}
   Budget: ${budget}
   Description: ${offer.description.substring(0, 150)}${offer.description.length > 150 ? '...' : ''}
   Posted: ${new Date(offer.created_at).toLocaleDateString()}
   Offer ID: ${offer.id}
          `.trim();
        }).join('\n\n');
        
        const offersMessage = `Available Job Offers (${data.length} found):\n\n${formattedOffers}`;
        
        // Format response based on request type
        const responseData = isJsonRpc 
          ? {
              jsonrpc: '2.0',
              id: jsonRpcId,
              result: {
                content: [{ type: 'text', text: offersMessage }]
              }
            }
          : { content: offersMessage };

        return new Response(JSON.stringify(responseData), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });

      } catch (error) {
        console.error('Error in browseOffers:', error);
        
        const errorMessage = 'An error occurred while browsing offers.';
        
        // Format response based on request type
        const responseData = isJsonRpc 
          ? {
              jsonrpc: '2.0',
              id: jsonRpcId,
              error: {
                code: -32603,
                message: errorMessage
              }
            }
          : { error: errorMessage };

        return new Response(JSON.stringify(responseData), { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
        });
      }
    }

    if (serviceName === 'getOfferDetail') {
      console.log('[DEBUG] getOfferDetail handler called with parameters:', parameters);
      try {
        const offerId = parameters?.offer_id;
        if (!offerId) {
          return new Response(JSON.stringify({ error: 'Offer ID is required.' }), { 
            status: 400, 
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
          });
        }

        // Use the public anon key for this query
        const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!);
        
        console.log('[DEBUG] About to fetch offer with ID:', offerId);
        
        // Fetch offer details - using same simple pattern as UI
        const { data: offerData, error: offerError } = await supabase
          .from('offers')
          .select('*')
          .eq('id', offerId)
          .eq('status', 'active')
          .eq('visibility', 'public')
          .single();

        console.log('[DEBUG] Database query result:', { offerData, offerError });

        if (offerError || !offerData) {
          return new Response(JSON.stringify({ error: 'Offer not found or not available.' }), { 
            status: 404, 
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
          });
        }

        // Fetch bids for this offer
        const { data: bidsData, error: bidsError } = await supabase
          .from('bids')
          .select('*')
          .eq('offer_id', offerId)
          .order('created_at', { ascending: false });

        if (bidsError) {
          console.error('Failed to fetch bids:', bidsError);
        }

        const bids = bidsData || [];

        // Format budget display
        const formatBudget = () => {
          if (offerData.budget_min && offerData.budget_max) {
            return `$${offerData.budget_min.toLocaleString()} - $${offerData.budget_max.toLocaleString()}`;
          } else if (offerData.budget_min) {
            return `From $${offerData.budget_min.toLocaleString()}`;
          } else if (offerData.budget_max) {
            return `Up to $${offerData.budget_max.toLocaleString()}`;
          }
          return 'Budget not specified';
        };

        // Build detailed offer information
        let offerDetails = `
📋 OFFER DETAILS

Title: ${offerData.title}
Type: ${offerData.offer_type === 'client_offer' ? 'Client Looking for Team' : 'Team Offering Services'}
Budget: ${formatBudget()} (${offerData.budget_type || 'negotiable'})
Posted: ${new Date(offerData.created_at).toLocaleDateString()}
Status: ${offerData.status}
Offer ID: ${offerData.id}

Description:
${offerData.description}
        `.trim();

        // Add offer-type specific note (detailed info is in the description)
        if (offerData.offer_type === 'client_offer') {
          offerDetails += `\n\n🎯 PROJECT REQUIREMENTS\n`;
          offerDetails += `This is a client offer looking for a team. Detailed requirements, objectives, and skills are included in the description above.`;
        }

        if (offerData.offer_type === 'team_offer') {
          offerDetails += `\n\n👥 TEAM INFORMATION\n`;
          offerDetails += `This is a team offering services. Detailed service offerings, team composition, and capabilities are included in the description above.`;
        }

        if (offerData.location_preference) {
          offerDetails += `\n\n📍 Location Preference: ${offerData.location_preference}`;
        }

        // Add bids section
        offerDetails += `\n\n💼 BIDS (${bids.length} total)\n`;
        
        if (bids.length === 0) {
          offerDetails += `\nNo bids have been submitted yet.`;
        } else {
          bids.slice(0, 5).forEach((bid, index) => {
            offerDetails += `\n${index + 1}. Bid #${bid.id}`;
            if (bid.proposed_budget) {
              offerDetails += ` - $${bid.proposed_budget.toLocaleString()}`;
            }
            offerDetails += `\n   Submitted: ${new Date(bid.created_at).toLocaleDateString()}`;
            offerDetails += `\n   Status: ${bid.status}`;
            if (bid.proposal) {
              const shortProposal = bid.proposal.length > 100 ? bid.proposal.substring(0, 100) + '...' : bid.proposal;
              offerDetails += `\n   Proposal: ${shortProposal}`;
            }
            if (bid.proposed_timeline) {
              offerDetails += `\n   Timeline: ${bid.proposed_timeline}`;
            }
            offerDetails += '\n';
          });

          if (bids.length > 5) {
            offerDetails += `\n... and ${bids.length - 5} more bids`;
          }
        }

        // Format response based on request type
        const responseData = isJsonRpc 
          ? {
              jsonrpc: '2.0',
              id: jsonRpcId,
              result: {
                content: [{ type: 'text', text: offerDetails }]
              }
            }
          : { content: offerDetails };

        return new Response(JSON.stringify(responseData), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });

      } catch (error) {
        console.error('Error in getOfferDetail:', error);
        
        const errorMessage = 'An error occurred while fetching offer details.';
        
        // Format response based on request type
        const responseData = isJsonRpc 
          ? {
              jsonrpc: '2.0',
              id: jsonRpcId,
              error: {
                code: -32603,
                message: errorMessage
              }
            }
          : { error: errorMessage };

        return new Response(JSON.stringify(responseData), { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
        });
      }
    }

    if (serviceName === 'createOffer') {
      const authResult = await authenticateRequest(req);

      if (!authResult) {
        return new Response(JSON.stringify({ error: 'Authentication failed. Please check your token.' }), { 
          status: 401, 
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
        });
      }

      if (!hasPermission(authResult, 'offer:create')) {
        return new Response(JSON.stringify({ error: 'Your token does not have permission to create offers.' }), { 
          status: 403, 
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
        });
      }

      try {
        const { title, description, offer_type, team_id, objectives, required_skills, services_offered, 
                budget_min, budget_max, budget_type, team_size, experience_level } = parameters || {};

        // Validate required fields
        if (!title || !description || !offer_type || !team_id) {
          return new Response(JSON.stringify({ error: 'Missing required fields: title, description, offer_type, and team_id are required.' }), { 
            status: 400, 
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
          });
        }

        if (!['client_offer', 'team_offer'].includes(offer_type)) {
          return new Response(JSON.stringify({ error: 'Invalid offer_type. Must be either "client_offer" or "team_offer".' }), { 
            status: 400, 
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
          });
        }

        // Validate offer-type specific requirements
        if (offer_type === 'client_offer') {
          if (!objectives || !Array.isArray(objectives) || objectives.length === 0) {
            return new Response(JSON.stringify({ error: 'Client offers require at least one objective.' }), { 
              status: 400, 
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
            });
          }
          if (!required_skills || !Array.isArray(required_skills) || required_skills.length === 0) {
            return new Response(JSON.stringify({ error: 'Client offers require at least one required skill.' }), { 
              status: 400, 
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
            });
          }
        }

        if (offer_type === 'team_offer') {
          if (!services_offered || !Array.isArray(services_offered) || services_offered.length === 0) {
            return new Response(JSON.stringify({ error: 'Team offers require at least one service offered.' }), { 
              status: 400, 
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
            });
          }
        }

        // Use service role for database operations and pass user ID explicitly
        const supabaseAdmin = createClient(
          Deno.env.get('SUPABASE_URL')!,
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

        // Validate team membership (team_id is now required)
        const { data: teamMember, error: teamError } = await supabaseAdmin
          .from('team_members')
          .select('team_id')
          .eq('team_id', team_id)
          .eq('user_id', authResult.userId)
          .single();

        if (teamError || !teamMember) {
          return new Response(JSON.stringify({ error: 'You are not a member of the specified team.' }), { 
            status: 403, 
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
          });
        }

        let offerId: number;

        if (offer_type === 'client_offer') {
          // Insert directly into the database tables with explicit user ID
          const { data: offerData, error: offerError } = await supabaseAdmin
            .from('offers')
            .insert({
              title,
              description,
              offer_type: 'client_offer',
              created_by: authResult.userId,
              team_id: team_id || null,
              budget_min: budget_min || null,
              budget_max: budget_max || null,
              budget_type: budget_type || 'negotiable',
              status: 'active',
              visibility: 'public'
            })
            .select('id')
            .single();

          if (offerError) throw offerError;
          offerId = offerData.id;

          // Insert client-specific details
          const { error: clientError } = await supabaseAdmin
            .from('client_offers')
            .insert({
              offer_id: offerId,
              objectives,
              required_skills
            });

          if (clientError) throw clientError;
        } else {
          // Insert directly into the database tables for team offers
          const { data: offerData, error: offerError } = await supabaseAdmin
            .from('offers')
            .insert({
              title,
              description,
              offer_type: 'team_offer',
              created_by: authResult.userId,
              team_id: team_id || null,
              status: 'active',
              visibility: 'public'
            })
            .select('id')
            .single();

          if (offerError) throw offerError;
          offerId = offerData.id;

          // Insert team-specific details
          const { error: teamError } = await supabaseAdmin
            .from('team_offers')
            .insert({
              offer_id: offerId,
              services_offered,
              team_size: team_size || null,
              experience_level: experience_level || 'mid'
            });

          if (teamError) throw teamError;
        }

        const successMessage = `✅ Offer created successfully!

Offer Details:
- Title: ${title}
- Type: ${offer_type === 'client_offer' ? 'Client Offer (Looking for Team)' : 'Team Offer (Offering Services)'}
- Offer ID: ${offerId}
- Status: Active
${budget_min || budget_max ? `- Budget: ${budget_min && budget_max ? `$${budget_min} - $${budget_max}` : budget_min ? `From $${budget_min}` : `Up to $${budget_max}`} (${budget_type || 'negotiable'})` : ''}

Your offer is now live in the marketplace and can be discovered by ${offer_type === 'client_offer' ? 'teams and service providers' : 'clients looking for services'}.`;

        // Format response based on request type
        const responseData = isJsonRpc 
          ? {
              jsonrpc: '2.0',
              id: jsonRpcId,
              result: {
                content: [{ type: 'text', text: successMessage }]
              }
            }
          : { content: successMessage };

        return new Response(JSON.stringify(responseData), { 
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
        });

      } catch (error) {
        console.error('Error creating offer:', error);
        
        const errorMessage = 'An error occurred while creating the offer. Please try again.';
        
        // Format response based on request type
        const responseData = isJsonRpc 
          ? {
              jsonrpc: '2.0',
              id: jsonRpcId,
              error: {
                code: -32603,
                message: errorMessage
              }
            }
          : { error: errorMessage };

        return new Response(JSON.stringify(responseData), { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
        });
      }
    }

    if (serviceName === 'getMyTeams') {
      try {
        // This operation requires authentication
        const authResult = await authenticateRequest(req);
        if (!authResult) {
          throw new Error('Authentication required to get your teams');
        }

        // Use environment variables for Supabase configuration
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        // Get user's teams by joining with team_members (using service role for this specific query)
        const supabaseAdmin = createClient(
          supabaseUrl,
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
        );

        const { data: userTeams, error } = await supabaseAdmin
          .from('team_members')
          .select(`
            team_id,
            teams:team_id (
              id,
              name,
              owner_id
            )
          `)
          .eq('user_id', authResult.userId);

        if (error) {
          throw error;
        }

        let teamsInfo = '';
        if (!userTeams || userTeams.length === 0) {
          teamsInfo = '📋 MY TEAMS\n\nYou are not a member of any teams yet.\n\nTo create team-based offers, you need to either:\n1. Create a new team\n2. Join an existing team\n\nFor now, you can only create individual offers.';
        } else {
          teamsInfo = `📋 MY TEAMS (${userTeams.length} total)\n\n`;
          userTeams.forEach((membership: any, index: number) => {
            const team = membership.teams;
            teamsInfo += `${index + 1}. ${team.name}`;
            if (team.owner_id === authResult.userId) {
              teamsInfo += ' (Owner)';
            }
            teamsInfo += `\n   Team ID: ${team.id}\n`;
            if (index < userTeams.length - 1) teamsInfo += '\n';
          });
          teamsInfo += '\n\n💡 When creating offers, you can specify a team_id to create the offer on behalf of that team.';
        }

        const responseData = isJsonRpc 
          ? {
              jsonrpc: '2.0',
              id: jsonRpcId,
              result: {
                content: [{ type: 'text', text: teamsInfo }]
              }
            }
          : { content: teamsInfo };

        return new Response(JSON.stringify(responseData), { 
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
        });

      } catch (error) {
        console.error('Error getting user teams:', error);
        
        const errorMessage = 'An error occurred while retrieving your teams. Please try again.';
        
        const responseData = isJsonRpc 
          ? {
              jsonrpc: '2.0',
              id: jsonRpcId,
              error: {
                code: -32603,
                message: errorMessage
              }
            }
          : { error: errorMessage };

        return new Response(JSON.stringify(responseData), { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
        });
      }
    }

    if (serviceName === 'browseResources') {
      try {
        const { limit = 10, offset = 0, role_filter, location_filter, skill_filter, availability_filter, search } = parameters || {};

        // Use public anon key for this query (no auth required)
        const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!);
        
        // Build query with filters
        let query = supabase
          .from('resources')
          .select(`
            id,
            name,
            role,
            skills,
            location,
            profile_id,
            profile:profiles (
              full_name,
              username,
              hourly_rate,
              availability,
              bio
            )
          `)
          .order('name', { ascending: true });

        // Apply filters
        if (role_filter) {
          query = query.eq('role', role_filter);
        }
        if (location_filter) {
          query = query.eq('location', location_filter);
        }
        if (skill_filter) {
          query = query.contains('skills', [skill_filter]);
        }
        if (availability_filter) {
          query = query.eq('profile.availability', availability_filter);
        }
        if (search) {
          // For search, we'll need to use a more complex query
          query = query.or(`name.ilike.%${search}%,role.ilike.%${search}%,location.ilike.%${search}%`);
        }

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        const { data: resources, error } = await query;

        if (error) {
          throw error;
        }

        // Format response
        let resourcesList = `Available Resources (${resources?.length || 0} found):\n\n`;
        
        if (!resources || resources.length === 0) {
          resourcesList += 'No resources found matching your criteria.';
        } else {
          resources.forEach((resource: any, index: number) => {
            const profile = resource.profile;
            const displayName = profile?.full_name || resource.name;
            const rate = profile?.hourly_rate ? `$${profile.hourly_rate}/hr` : 'Rate not specified';
            const availability = profile?.availability || 'Not specified';
            const skillsDisplay = resource.skills?.slice(0, 3).join(', ') || 'No skills listed';
            const moreSkills = resource.skills?.length > 3 ? ` (+${resource.skills.length - 3} more)` : '';

            resourcesList += `${index + 1}. ${displayName}\n`;
            resourcesList += `   Role: ${resource.role}\n`;
            resourcesList += `   Rate: ${rate}\n`;
            resourcesList += `   Availability: ${availability}\n`;
            resourcesList += `   Location: ${resource.location}\n`;
            resourcesList += `   Skills: ${skillsDisplay}${moreSkills}\n`;
            if (profile?.bio) {
              const shortBio = profile.bio.length > 100 ? `${profile.bio.substring(0, 100)}...` : profile.bio;
              resourcesList += `   Bio: ${shortBio}\n`;
            }
            resourcesList += `   Resource ID: ${resource.id}\n\n`;
          });
        }

        // Format response based on request type
        const responseData = isJsonRpc 
          ? {
              jsonrpc: '2.0',
              id: jsonRpcId,
              result: {
                content: [{ type: 'text', text: resourcesList }]
              }
            }
          : { content: resourcesList };

        return new Response(JSON.stringify(responseData), { 
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
        });

      } catch (error) {
        console.error('Error browsing resources:', error);
        
        const errorMessage = 'An error occurred while browsing resources.';
        
        const responseData = isJsonRpc 
          ? {
              jsonrpc: '2.0',
              id: jsonRpcId,
              error: {
                code: -32603,
                message: errorMessage
              }
            }
          : { error: errorMessage };

        return new Response(JSON.stringify(responseData), { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
        });
      }
    }

    if (serviceName === 'getResourceDetail') {
      try {
        const resourceId = parameters?.resource_id;
        if (!resourceId) {
          return new Response(JSON.stringify({ error: 'Resource ID is required.' }), { 
            status: 400, 
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
          });
        }

        // Use public anon key for this query (no auth required)
        const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!);
        
        // Fetch resource with full profile details
        const { data: resourceData, error: resourceError } = await supabase
          .from('resources')
          .select(`
            *,
            profile:profiles (
              full_name,
              username,
              hourly_rate,
              availability,
              bio,
              linkedin_url,
              github_url,
              website,
              company_name
            )
          `)
          .eq('id', resourceId)
          .single();

        if (resourceError || !resourceData) {
          return new Response(JSON.stringify({ error: 'Resource not found.' }), { 
            status: 404, 
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
          });
        }

        const profile = resourceData.profile;
        const displayName = profile?.full_name || resourceData.name;

        // Build detailed resource information
        let resourceDetails = `
👤 RESOURCE PROFILE

Name: ${displayName}
Role: ${resourceData.role}
Location: ${resourceData.location}
Resource ID: ${resourceData.id}
        `.trim();

        // Add profile information
        if (profile) {
          resourceDetails += `\n\n💼 PROFESSIONAL INFO\n`;
          
          if (profile.hourly_rate) {
            resourceDetails += `Rate: $${profile.hourly_rate}/hr\n`;
          }
          
          if (profile.availability) {
            resourceDetails += `Availability: ${profile.availability}\n`;
          }
          
          if (profile.company_name) {
            resourceDetails += `Company: ${profile.company_name}\n`;
          }
          
          if (profile.website) {
            resourceDetails += `Website: ${profile.website}\n`;
          }
        }

        // Add skills
        if (resourceData.skills && resourceData.skills.length > 0) {
          resourceDetails += `\n\n🛠️ SKILLS\n`;
          resourceDetails += resourceData.skills.map((skill: string) => `• ${skill}`).join('\n');
        }

        // Add bio
        if (profile?.bio) {
          resourceDetails += `\n\n📝 ABOUT\n`;
          resourceDetails += profile.bio;
        }

        // Add work history
        if (resourceData.work_history && resourceData.work_history.length > 0) {
          resourceDetails += `\n\n💼 WORK EXPERIENCE\n`;
          resourceData.work_history.forEach((job: any, index: number) => {
            resourceDetails += `\n${index + 1}. ${job.title}`;
            if (job.company) resourceDetails += ` at ${job.company}`;
            if (job.dates) resourceDetails += ` (${job.dates})`;
            if (job.description) resourceDetails += `\n   ${job.description}`;
          });
        }

        // Add projects
        if (resourceData.projects && resourceData.projects.length > 0) {
          resourceDetails += `\n\n🚀 PROJECTS\n`;
          resourceData.projects.forEach((project: any, index: number) => {
            resourceDetails += `\n${index + 1}. ${project.name}`;
            if (project.description) resourceDetails += `\n   ${project.description}`;
            if (project.url) resourceDetails += `\n   URL: ${project.url}`;
          });
        }

        // Add portfolio links
        const links = [];
        if (profile?.linkedin_url) links.push(`LinkedIn: ${profile.linkedin_url}`);
        if (profile?.github_url) links.push(`GitHub: ${profile.github_url}`);
        if (resourceData.portfolio_urls && resourceData.portfolio_urls.length > 0) {
          resourceData.portfolio_urls.forEach((url: string, index: number) => {
            links.push(`Portfolio ${index + 1}: ${url}`);
          });
        }

        if (links.length > 0) {
          resourceDetails += `\n\n🔗 LINKS\n`;
          resourceDetails += links.join('\n');
        }

        // Format response based on request type
        const responseData = isJsonRpc 
          ? {
              jsonrpc: '2.0',
              id: jsonRpcId,
              result: {
                content: [{ type: 'text', text: resourceDetails }]
              }
            }
          : { content: resourceDetails };

        return new Response(JSON.stringify(responseData), { 
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
        });

      } catch (error) {
        console.error('Error getting resource detail:', error);
        
        const errorMessage = 'An error occurred while fetching resource details.';
        
        const responseData = isJsonRpc 
          ? {
              jsonrpc: '2.0',
              id: jsonRpcId,
              error: {
                code: -32603,
                message: errorMessage
              }
            }
          : { error: errorMessage };

        return new Response(JSON.stringify(responseData), { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
        });
      }
    }

    if (serviceName === 'browseTeams') {
      try {
        const { limit = 10, offset = 0, skills_filter, location_filter, availability_filter, remote_work_filter, search } = parameters || {};

        // Use public anon key for this query (no auth required)
        const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!);
        
        // Build query with filters - only show public teams
        let query = supabase
          .from('teams')
          .select(`
            id,
            name,
            description,
            skills,
            location,
            remote_work,
            team_size,
            hourly_rate_min,
            hourly_rate_max,
            availability,
            website,
            created_at,
            team_members (
              user_id,
              profiles (
                full_name,
                username,
                bio,
                role,
                github_url,
                linkedin_url
              )
            )
          `)
          .eq('public_profile', true)
          .order('updated_at', { ascending: false });

        // Apply filters
        if (skills_filter && skills_filter.length > 0) {
          query = query.overlaps('skills', skills_filter);
        }
        if (location_filter) {
          query = query.ilike('location', `%${location_filter}%`);
        }
        if (availability_filter) {
          query = query.eq('availability', availability_filter);
        }
        if (remote_work_filter !== undefined) {
          query = query.eq('remote_work', remote_work_filter);
        }
        if (search) {
          query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
        }

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        const { data: teams, error } = await query;

        if (error) {
          throw error;
        }

        // Format response
        let teamsList = `🏢 Available Teams (${teams?.length || 0} found):\n\n`;
        
        if (!teams || teams.length === 0) {
          teamsList += 'No teams found matching your criteria.';
        } else {
          teams.forEach((team: any, index: number) => {
            const memberCount = team.team_members?.length || 0;
            const rateInfo = team.hourly_rate_min && team.hourly_rate_max 
              ? `$${team.hourly_rate_min} - $${team.hourly_rate_max}/hr`
              : team.hourly_rate_min 
              ? `From $${team.hourly_rate_min}/hr`
              : team.hourly_rate_max
              ? `Up to $${team.hourly_rate_max}/hr`
              : 'Rate negotiable';
            
            const skillsDisplay = team.skills?.slice(0, 4).join(', ') || 'No skills listed';
            const moreSkills = team.skills?.length > 4 ? ` (+${team.skills.length - 4} more)` : '';
            
            teamsList += `${index + 1}. ${team.name}\n`;
            teamsList += `   Members: ${memberCount}`;
            if (team.team_size) teamsList += ` (target: ${team.team_size})`;
            teamsList += `\n`;
            teamsList += `   Rate: ${rateInfo}\n`;
            teamsList += `   Location: ${team.location}`;
            if (team.remote_work) teamsList += ` (Remote OK)`;
            teamsList += `\n`;
            if (team.availability) teamsList += `   Availability: ${team.availability}\n`;
            teamsList += `   Skills: ${skillsDisplay}${moreSkills}\n`;
            
            if (team.description) {
              const shortDesc = team.description.length > 120 ? `${team.description.substring(0, 120)}...` : team.description;
              teamsList += `   About: ${shortDesc}\n`;
            }
            
            if (team.website) {
              teamsList += `   Website: ${team.website}\n`;
            }
            
            teamsList += `   Team ID: ${team.id}\n\n`;
          });
          
          teamsList += `💡 Use getTeamDetail with a Team ID to see full team information and member details.`;
        }

        // Format response based on request type
        const responseData = isJsonRpc 
          ? {
              jsonrpc: '2.0',
              id: jsonRpcId,
              result: {
                content: [{ type: 'text', text: teamsList }]
              }
            }
          : { content: teamsList };

        return new Response(JSON.stringify(responseData), { 
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
        });

      } catch (error) {
        console.error('Error browsing teams:', error);
        
        const errorMessage = 'An error occurred while browsing teams.';
        
        const responseData = isJsonRpc 
          ? {
              jsonrpc: '2.0',
              id: jsonRpcId,
              error: {
                code: -32603,
                message: errorMessage
              }
            }
          : { error: errorMessage };

        return new Response(JSON.stringify(responseData), { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
        });
      }
    }

    if (serviceName === 'getTeamDetail') {
      try {
        const { team_id } = parameters || {};

        if (!team_id) {
          throw new Error('team_id is required');
        }

        // Use environment variables for Supabase configuration
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        
        // Get detailed team information
        const { data: team, error } = await supabase
          .from('teams')
          .select(`
            id,
            name,
            description,
            skills,
            location,
            remote_work,
            team_size,
            hourly_rate_min,
            hourly_rate_max,
            availability,
            website,
            created_at,
            updated_at,
            owner_id,
            team_members (
              user_id,
              profiles (
                full_name,
                username,
                bio,
                role,
                github_url,
                linkedin_url
              )
            )
          `)
          .eq('id', team_id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            throw new Error('Team not found or not publicly accessible');
          }
          throw error;
        }

        // Format detailed team information
        const memberCount = team.team_members?.length || 0;
        const rateInfo = team.hourly_rate_min && team.hourly_rate_max 
          ? `$${team.hourly_rate_min} - $${team.hourly_rate_max}/hr`
          : team.hourly_rate_min 
          ? `From $${team.hourly_rate_min}/hr`
          : team.hourly_rate_max
          ? `Up to $${team.hourly_rate_max}/hr`
          : 'Rate negotiable';

        let teamDetail = `🏢 TEAM DETAILS

📋 ${team.name}
${team.description || 'No description provided'}

👥 TEAM COMPOSITION
Members: ${memberCount}`;
        
        if (team.team_size) {
          teamDetail += ` (target size: ${team.team_size})`;
        }
        
        teamDetail += `
Rate: ${rateInfo}
Location: ${team.location || 'Not specified'}`;
        
        if (team.remote_work) {
          teamDetail += ` (Remote work available)`;
        }
        
        if (team.availability) {
          teamDetail += `
Availability: ${team.availability}`;
        }

        // Skills section
        if (team.skills && team.skills.length > 0) {
          teamDetail += `\n\n🛠️ TEAM SKILLS
${team.skills.join(', ')}`;
        }

        // Team owner section (simplified for now)
        teamDetail += `\n\n👤 TEAM OWNER
Owner ID: ${team.owner_id}`;

        // Team members section
        if (team.team_members && team.team_members.length > 0) {
          teamDetail += `\n\n👥 TEAM MEMBERS (${team.team_members.length})`;
          team.team_members.forEach((member: any, index: number) => {
            const profile = member.profiles;
            if (profile) {
              teamDetail += `\n\n${index + 1}. ${profile.full_name || profile.username || 'Unknown Member'}`;
              if (profile.role) {
                teamDetail += ` - ${profile.role}`;
              }
              if (profile.bio) {
                const shortBio = profile.bio.length > 80 ? `${profile.bio.substring(0, 80)}...` : profile.bio;
                teamDetail += `\n   ${shortBio}`;
              }
              if (profile.github_url || profile.linkedin_url) {
                teamDetail += `\n   Links:`;
                if (profile.github_url) teamDetail += ` GitHub: ${profile.github_url}`;
                if (profile.linkedin_url) teamDetail += ` LinkedIn: ${profile.linkedin_url}`;
              }
            }
          });
        }

        // Contact information
        if (team.website) {
          teamDetail += `\n\n🌐 CONTACT
Website: ${team.website}`;
        }

        teamDetail += `\n\n📅 TEAM INFO
Created: ${new Date(team.created_at).toLocaleDateString()}
Last Updated: ${new Date(team.updated_at).toLocaleDateString()}
Team ID: ${team.id}

💡 To connect with this team, create an offer or browse their related offers in the marketplace.`;

        // Format response based on request type
        const responseData = isJsonRpc 
          ? {
              jsonrpc: '2.0',
              id: jsonRpcId,
              result: {
                content: [{ type: 'text', text: teamDetail }]
              }
            }
          : { content: teamDetail };

        return new Response(JSON.stringify(responseData), { 
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
        });

      } catch (error) {
        console.error('Error getting team detail:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'An error occurred while getting team details.';
        
        const responseData = isJsonRpc 
          ? {
              jsonrpc: '2.0',
              id: jsonRpcId,
              error: {
                code: -32603,
                message: errorMessage
              }
            }
          : { error: errorMessage };

        return new Response(JSON.stringify(responseData), { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
        });
      }
    }

    if (serviceName === 'createBid') {
      try {
        const { offer_id, proposal, proposed_budget, proposed_timeline, why_choose_us, approach, questions } = parameters || {};

        if (!offer_id || !proposal) {
          throw new Error('offer_id and proposal are required');
        }

        // This operation requires authentication
        const authResult = await authenticateRequest(req);
        if (!authResult) {
          throw new Error('Authentication required to create bids');
        }

        // Use service role key for authenticated operations that bypass RLS
          const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Verify the offer exists and is active
        const { data: offer, error: offerError } = await supabase
          .from('offers')
          .select('id, title, status, created_by')
          .eq('id', offer_id)
          .single();

        if (offerError || !offer) {
          throw new Error('Offer not found or not accessible');
        }

        if (offer.status !== 'active') {
          throw new Error(`Cannot bid on ${offer.status} offers`);
        }

        if (offer.created_by === authResult.userId) {
          throw new Error('Cannot bid on your own offers');
        }

        // Check if user already has an active bid on this offer (exclude rejected bids)
        const { data: existingBid } = await supabase
          .from('bids')
          .select('id, status')
          .eq('offer_id', offer_id)
          .eq('bidder_id', authResult.userId)
          .neq('status', 'rejected')
          .single();

        if (existingBid) {
          throw new Error('You already have a bid on this offer. Use updateBid to modify it.');
        }

        // Create the bid
        const bidData: any = {
          offer_id,
          bidder_id: authResult.userId,
          proposal,
          status: 'submitted'
        };

        // Add optional fields if provided
        if (proposed_budget !== undefined) bidData.proposed_budget = proposed_budget;
        if (proposed_timeline) bidData.proposed_timeline = proposed_timeline;
        if (why_choose_us) bidData.why_choose_us = why_choose_us;
        if (approach) bidData.approach = approach;
        if (questions && questions.length > 0) bidData.questions = questions;

        const { data: newBid, error: bidError } = await supabase
          .from('bids')
          .insert(bidData)
          .select()
          .single();

        if (bidError) {
          throw bidError;
        }

        const responseText = `✅ BID CREATED SUCCESSFULLY!

🎯 BID DETAILS
Offer: ${offer.title}
Bid ID: ${newBid.id}
Status: ${newBid.status}
${proposed_budget ? `Budget: $${proposed_budget}` : ''}
${proposed_timeline ? `Timeline: ${proposed_timeline}` : ''}

📝 PROPOSAL
${proposal}

${why_choose_us ? `\n💡 WHY CHOOSE US\n${why_choose_us}` : ''}
${approach ? `\n🔧 APPROACH\n${approach}` : ''}
${questions && questions.length > 0 ? `\n❓ QUESTIONS\n${questions.map((q: string, i: number) => `${i + 1}. ${q}`).join('\n')}` : ''}

📅 Created: ${new Date(newBid.created_at).toLocaleString()}

💡 Your bid is now submitted and visible to the offer creator. You can use updateBid to modify it before it's accepted.`;

        // Format response based on request type
        const responseData = isJsonRpc 
          ? {
              jsonrpc: '2.0',
              id: jsonRpcId,
              result: {
                content: [{ type: 'text', text: responseText }]
              }
            }
          : { content: responseText };

        return new Response(JSON.stringify(responseData), { 
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
        });

      } catch (error) {
        console.error('Error creating bid:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'An error occurred while creating the bid.';
        
        const responseData = isJsonRpc 
          ? {
              jsonrpc: '2.0',
              id: jsonRpcId,
              error: {
                code: -32603,
                message: errorMessage
              }
            }
          : { error: errorMessage };

        return new Response(JSON.stringify(responseData), { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
        });
      }
    }

    return new Response(JSON.stringify({ error: 'Service not found' }), { status: 404, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  }

  // --- SSE Endpoint for Cursor MCP ---
  if (req.method === 'GET' && url.pathname === '/sse') {
    const headers = new Headers({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    const stream = new ReadableStream({
      start(controller) {
        // Send initial server info
        const serverInfo = {
          jsonrpc: '2.0',
          method: 'notifications/initialized',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {}
            },
            serverInfo: {
              name: 'employable-profiles',
              version: '1.0.0'
            }
          }
        };
        
        controller.enqueue(`data: ${JSON.stringify(serverInfo)}\n\n`);
        
        // Keep connection alive
        const keepAlive = setInterval(() => {
          controller.enqueue(`data: {"jsonrpc": "2.0", "method": "notifications/ping"}\n\n`);
        }, 30000);
        
        // Cleanup on close
        return () => {
          clearInterval(keepAlive);
        };
      }
    });

    return new Response(stream, { headers });
  }

  return new Response('Not Found', { status: 404 });
});


