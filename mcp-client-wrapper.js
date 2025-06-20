#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');

// MCP stdio server for Cursor
process.stdin.setEncoding('utf8');

// Get the MCP token from environment variable (more secure)
let MCP_TOKEN = process.env.MCP_TOKEN;

// Fallback to secure token file (not in git)
if (!MCP_TOKEN) {
  const tokenPath = path.join(process.env.HOME || process.env.USERPROFILE, '.employable-mcp-token');
  try {
    if (fs.existsSync(tokenPath)) {
      MCP_TOKEN = fs.readFileSync(tokenPath, 'utf8').trim();
    }
  } catch (e) {
    console.error('Warning: Could not read token file');
  }
}

if (!MCP_TOKEN) {
  console.error('ERROR: MCP token not found. Set MCP_TOKEN environment variable or create ~/.employable-mcp-token file');
  process.exit(1);
}

let buffer = '';

process.stdin.on('data', (chunk) => {
  buffer += chunk;
  
  // Process complete JSON messages
  const lines = buffer.split('\n');
  buffer = lines.pop(); // Keep incomplete line in buffer
  
  lines.forEach(line => {
    if (line.trim()) {
      try {
        const message = JSON.parse(line);
        handleMCPMessage(message);
      } catch (e) {
        console.error('Invalid JSON:', e.message);
      }
    }
  });
});

function handleMCPMessage(message) {
  if (message.method === 'initialize') {
    // Respond with server capabilities
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
  } else if (message.method === 'tools/list') {
    // List available tools
    const response = {
      jsonrpc: '2.0',
      id: message.id,
      result: {
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
          },
          {
            name: 'getMyProfile',
            description: 'Get your own Employable profile (requires authentication token)',
            inputSchema: {
              type: 'object',
              properties: {},
              required: []
            }
          }
        ]
      }
    };
    console.log(JSON.stringify(response));
  } else if (message.method === 'tools/call') {
    const toolName = message.params?.name;
    
    if (toolName === 'getProfile') {
      callMCPServer('getProfile', message.params.arguments, message.id);
    } else if (toolName === 'getMyProfile') {
      callMCPServer('getMyProfile', {}, message.id, MCP_TOKEN);
    }
  }
}

function callMCPServer(serviceName, parameters, messageId, token = null) {
    const postData = JSON.stringify({
    serviceName,
    parameters: parameters || {}
    });

  const headers = {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'Authorization': `Bearer ${token || MCP_TOKEN}`
  };

    const options = {
      hostname: '127.0.0.1',
      port: 54321,
      path: '/functions/v1/mcp-server',
      method: 'POST',
    headers
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          const response = {
            jsonrpc: '2.0',
          id: messageId,
            result: {
              content: [
                {
                  type: 'text',
                  text: result.content || result.error || 'No data returned'
                }
              ]
            }
          };
          console.log(JSON.stringify(response));
        } catch (e) {
          const errorResponse = {
            jsonrpc: '2.0',
          id: messageId,
            error: {
              code: -32603,
              message: 'Failed to parse server response'
            }
          };
          console.log(JSON.stringify(errorResponse));
        }
      });
    });

    req.on('error', (e) => {
      const errorResponse = {
        jsonrpc: '2.0',
      id: messageId,
        error: {
          code: -32603,
          message: `HTTP request failed: ${e.message}`
        }
      };
      console.log(JSON.stringify(errorResponse));
    });

    req.write(postData);
    req.end();
}

process.on('SIGINT', () => {
  process.exit(0);
}); 