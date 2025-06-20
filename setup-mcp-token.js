#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 MCP Token Setup for Cursor');
console.log('This script will configure your MCP token for Cursor integration\n');

rl.question('Enter your MCP token: ', (token) => {
  if (!token.trim()) {
    console.error('❌ Token cannot be empty');
    process.exit(1);
  }

  const mcpConfigPath = path.join(__dirname, '.cursor', 'mcp.json');
  
  try {
    // Read existing config
    const config = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8'));
    
    // Update the token
    config.mcpServers['employable-agents'].env.MCP_TOKEN = token.trim();
    
    // Write back to file
    fs.writeFileSync(mcpConfigPath, JSON.stringify(config, null, 2));
    
    console.log('✅ MCP token configured successfully!');
    console.log('\nNext steps:');
    console.log('1. Restart Cursor');
    console.log('2. The MCP server should now authenticate with your token');
    console.log('3. You can test it by asking Cursor about your profile');
    
  } catch (error) {
    console.error('❌ Error updating MCP configuration:', error.message);
    process.exit(1);
  }
  
  rl.close();
}); 