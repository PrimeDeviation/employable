#!/usr/bin/env node

// Test script for Cursor MCP integration
const { spawn } = require('child_process');
const readline = require('readline');

console.log('🔧 Testing Cursor MCP Integration');
console.log('This will test the mcp-client-wrapper.js that Cursor uses\n');

// Start the MCP wrapper
const mcpProcess = spawn('node', ['mcp-client-wrapper.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let testStep = 0;
const tests = [
  {
    name: 'Initialize MCP Server',
    message: { jsonrpc: '2.0', id: 1, method: 'initialize', params: {} }
  },
  {
    name: 'List Available Tools',
    message: { jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} }
  },
  {
    name: 'Call getProfile Tool',
    message: { 
      jsonrpc: '2.0', 
      id: 3, 
      method: 'tools/call', 
      params: { 
        name: 'getProfile', 
        arguments: { username: 'test-user' } 
      } 
    }
  }
];

mcpProcess.stdout.on('data', (data) => {
  const lines = data.toString().split('\n').filter(line => line.trim());
  
  lines.forEach(line => {
    try {
      const response = JSON.parse(line);
      console.log(`📥 Response for test ${testStep}:`, JSON.stringify(response, null, 2));
      
      if (testStep < tests.length) {
        // Send next test
        setTimeout(() => {
          if (testStep < tests.length) {
            console.log(`\n📤 Sending: ${tests[testStep].name}`);
            mcpProcess.stdin.write(JSON.stringify(tests[testStep].message) + '\n');
            testStep++;
          } else {
            console.log('\n✅ All tests completed');
            mcpProcess.kill();
          }
        }, 100);
      }
    } catch (e) {
      console.log('📥 Non-JSON response:', line);
    }
  });
});

mcpProcess.stderr.on('data', (data) => {
  console.error('❌ Error:', data.toString());
});

mcpProcess.on('close', (code) => {
  console.log(`\n🏁 MCP process exited with code ${code}`);
});

// Start the first test
console.log(`📤 Sending: ${tests[0].name}`);
mcpProcess.stdin.write(JSON.stringify(tests[0].message) + '\n');
testStep++;

// Auto-kill after 10 seconds
setTimeout(() => {
  if (!mcpProcess.killed) {
    console.log('\n⏰ Test timeout - killing process');
    mcpProcess.kill();
  }
}, 10000); 