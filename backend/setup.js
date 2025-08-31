const fs = require('fs');
const path = require('path');

console.log('🚀 Bus Buddy Backend Setup');
console.log('==========================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('✅ .env file already exists');
  console.log('📝 Current configuration:');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  lines.forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key] = line.split('=');
      if (key === 'SUPABASE_URL') {
        console.log(`   ${key}: ${line.split('=')[1]}`);
      } else if (key === 'SUPABASE_SERVICE_ROLE_KEY') {
        const value = line.split('=')[1];
        console.log(`   ${key}: ${value ? '***' + value.slice(-4) : 'NOT SET'}`);
      }
    }
  });
} else {
  console.log('❌ .env file not found');
  console.log('📝 Creating .env template...');
  
  const envTemplate = `# Supabase Configuration
# Get these values from your Supabase dashboard: https://supabase.com/dashboard
SUPABASE_URL=https://pbleqpygrzisnxgbhwxa.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Server Configuration
PORT=3000
NODE_ENV=development
`;

  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ .env file created');
  console.log('📝 Please update the .env file with your actual Supabase credentials');
}

console.log('\n📋 Next Steps:');
console.log('1. Go to https://supabase.com/dashboard');
console.log('2. Select your project (ID: pbleqpygrzisnxgbhwxa)');
console.log('3. Go to Settings > API');
console.log('4. Copy the "Project URL" to SUPABASE_URL');
console.log('5. Copy the "service_role" key to SUPABASE_SERVICE_ROLE_KEY');
console.log('6. Save the .env file');
console.log('7. Run: npm run dev');

console.log('\n🔗 Your Supabase Project:');
console.log('   Project ID: pbleqpygrzisnxgbhwxa');
console.log('   URL: https://pbleqpygrzisnxgbhwxa.supabase.co');
