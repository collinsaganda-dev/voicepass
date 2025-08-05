-- VoicePass Database Setup for your Supabase project
-- Copy and paste this entire script into your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_code VARCHAR(8) UNIQUE NOT NULL,
    session_name VARCHAR(255) NOT NULL,
    description TEXT,
    organizer_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    max_speaking_time INTEGER DEFAULT 120,
    auto_approve BOOLEAN DEFAULT false,
    settings JSONB DEFAULT '{}'
);

-- Create participants table
CREATE TABLE IF NOT EXISTS participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    participant_name VARCHAR(255) NOT NULL,
    is_organizer BOOLEAN DEFAULT false,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    connection_id VARCHAR(255),
    is_connected BOOLEAN DEFAULT true
);

-- Create speaker_queue table
CREATE TABLE IF NOT EXISTS speaker_queue (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
    request_message TEXT,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'pending',
    queue_position INTEGER,
    approved_at TIMESTAMPTZ,
    speaking_started_at TIMESTAMPTZ,
    speaking_ended_at TIMESTAMPTZ
);

-- Create speaking_history table
CREATE TABLE IF NOT EXISTS speaking_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    was_muted BOOLEAN DEFAULT false
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_room_code ON sessions(room_code);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_participants_session ON participants(session_id);
CREATE INDEX IF NOT EXISTS idx_speaker_queue_session ON speaker_queue(session_id);
CREATE INDEX IF NOT EXISTS idx_speaker_queue_status ON speaker_queue(status);

-- Add compound indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_speaker_queue_session_status 
ON speaker_queue(session_id, status);

CREATE INDEX IF NOT EXISTS idx_speaking_history_session_participant 
ON speaking_history(session_id, participant_id);

-- Enable Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE speaker_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE speaking_history ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies (Open policies for demo - tighten in production)
CREATE POLICY "Public sessions access" ON sessions FOR ALL USING (true);
CREATE POLICY "Public participants access" ON participants FOR ALL USING (true);
CREATE POLICY "Public speaker queue access" ON speaker_queue FOR ALL USING (true);
CREATE POLICY "Public speaking history access" ON speaking_history FOR ALL USING (true);

-- Function to generate room codes
CREATE OR REPLACE FUNCTION generate_room_code()
RETURNS VARCHAR(8) AS $$
DECLARE
    chars VARCHAR(36) := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result VARCHAR(8) := '';
    i INTEGER;
    attempts INTEGER := 0;
    max_attempts INTEGER := 100;
BEGIN
    LOOP
        -- Generate new code
        result := '';
        FOR i IN 1..8 LOOP
            result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
        END LOOP;
        
        -- Check if code already exists
        IF NOT EXISTS(SELECT 1 FROM sessions WHERE room_code = result AND is_active = true) THEN
            RETURN result;
        END IF;
        
        -- Prevent infinite loop
        attempts := attempts + 1;
        IF attempts >= max_attempts THEN
            RAISE EXCEPTION 'Could not generate unique room code after % attempts', max_attempts;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to update queue positions
CREATE OR REPLACE FUNCTION update_queue_positions(session_uuid UUID)
RETURNS VOID AS $$
BEGIN
    WITH numbered_queue AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY requested_at) as new_position
        FROM speaker_queue 
        WHERE session_id = session_uuid AND status = 'pending'
    )
    UPDATE speaker_queue 
    SET queue_position = numbered_queue.new_position
    FROM numbered_queue 
    WHERE speaker_queue.id = numbered_queue.id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update queue positions
CREATE OR REPLACE FUNCTION trigger_update_queue_positions()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_queue_positions(COALESCE(NEW.session_id, OLD.session_id));
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_queue_positions_trigger ON speaker_queue;
CREATE TRIGGER update_queue_positions_trigger
    AFTER INSERT OR UPDATE OR DELETE ON speaker_queue
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_queue_positions();

-- Add timestamp trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sessions_timestamp
    BEFORE UPDATE ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add session cleanup function
CREATE OR REPLACE FUNCTION cleanup_inactive_sessions()
RETURNS void AS $$
BEGIN
    UPDATE sessions 
    SET is_active = false 
    WHERE created_at < NOW() - INTERVAL '24 hours'
    AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Create a daily cleanup job
SELECT cron.schedule(
    'cleanup-inactive-sessions',
    '0 0 * * *', -- Run at midnight every day
    $$SELECT cleanup_inactive_sessions();$$
);

-- Insert a demo session for testing (optional)
INSERT INTO sessions (room_code, session_name, organizer_name, description) 
VALUES ('DEMO2024', 'Demo VoicePass Session', 'Demo Organizer', 'This is a demo session for testing VoicePass functionality')
ON CONFLICT (room_code) DO NOTHING;

-- Verify tables were created
SELECT 'Tables created successfully!' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('sessions', 'participants', 'speaker_queue', 'speaking_history');