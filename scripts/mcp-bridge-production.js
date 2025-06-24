#!/usr/bin/env node

const https = require('https');
const readline = require('readline');

const PRODUCTION_MCP_URL = 'https://kvtqkvifglyytdsvsyzo.supabase.co/functions/v1/mcp-server';
// Replace this with your actual MCP token from the mcp_tokens table or JWT
const MCP_TOKEN = process.env.EMPLOYABLE_MCP_TOKEN || 'YOUR_MCP_TOKEN_HERE';

// Setup readline interface for stdio communication
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  crlfDelay: Infinity
});

// Function to make HTTP request to production MCP server
function makeRequest(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'kvtqkvifglyytdsvsyzo.supabase.co',
      port: 443,
      path: '/functions/v1/mcp-server',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MCP_TOKEN}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonResponse = JSON.parse(responseData);
          resolve(jsonResponse);
        } catch (error) {
          reject(new Error(`Invalid JSON response: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Handle incoming MCP requests
rl.on('line', async (line) => {
  try {
    const request = JSON.parse(line);
    
    // Forward the request to the production MCP server
    const response = await makeRequest(request);
    
    // Send response back via stdout
    process.stdout.write(JSON.stringify(response) + '\n');
    
  } catch (error) {
    // Send error response
    const errorResponse = {
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32603,
        message: error.message
      }
    };
    process.stdout.write(JSON.stringify(errorResponse) + '\n');
  }
});

// Handle process termination
process.on('SIGINT', () => {
  rl.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  rl.close();
  process.exit(0);
}); 