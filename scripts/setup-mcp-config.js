#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Script to setup MCP configuration dynamically based on environment
 * This replaces hardcoded tokens with environment-based configuration
 */

const ENVIRONMENTS = {
  local: {
    url: 'http://127.0.0.1:54321/functions/v1/mcp-server',
    name: 'employable-agents-local'
  },
  production: {
    url: 'https://kvtqkvifglyytdsvsyzo.supabase.co/functions/v1/mcp-server',
    name: 'employable-agents-production'
  }
};

function getMcpConfigPath() {
  // Check for custom config path in environment
  if (process.env.MCP_CONFIG_PATH) {
    return process.env.MCP_CONFIG_PATH;
  }
  
  // Default to user's .cursor directory
  return path.join(os.homedir(), '.cursor', 'mcp.json');
}

function loadExistingConfig(configPath) {
  try {
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.warn('Could not load existing MCP config:', error.message);
  }
  
  return { mcpServers: {} };
}

function generateMcpConfig() {
  const configPath = getMcpConfigPath();
  const existingConfig = loadExistingConfig(configPath);
  
  // Get tokens from environment variables
  const localToken = process.env.MCP_LOCAL_TOKEN;
  const productionToken = process.env.MCP_PRODUCTION_TOKEN;
  
  if (!localToken && !productionToken) {
    console.error('❌ No MCP tokens found in environment variables.');
    console.log('Please set one or both of:');
    console.log('  - MCP_LOCAL_TOKEN (for local development)');
    console.log('  - MCP_PRODUCTION_TOKEN (for production)');
    console.log('');
    console.log('You can generate tokens by:');
    console.log('  1. Running the frontend app: cd frontend && npm start');
    console.log('  2. Logging in at http://localhost:3000');
    console.log('  3. Going to Account/Profile page to generate MCP tokens');
    process.exit(1);
  }
  
  // Build configuration
  const mcpServers = { ...existingConfig.mcpServers };
  
  if (localToken) {
    mcpServers[ENVIRONMENTS.local.name] = {
      type: 'streamable-http',
      url: ENVIRONMENTS.local.url,
      headers: {
        Authorization: `Bearer ${localToken}`
      }
    };
    console.log('✅ Configured local MCP server');
  }
  
  if (productionToken) {
    mcpServers[ENVIRONMENTS.production.name] = {
      type: 'streamable-http',
      url: ENVIRONMENTS.production.url,
      headers: {
        Authorization: `Bearer ${productionToken}`
      }
    };
    console.log('✅ Configured production MCP server');
  }
  
  const config = {
    mcpServers
  };
  
  // Ensure directory exists
  const configDir = path.dirname(configPath);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  // Write configuration
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`✅ MCP configuration written to: ${configPath}`);
  
  return config;
}

function validateTokens() {
  const localToken = process.env.MCP_LOCAL_TOKEN;
  const productionToken = process.env.MCP_PRODUCTION_TOKEN;
  
  [
    { name: 'Local', token: localToken },
    { name: 'Production', token: productionToken }
  ].forEach(({ name, token }) => {
    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
          const expiry = new Date(payload.exp * 1000);
          const isExpired = new Date() > expiry;
          
          console.log(`${name} token:`);
          console.log(`  User ID: ${payload.user_id}`);
          console.log(`  Expires: ${expiry.toISOString()}`);
          console.log(`  Status: ${isExpired ? '❌ EXPIRED' : '✅ Valid'}`);
          
          if (isExpired) {
            console.warn(`⚠️  ${name} token is expired and needs to be regenerated`);
          }
        }
      } catch (error) {
        console.warn(`⚠️  Could not validate ${name} token:`, error.message);
      }
    }
  });
}

function main() {
  console.log('🔧 Setting up MCP configuration...\n');
  
  // Validate tokens first
  validateTokens();
  console.log('');
  
  // Generate configuration
  const config = generateMcpConfig();
  
  console.log('');
  console.log('🎉 MCP setup complete!');
  console.log('');
  console.log('To update tokens in the future:');
  console.log('  export MCP_LOCAL_TOKEN="your-local-token"');
  console.log('  export MCP_PRODUCTION_TOKEN="your-production-token"');
  console.log('  node scripts/setup-mcp-config.js');
}

if (require.main === module) {
  main();
}

module.exports = {
  generateMcpConfig,
  validateTokens,
  ENVIRONMENTS
}; 