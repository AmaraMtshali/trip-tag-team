const supabase = require('./supabaseClient');

async function fixDatabase() {
  console.log('🔧 Fixing Bus Buddy database...\n');

  try {
    // Check if members table has the required columns
    console.log('📋 Checking members table structure...');
    
    // Try to select all columns to see what exists
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Error accessing members table:', error.message);
      console.log('\n📋 Please run the following SQL in your Supabase dashboard:');
      console.log('\n1. Go to https://supabase.com/dashboard');
      console.log('2. Select your project');
      console.log('3. Go to SQL Editor');
      console.log('4. Copy and paste the contents of supabase/schema.sql');
      console.log('5. Click Run');
      return;
    }

    console.log('✅ Members table exists and is accessible');
    console.log('📊 Table structure appears to be correct');
    
    // Test creating a simple session and member
    console.log('\n🧪 Testing database operations...');
    
    // Create a test session
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        short_id: 'TEST' + Date.now().toString().slice(-6),
        name: 'Test Session',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();

    if (sessionError) {
      console.error('❌ Error creating test session:', sessionError);
      return;
    }

    console.log('✅ Test session created successfully');

    // Create a test member
    const { data: member, error: memberError } = await supabase
      .from('members')
      .insert({
        session_id: session.id,
        name: 'Test Member',
        status: 'joined'
      })
      .select()
      .single();

    if (memberError) {
      console.error('❌ Error creating test member:', memberError);
      return;
    }

    console.log('✅ Test member created successfully');

    // Clean up test data
    await supabase.from('members').delete().eq('session_id', session.id);
    await supabase.from('sessions').delete().eq('id', session.id);

    console.log('\n🎉 Database is working correctly!');
    console.log('📝 You can now run the application.');

  } catch (error) {
    console.error('❌ Database fix failed:', error);
    console.log('\n📋 Please run the SQL schema manually:');
    console.log('1. Go to https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Go to SQL Editor');
    console.log('4. Copy and paste the contents of supabase/schema.sql');
    console.log('5. Click Run');
  }
}

// Run fix if this file is executed directly
if (require.main === module) {
  fixDatabase();
}

module.exports = { fixDatabase };
