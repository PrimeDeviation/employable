#!/usr/bin/env node

// Simple MCP stdio server for just the 3 working tools
process.stdin.setEncoding('utf8');

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://iyvynzfwdidztxhqoavj.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5dnluemZ3ZGlkenR4aHFvYXZqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNjE3NzQwNSwiZXhwIjoyMDQxNzUzNDA1fQ.R1gJGWF4vWQiGvJ3A9jPuOMLMxWADdRjAhMZx9l5qeI';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

let buffer = '';

process.stdin.on('data', (chunk) => {
  buffer += chunk;
  
  const lines = buffer.split('\n');
  buffer = lines.pop();
  
  lines.forEach(line => {
    if (line.trim()) {
      try {
        const message = JSON.parse(line);
        handleMessage(message);
      } catch (e) {
        console.error('JSON parse error:', e);
      }
    }
  });
});

async function handleMessage(message) {
  if (message.method === 'initialize') {
    const response = {
      jsonrpc: '2.0',
      id: message.id,
      result: {
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
    console.log(JSON.stringify(response));
  } 
  else if (message.method === 'tools/list') {
    const response = {
      jsonrpc: '2.0',
      id: message.id,
      result: {
      tools: [
        {
          name: 'getProfile',
            description: 'Get a user profile by username/email',
          inputSchema: {
            type: 'object',
            properties: {
                username: { type: 'string', description: 'Username/email to look up' }
            },
            required: ['username']
          }
          },
          {
            name: 'getMyProfile',
            description: 'Get your own profile',
            inputSchema: {
              type: 'object',
              properties: {},
              required: []
            }
          },
          {
            name: 'updateMyProfile',
            description: 'Update your profile',
            inputSchema: {
              type: 'object',
              properties: {
                bio: { type: 'string', description: 'Your bio' },
                company_name: { type: 'string', description: 'Company name' },
                website: { type: 'string', description: 'Website URL' }
              },
              required: []
            }
          }
        ]
      }
    };
    console.log(JSON.stringify(response));
  }
  else if (message.method === 'tools/call') {
    try {
      const result = await handleToolCall(message.params.name, message.params.arguments || {});
      const response = {
        jsonrpc: '2.0',
        id: message.id,
        result: {
          content: [{ type: 'text', text: result }]
        }
      };
      console.log(JSON.stringify(response));
    } catch (error) {
      const response = {
        jsonrpc: '2.0',
        id: message.id,
        error: {
          code: -1,
          message: error.message
        }
      };
      console.log(JSON.stringify(response));
    }
  }
}

async function handleToolCall(toolName, args) {
  const userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiIDogImVtcGxveWFibGUtbWNwIiwgInN1YiIgOiAiOTYxMGE4MTItYzMyZS00ZWUzLTkxMGMtMGVjODI1NDM2MGM5IiwgImF1ZCIgOiAibWNwLWNsaWVudCIsICJleHAiIDogMTc4MTk3MjY2NCwgImlhdCIgOiAxNzUwNDM2NjY0LCAidG9rZW5fdHlwZSIgOiAibWNwIiwgInVzZXJfaWQiIDogIjk2MTBhODEyLWMzMmUtNGVlMy05MTBjLTBlYzgyNTQzNjBjOSIsICJ0b2tlbl9pZCIgOiAiMzJiMmMwZjMtMTc0MS00MGRiLTljNDQtNzQ1NzVhY2QyMGUzIn0.L_D46YFkBoJd3X82P28jkavl0ZwsOD6FBaBFELkFPtg';
  const userId = '9610a812-c32e-4ee3-910c-0ec825436c9';

  if (toolName === 'getMyProfile') {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw new Error('Profile not found');
    
    return `Your Profile:\nName: ${data.full_name}\nEmail: ${data.username}\nBio: ${data.bio}\nWebsite: ${data.website}\nCompany: ${data.company_name}`;
  }
  
  if (toolName === 'updateMyProfile') {
    const updates = {};
    if (args.bio) updates.bio = args.bio;
    if (args.company_name) updates.company_name = args.company_name;
    if (args.website) updates.website = args.website;
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    
    if (error) throw new Error('Update failed');
    
    return 'Profile updated successfully';
  }
  
  if (toolName === 'getProfile') {
    const { data, error } = await supabase
      .from('profiles')
      .select('username, full_name, bio, website, company_name')
      .eq('username', args.username)
      .eq('mcp_enabled', true)
      .single();
    
    if (error) throw new Error('Profile not found or MCP disabled');
    
    return `Profile for ${data.full_name}:\nBio: ${data.bio}\nWebsite: ${data.website}\nCompany: ${data.company_name}`;
  }
  
  throw new Error('Unknown tool');
}

process.on('SIGINT', () => process.exit(0)); 
process.on('SIGTERM', () => process.exit(0)); 