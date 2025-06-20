#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
);

// MCP Protocol implementation
process.stdin.setEncoding('utf8');
let buffer = '';

process.stdin.on('data', (chunk) => {
  buffer += chunk;
  const lines = buffer.split('\n');
  buffer = lines.pop();
  
  lines.forEach(async (line) => {
    if (line.trim()) {
      try {
        const message = JSON.parse(line);
        await handleMessage(message);
      } catch (e) {
        console.error('Parse error:', e.message);
      }
    }
  });
});

async function handleMessage(message) {
  const { jsonrpc, id, method, params } = message;

  if (method === 'initialize') {
    respond(id, {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {}
      },
      serverInfo: {
        name: 'employable-profiles',
        version: '1.0.0'
      }
    });
  } else if (method === 'tools/list') {
    respond(id, {
      tools: [
        {
          name: 'getProfile',
          description: 'Get Employable user profile including bio, skills, role, and location',
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
        }
      ]
    });
  } else if (method === 'tools/call' && params?.name === 'getProfile') {
    try {
      const { username } = params.arguments;
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          username,
          full_name,
          bio,
          website,
          resources(
            role,
            location,
            skills
          )
        `)
        .eq('username', username)
        .single();

      if (error) throw error;

      const resource = data.resources?.[0] || {};
      const profile = `
User Profile for ${data.full_name || data.username}:
Bio: ${data.bio || 'Not provided.'}
Website: ${data.website || 'Not provided.'}
Role: ${resource.role || 'Not provided.'}
Location: ${resource.location || 'Not provided.'}
Skills: ${(resource.skills || []).join(', ')}
      `.trim();

      respond(id, {
        content: [
          {
            type: 'text',
            text: profile
          }
        ]
      });
    } catch (error) {
      respondError(id, -32603, `Database error: ${error.message}`);
    }
  } else {
    respondError(id, -32601, 'Method not found');
  }
}

function respond(id, result) {
  console.log(JSON.stringify({
    jsonrpc: '2.0',
    id,
    result
  }));
}

function respondError(id, code, message) {
  console.log(JSON.stringify({
    jsonrpc: '2.0',
    id,
    error: { code, message }
  }));
}

process.on('SIGINT', () => process.exit(0)); 