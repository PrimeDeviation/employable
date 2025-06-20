#!/usr/bin/env node

const http = require('http');

// MCP stdio server for Cursor
process.stdin.setEncoding('utf8');

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
          }
        ]
      }
    };
    console.log(JSON.stringify(response));
  } else if (message.method === 'tools/call' && message.params?.name === 'getProfile') {
    // Call our MCP server
    const username = message.params.arguments?.username;
    if (!username) {
      const errorResponse = {
        jsonrpc: '2.0',
        id: message.id,
        error: {
          code: -32602,
          message: 'Username parameter is required'
        }
      };
      console.log(JSON.stringify(errorResponse));
      return;
    }

    // Make HTTP request to our MCP server
    const postData = JSON.stringify({
      serviceName: 'getProfile',
      parameters: { username }
    });

    const options = {
      hostname: '127.0.0.1',
      port: 54321,
      path: '/functions/v1/mcp-server',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
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
            id: message.id,
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
            id: message.id,
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
        id: message.id,
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
}

process.on('SIGINT', () => {
  process.exit(0);
}); 