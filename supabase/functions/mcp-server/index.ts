import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { v4 as uuidv4 } from "uuid";

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
          const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_ANON_KEY')!,
            { global: { headers: { Authorization: `Bearer ${token}` } } }
          );

          const { data: { user }, error } = await supabaseClient.auth.getUser();

          if (error || !user) {
            throw new Error(error?.message || "Invalid authentication token");
          }

          console.log(`Agent authenticated as user: ${user.id}`);
          // TODO: Store agent session state
          
          socket.send(JSON.stringify({
            protocol_version: MCP_PROTOCOL_VERSION,
            message_id: uuidv4.generate(),
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

serve(async (req) => {
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
  // On GET /, return the list of services
  if (req.method === 'GET' && new URL(req.url).pathname === '/') {
    const responseBody = {
      mcp_protocol_version: MCP_PROTOCOL_VERSION,
      services: [
        {
          name: 'getProfile',
          description: 'Retrieves a user\'s Employable Agents profile, including their bio, skills, role, and location.',
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
  // On POST /, execute the requested service
  if (req.method === 'POST' && new URL(req.url).pathname === '/') {
    const { serviceName, parameters } = await req.json();

    if (serviceName === 'getProfile') {
      const { username } = parameters;
      if (!username) {
        return new Response(JSON.stringify({ error: 'Username parameter is required.' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
      }

      try {
        const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!);
        
        // Fetch profile and resource data
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            username,
            full_name,
            bio,
            website,
            resource:resources(
              role,
              location,
              skills
            )
          `)
          .eq('username', username)
          .single();

        if (error) throw error;
        
        // Combine and format the data for the LLM
        const resource = data.resource[0] || {};
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
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
      }
    }

    return new Response(JSON.stringify({ error: 'Service not found' }), { status: 404, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  }

  return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
}); 