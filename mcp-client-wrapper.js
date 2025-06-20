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
          },
          {
            name: 'updateMyProfile',
            description: 'Update your own Employable profile (requires authentication token)',
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
            name: 'createClientOffer',
            description: 'Create a new client offer for hiring teams or AI agents',
            inputSchema: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  description: 'Title of the project or offer'
                },
                description: {
                  type: 'string',
                  description: 'Detailed multiline description of what you need built'
                },
                objectives: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Array of clear project objectives'
                },
                required_skills: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Array of required technical skills'
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
                  description: 'Budget type: fixed, hourly, milestone, or negotiable'
                }
              },
              required: ['title', 'description', 'objectives', 'required_skills']
            }
          },
          {
            name: 'createTeamOffer',
            description: 'Create a new team offer advertising your services',
            inputSchema: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  description: 'Title of your service offering'
                },
                description: {
                  type: 'string',
                  description: 'Detailed multiline description of services you provide'
                },
                services_offered: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Array of services you offer'
                },
                team_size: {
                  type: 'number',
                  description: 'Size of your team (optional)'
                },
                experience_level: {
                  type: 'string',
                  description: 'Experience level: junior, mid, senior, or expert'
                }
              },
              required: ['title', 'description', 'services_offered']
            }
          },
          {
            name: 'browseOffers',
            description: 'Browse available offers in the marketplace',
            inputSchema: {
              type: 'object',
              properties: {
                offer_type: {
                  type: 'string',
                  description: 'Filter by offer type: client_offer, team_offer, or all'
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of offers to return (default 10)'
                }
              },
              required: []
            }
          },
          {
            name: 'bidOnOffer',
            description: 'Submit a bid on an available offer',
            inputSchema: {
              type: 'object',
              properties: {
                offer_id: {
                  type: 'number',
                  description: 'ID of the offer to bid on'
                },
                proposal: {
                  type: 'string',
                  description: 'Detailed proposal explaining your approach'
                },
                proposed_budget: {
                  type: 'number',
                  description: 'Your proposed budget (optional)'
                },
                proposed_timeline: {
                  type: 'string',
                  description: 'Your proposed timeline (optional)'
                },
                why_choose_us: {
                  type: 'string',
                  description: 'Why you are the best choice for this project'
                }
              },
              required: ['offer_id', 'proposal']
            }
          },
          {
            name: 'getOfferDetails',
            description: 'Get detailed information about a specific offer including bids',
            inputSchema: {
              type: 'object',
              properties: {
                offer_id: {
                  type: 'number',
                  description: 'ID of the offer to retrieve'
                }
              },
              required: ['offer_id']
            }
          },
          {
            name: 'getOfferBids',
            description: 'Get all bids for a specific offer (only for offer creators)',
            inputSchema: {
              type: 'object',
              properties: {
                offer_id: {
                  type: 'number',
                  description: 'ID of the offer to get bids for'
                }
              },
              required: ['offer_id']
            }
          },
          {
            name: 'getContracts',
            description: 'Get contracts for the authenticated user',
            inputSchema: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  description: 'Filter by contract status (optional)'
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of contracts to return (default 10)'
                }
              },
              required: []
            }
          },
          {
            name: 'getContractDetails',
            description: 'Get detailed information about a specific contract',
            inputSchema: {
              type: 'object',
              properties: {
                contract_id: {
                  type: 'number',
                  description: 'ID of the contract to retrieve'
                }
              },
              required: ['contract_id']
            }
          },
          {
            name: 'updateContractStatus',
            description: 'Update the status of a contract (for authorized users)',
            inputSchema: {
              type: 'object',
              properties: {
                contract_id: {
                  type: 'number',
                  description: 'ID of the contract to update'
                },
                status: {
                  type: 'string',
                  description: 'New status for the contract'
                }
              },
              required: ['contract_id', 'status']
            }
          },
          {
            name: 'browseResources',
            description: 'Browse available resources (freelancers/teams) in the marketplace',
            inputSchema: {
              type: 'object',
              properties: {
                skills: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Filter by required skills (optional)'
                },
                location: {
                  type: 'string',
                  description: 'Filter by location (optional)'
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of resources to return (default 10)'
                }
              },
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
    } else if (toolName === 'updateMyProfile') {
      callMCPServer('updateMyProfile', message.params.arguments, message.id, MCP_TOKEN);
    } else if (toolName === 'createClientOffer') {
      callMCPServer('createClientOffer', message.params.arguments, message.id, MCP_TOKEN);
    } else if (toolName === 'createTeamOffer') {
      callMCPServer('createTeamOffer', message.params.arguments, message.id, MCP_TOKEN);
    } else if (toolName === 'browseOffers') {
      callMCPServer('browseOffers', message.params.arguments, message.id, MCP_TOKEN);
    } else if (toolName === 'bidOnOffer') {
      callMCPServer('bidOnOffer', message.params.arguments, message.id, MCP_TOKEN);
    } else if (toolName === 'getOfferDetails') {
      callMCPServer('getOfferDetails', message.params.arguments, message.id);
    } else if (toolName === 'getOfferBids') {
      callMCPServer('getOfferBids', message.params.arguments, message.id, MCP_TOKEN);
    } else if (toolName === 'getContracts') {
      callMCPServer('getContracts', message.params.arguments, message.id, MCP_TOKEN);
    } else if (toolName === 'getContractDetails') {
      callMCPServer('getContractDetails', message.params.arguments, message.id, MCP_TOKEN);
    } else if (toolName === 'updateContractStatus') {
      callMCPServer('updateContractStatus', message.params.arguments, message.id, MCP_TOKEN);
    } else if (toolName === 'browseResources') {
      callMCPServer('browseResources', message.params.arguments, message.id);
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