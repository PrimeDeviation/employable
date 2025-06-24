const { createClient } = require('@supabase/supabase-js');

// Create Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://kvtqkvifglyytdsvsyzo.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
);

async function generateCursorToken() {
  // You'll need to authenticate first - this requires your actual login
  console.log('Please sign in to generate a token...');
  
  // For now, let's try with email and password
  const email = 'lan@primedeviation.com';
  console.log(`Attempting to authenticate as: ${email}`);
  
  // You'll need to provide the password or use a different auth method
  console.log('This script needs to be run with proper authentication.');
  console.log('Please use the web interface at localhost:3000 to generate your MCP token instead.');
  
  process.exit(1);
}

generateCursorToken().catch(console.error); 