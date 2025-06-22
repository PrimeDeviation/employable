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
      required: ['title', 'description', 'offer_type']
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

    // Try JWT validation first for tokens that look like JWTs (have dots)
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

    // Fall back to database token lookup
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
  // On GET /, return the list of available tools
  if (req.method === 'GET' && url.pathname === '/') {
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
      
      // Handle tools/list request
      if (requestBody.method === 'tools/list') {
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
        const { title, description, offer_type, objectives, required_skills, services_offered, 
                budget_min, budget_max, budget_type, team_size, experience_level } = parameters || {};

        // Validate required fields
        if (!title || !description || !offer_type) {
          return new Response(JSON.stringify({ error: 'Missing required fields: title, description, and offer_type are required.' }), { 
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


