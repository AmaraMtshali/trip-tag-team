const supabase = require('./supabaseClient');

async function setupDatabase() {
  console.log('🔧 Setting up Bus Buddy database...\n');

  try {
    // Check if sessions table exists
    console.log('📋 Checking sessions table...');
    const { data: sessionsCheck, error: sessionsError } = await supabase
      .from('sessions')
      .select('count')
      .limit(1);

    if (sessionsError && sessionsError.code === '42P01') {
      console.log('❌ Sessions table does not exist. Creating...');
      await createSessionsTable();
    } else {
      console.log('✅ Sessions table exists');
    }

    // Check if members table exists
    console.log('📋 Checking members table...');
    const { data: membersCheck, error: membersError } = await supabase
      .from('members')
      .select('count')
      .limit(1);

    if (membersError && membersError.code === '42P01') {
      console.log('❌ Members table does not exist. Creating...');
      await createMembersTable();
    } else {
      console.log('✅ Members table exists');
    }

    console.log('\n🎉 Database setup complete!');
    console.log('📝 You can now run the application.');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    console.log('\n📋 Please run the SQL schema manually in your Supabase dashboard:');
    console.log('1. Go to https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Go to SQL Editor');
    console.log('4. Copy and paste the contents of supabase/schema.sql');
    console.log('5. Click Run');
  }
}

async function createSessionsTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS sessions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      short_id VARCHAR(10) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      leader_name VARCHAR(255),
      leader_phone VARCHAR(50),
      leader_member_id UUID,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  const { error } = await supabase.rpc('exec_sql', { sql });
  if (error) {
    console.error('Error creating sessions table:', error);
    throw error;
  }
  console.log('✅ Sessions table created');
}

async function createMembersTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS members (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      phone_number VARCHAR(50),
      role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('leader', 'member')),
      status VARCHAR(20) DEFAULT 'joined' CHECK (status IN ('joined', 'present', 'missing')),
      joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(session_id, name)
    );
  `;

  const { error } = await supabase.rpc('exec_sql', { sql });
  if (error) {
    console.error('Error creating members table:', error);
    throw error;
  }
  console.log('✅ Members table created');
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };
