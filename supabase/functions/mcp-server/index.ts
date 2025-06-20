import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { v4 as uuidv4 } from "https://deno.land/std@0.168.0/uuid/mod.ts";

const MCP_PROTOCOL_VERSION = '2024-11-05';

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
            tools: [
              {
                name: 'getProfile',
                description: 'Retrieves a user\'s public Employable Agents profile, if they have enabled MCP access.',
                inputSchema: {
                  type: 'object',
                  properties: {
                    username: {
                      type: 'string',
                      description: 'The username of the Employable Agents profile to retrieve.',
                    },
                  },
                  required: ['username'],
                },
              },
              {
                name: 'getMyProfile',
                description: 'Retrieves the authenticated user\'s own full Employable Agents profile.',
                inputSchema: {
                  type: 'object',
                  properties: {},
                },
              },
              {
                name: 'updateMyProfile',
                description: 'Updates the authenticated user\'s own Employable Agents profile.',
                inputSchema: {
                  type: 'object',
                  properties: {
                    bio: {
                      type: 'string',
                      description: 'Professional bio',
                    },
                    company_name: {
                      type: 'string',
                      description: 'Company name',
                    },
                    website: {
                      type: 'string',
                      description: 'Website URL',
                    },
                  },
                },
              }
            ]
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

    // Validate the MCP token
    const { data: tokenData, error } = await supabaseAdmin
      .from('mcp_tokens')
      .select('user_id, scopes, expires_at')
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
      scopes: tokenData.scopes || []
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
      tools: [
        {
          name: 'getProfile',
          description: 'Retrieves a user\'s public Employable Agents profile, if they have enabled MCP access.',
          parameters: {
            type: 'object',
            properties: {
              username: {
                type: 'string',
                description: 'The username of the Employable Agents profile to retrieve.',
              },
            },
            required: ['username'],
          },
        },
        {
          name: 'getMyProfile',
          description: 'Retrieves the authenticated user\'s own full Employable Agents profile.',
          parameters: {},
        },
        {
          name: 'updateMyProfile',
          description: 'Updates the authenticated user\'s own Employable Agents profile.',
          parameters: {
            type: 'object',
            properties: {
              bio: {
                type: 'string',
                description: 'Professional bio',
              },
              company_name: {
                type: 'string',
                description: 'Company name',
              },
              website: {
                type: 'string',
                description: 'Website URL',
              },
            },
          },
        }
      ],
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
    const { serviceName, parameters } = await req.json();

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

        return new Response(JSON.stringify({ content: formattedProfile }), { 
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
        
        return new Response(JSON.stringify({ content: successMessage }), { 
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
        
        return new Response(JSON.stringify({ content: formattedProfile }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });

      } catch (error) {
        console.error('Error in getProfile:', error);
        return new Response(JSON.stringify({ error: 'An internal error occurred.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
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