import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const MCP_PROTOCOL_VERSION = '1.0';

serve(async (req) => {
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
          description: 'Retrieves a user\'s Employable Units (EIU) profile, including their bio, skills, role, and location.',
          parameters: {
            type: 'object',
            properties: {
              username: {
                type: 'string',
                description: 'The username of the Employable Units (EIU) profile to retrieve.',
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