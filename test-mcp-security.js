#!/usr/bin/env node

const http = require('http');

// Test configuration
const MCP_SERVER_URL = 'http://localhost:54321/functions/v1/mcp-server';
const TEST_USERNAME = 'your-username'; // Replace with actual username
const TEST_TOKEN = 'your-mcp-token'; // Replace with actual token

// Helper function to make HTTP requests
function makeRequest(method, path, data, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, MCP_SERVER_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsedData });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing MCP Security Implementation\n');

  // Test 1: Service Discovery
  console.log('1. Testing service discovery...');
  try {
    const result = await makeRequest('GET', '/');
    console.log(`   Status: ${result.status}`);
    console.log(`   Services: ${result.data.services?.map(s => s.name).join(', ')}`);
    console.log('   ✅ Service discovery working\n');
  } catch (error) {
    console.log('   ❌ Service discovery failed:', error.message, '\n');
  }

  // Test 2: getProfile without MCP enabled (should fail)
  console.log('2. Testing getProfile for user without MCP enabled...');
  try {
    const result = await makeRequest('POST', '/', {
      serviceName: 'getProfile',
      parameters: { username: TEST_USERNAME }
    });
    console.log(`   Status: ${result.status}`);
    console.log(`   Response: ${JSON.stringify(result.data)}`);
    if (result.status === 404) {
      console.log('   ✅ Correctly blocked access to non-MCP profile\n');
    } else {
      console.log('   ⚠️  Unexpected response\n');
    }
  } catch (error) {
    console.log('   ❌ Test failed:', error.message, '\n');
  }

  // Test 3: getMyProfile without token (should fail)
  console.log('3. Testing getMyProfile without authentication...');
  try {
    const result = await makeRequest('POST', '/', {
      serviceName: 'getMyProfile',
      parameters: {}
    });
    console.log(`   Status: ${result.status}`);
    console.log(`   Response: ${JSON.stringify(result.data)}`);
    if (result.status === 401) {
      console.log('   ✅ Correctly rejected unauthenticated request\n');
    } else {
      console.log('   ⚠️  Unexpected response\n');
    }
  } catch (error) {
    console.log('   ❌ Test failed:', error.message, '\n');
  }

  // Test 4: getMyProfile with valid token (should succeed)
  if (TEST_TOKEN !== 'your-mcp-token') {
    console.log('4. Testing getMyProfile with valid token...');
    try {
      const result = await makeRequest('POST', '/', {
        serviceName: 'getMyProfile',
        parameters: {}
      }, TEST_TOKEN);
      console.log(`   Status: ${result.status}`);
      if (result.status === 200) {
        console.log(`   Profile ID: ${result.data.id}`);
        console.log(`   Username: ${result.data.username}`);
        console.log(`   MCP Enabled: ${result.data.mcp_enabled}`);
        console.log('   ✅ Successfully retrieved own profile\n');
      } else {
        console.log(`   Response: ${JSON.stringify(result.data)}`);
        console.log('   ⚠️  Unexpected response\n');
      }
    } catch (error) {
      console.log('   ❌ Test failed:', error.message, '\n');
    }
  } else {
    console.log('4. Skipping authenticated test - please set TEST_TOKEN\n');
  }

  // Test 5: Invalid token (should fail)
  console.log('5. Testing with invalid token...');
  try {
    const result = await makeRequest('POST', '/', {
      serviceName: 'getMyProfile',
      parameters: {}
    }, 'mcp_invalid_token_12345');
    console.log(`   Status: ${result.status}`);
    console.log(`   Response: ${JSON.stringify(result.data)}`);
    if (result.status === 401) {
      console.log('   ✅ Correctly rejected invalid token\n');
    } else {
      console.log('   ⚠️  Unexpected response\n');
    }
  } catch (error) {
    console.log('   ❌ Test failed:', error.message, '\n');
  }

  console.log('🏁 Testing complete!');
  console.log('\n📝 To run authenticated tests:');
  console.log('1. Generate an MCP token via the UI');
  console.log('2. Edit this script and set TEST_TOKEN and TEST_USERNAME');
  console.log('3. Run the script again');
}

runTests().catch(console.error); 