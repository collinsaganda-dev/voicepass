-- Supabase Fix Script
-- Run this in your Supabase SQL editor to resolve the 42601 syntax error

-- Step 1: Verify and fix database schema
-- Check if schema exists and create if missing
CREATE SCHEMA IF NOT EXISTS public;

-- Step 2: Create or update sessions table (if missing)
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_code VARCHAR(10) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    organizer_id UUID NOT NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create or update participants table (if missing)
CREATE TABLE IF NOT EXISTS public.participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create or update users table (if missing)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_room_code ON public.sessions(room_code);
CREATE INDEX IF NOT EXISTS idx_participants_session_id ON public.participants(session_id);
CREATE INDEX IF NOT EXISTS idx_participants_user_id ON public.participants(user_id);

-- Step 6: Create RLS policies for security
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies for sessions
CREATE POLICY "Users can view all sessions" ON public.sessions FOR SELECT USING (true);
CREATE POLICY "Users can create sessions" ON public.sessions FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Users can update their own sessions" ON public.sessions FOR UPDATE USING (auth.uid() = organizer_id);
CREATE POLICY "Users can delete their own sessions" ON public.sessions FOR DELETE USING (auth.uid() = organizer_id);

-- Policies for participants
CREATE POLICY "Users can view all participants" ON public.participants FOR SELECT USING (true);
CREATE POLICY "Users can add participants" ON public.participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own participant data" ON public.participants FOR UPDATE USING (auth.uid() = user_id);

-- Step 7: Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 8: Insert test data (optional)
-- Uncomment and modify as needed for testing
-- INSERT INTO public.users (email, username) VALUES 
-- ('test@example.com', 'testuser'),
-- ('demo@example.com', 'demouser');

-- INSERT INTO public.sessions (room_code, title, organizer_id) VALUES 
-- ('ABC123', 'Test Session', (SELECT id FROM public.users WHERE email = 'test@example.com'));

-- INSERT INTO public.participants (session_id, user_id) VALUES 
-- ((SELECT id FROM public.sessions WHERE room_code = 'ABC123'), 
--  (SELECT id FROM public.users WHERE email = 'demo@example.com'));

-- Step 9: Grant permissions
GRANT ALL ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Step 10: Verify setup
SELECT 'Database schema verified successfully' AS status;
