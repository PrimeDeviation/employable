import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { v4 as uuidv4 } from "https://deno.land/std@0.168.0/uuid/mod.ts";

const MCP_PROTOCOL_VERSION = '1.0';

// Handler for WebSocket connections
function handleWebSocket(socket: WebSocket) {
  socket.onopen = () => {
    console.log("WebSocket connection established.");
  };

  socket.onmessage = async (event) => {
    try {
      const message = JSON.parse(event.data);

      if (message.performative === 'CONTEXT_SUBSCRIBE') {
        const token = message.payload?.authentication_token;
        if (!token) {
          socket.send(JSON.stringify({ error: "Authentication token is required for CONTEXT_SUBSCRIBE" }));
          return;
        }

        try {
          let user = null;
          
          // Try MCP token authentication first
          if (token.startsWith('mcp_')) {
            const supabaseClient = createClient(
              Deno.env.get('SUPABASE_URL')!,
              Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
            );
            
            const { data: userId, error: tokenError } = await supabaseClient.rpc('validate_mcp_token', {
              p_token: token
            });
            
            if (tokenError || !userId) {
              throw new Error("Invalid MCP token");
            }
            
            // Get user data from auth.users
            const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserById(userId);
            if (userError || !userData.user) {
              throw new Error("User not found");
            }
            
            user = userData.user;
          } else {
            // Fall back to regular Supabase auth token
            const supabaseClient = createClient(
              Deno.env.get('SUPABASE_URL')!,
              Deno.env.get('SUPABASE_ANON_KEY')!,
              { global: { headers: { Authorization: `Bearer ${token}` } } }
            );

            const { data: authData, error } = await supabaseClient.auth.getUser();
            if (error || !authData.user) {
              throw new Error(error?.message || "Invalid authentication token");
            }
            
            user = authData.user;
          }

          if (!user) {
            throw new Error("Authentication failed");
          }

          console.log(`Agent authenticated as user: ${user.id}`);
          // TODO: Store agent session state
          
          socket.send(JSON.stringify({
            protocol_version: MCP_PROTOCOL_VERSION,
            message_id: uuidv4(),
            timestamp: new Date().toISOString(),
            source_agent_id: 'mcp-server',
            performative: 'CONTEXT_EVENT',
            payload: {
              event_type: 'SUBSCRIPTION_CONFIRMED',
              data: {
                message: `Successfully subscribed as user ${user.id}`
              }
            }
          }));

        } catch (authError) {
          console.error("Authentication failed:", authError.message);
          socket.send(JSON.stringify({ error: "Authentication failed" }));
        }

      } else {
        console.log("Received MCP message:", message);
        // TODO: Implement other performatives
        socket.send(JSON.stringify({ status: "received", message_id: message.message_id }));
      }
    } catch (error) {
      console.error("Failed to parse incoming message:", error);
      socket.send(JSON.stringify({ error: "Invalid JSON format" }));
    }
  };

  socket.onclose = () => {
    console.log("WebSocket connection closed.");
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };
}

// --- Unified Authentication and Authorization ---

interface AuthResult {
  userId: string;
  scopes: string[];
}

async function authenticateRequest(req: Request): Promise<AuthResult | null> {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return null;
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Strategy 1: Custom JWT MCP Token (preferred for MCP clients)
  // Try JWT validation first for tokens that look like JWTs (have dots)
  if (token.includes('.')) {
    try {
      const { data: userId, error } = await supabaseAdmin.rpc('validate_mcp_jwt_token', { p_token: token });
      if (!error && userId) {
        // JWT tokens get full access for now, but we could extract scopes from the JWT payload
        return { userId, scopes: ['*'] };
      }
    } catch (error) {
      console.log('Custom JWT validation failed, trying other methods:', error);
    }
  }

  // Strategy 2: Legacy MCP API Key (hash-based)
  if (token.startsWith('mcp_')) {
    const { data: userId, error } = await supabaseAdmin.rpc('validate_mcp_token', { p_token: token });
    if (error || !userId) return null;
    // API keys get full access for now.
    return { userId, scopes: ['*'] };
  }

  // Strategy 3: Standard Supabase JWT for logged-in users
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return null;
    // Standard users get basic read access.
    return { userId: user.id, scopes: ['profile:read'] };
  } catch (e) {
    // This will catch invalid JWTs
    return null;
  }
}

function hasPermission(authResult: AuthResult, requiredScope: string): boolean {
  if (!authResult) return false;
  // The '*' scope grants all permissions
  if (authResult.scopes.includes('*')) return true;
  // Check for the specific required scope
  return authResult.scopes.includes(requiredScope);
}

serve(async (req) => {
  const url = new URL(req.url);
  console.log(`Incoming request: ${req.method} ${url.pathname}`);
  
  // Handle WebSocket upgrade requests
  if (req.headers.get("upgrade")?.toLowerCase() === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(req);
    handleWebSocket(socket);
    return response;
  }

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } });
  }

  // --- MCP Protocol Discovery ---
  // On GET / or /mcp-server, return the list of services
  if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/mcp-server')) {
    const responseBody = {
      mcp_protocol_version: MCP_PROTOCOL_VERSION,
      services: [
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
        // This error now means the profile couldn't be fetched, not that auth failed.
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