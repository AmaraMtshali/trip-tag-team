const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Better error handling for missing environment variables
if (!SUPABASE_URL) {
  console.error('❌ Missing SUPABASE_URL environment variable');
  console.error('Please add SUPABASE_URL to your .env file');
  console.error('Example: SUPABASE_URL=https://your-project.supabase.co');
  process.exit(1);
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  console.error('Please add SUPABASE_SERVICE_ROLE_KEY to your .env file');
  console.error('You can find this in your Supabase dashboard under Settings > API');
  process.exit(1);
}

console.log('✅ Supabase environment variables loaded successfully');
console.log(`📡 Connecting to: ${SUPABASE_URL}`);

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

module.exports = supabase;
