-- Bus Buddy Database Schema
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create sessions table
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

-- Create members table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_short_id ON sessions(short_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_members_session_id ON members(session_id);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);

-- Enable Row Level Security (RLS)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a public app)
-- Sessions: Allow public read access for join pages
CREATE POLICY "Allow public read access to sessions" ON sessions
    FOR SELECT USING (true);

-- Sessions: Allow public insert for creating sessions
CREATE POLICY "Allow public insert to sessions" ON sessions
    FOR INSERT WITH CHECK (true);

-- Sessions: Allow public update for session updates
CREATE POLICY "Allow public update to sessions" ON sessions
    FOR UPDATE USING (true);

-- Members: Allow public read access
CREATE POLICY "Allow public read access to members" ON members
    FOR SELECT USING (true);

-- Members: Allow public insert for joining
CREATE POLICY "Allow public insert to members" ON members
    FOR INSERT WITH CHECK (true);

-- Members: Allow public update for status changes
CREATE POLICY "Allow public update to members" ON members
    FOR UPDATE USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_sessions_updated_at 
    BEFORE UPDATE ON sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_members_updated_at 
    BEFORE UPDATE ON members 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing (optional)
-- INSERT INTO sessions (short_id, name, leader_name, expires_at) 
-- VALUES ('TEST123', 'Test Trip', 'John Doe', NOW() + INTERVAL '24 hours');

-- INSERT INTO members (session_id, name, role, status) 
-- SELECT id, 'John Doe', 'leader', 'present' FROM sessions WHERE short_id = 'TEST123';
