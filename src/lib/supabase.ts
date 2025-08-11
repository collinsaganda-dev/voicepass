import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Enhanced environment variable handling
declare global {
  interface ImportMeta {
    readonly env: {
      VITE_SUPABASE_URL: string;
      VITE_SUPABASE_ANON_KEY: string;
      VITE_SUPABASE_SERVICE_ROLE_KEY?: string;
    };
  }
}

// Validate environment variables with better error messages
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const missingVars = [];
  if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL');
  if (!supabaseAnonKey) missingVars.push('VITE_SUPABASE_ANON_KEY');
  
  throw new Error(
    `Missing required environment variables: ${missingVars.join(', ')}. Please check your .env file.`
  );
}

// Enhanced Supabase client configuration
export const supabase: SupabaseClient<Database> = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: { 
        'x-application-name': 'voicepass-app',
        'x-client-version': '1.0.0'
      },
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// Enhanced error handling utilities
export class SupabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'SupabaseError';
  }
}

export function handleSupabaseError(error: any): SupabaseError {
  if (error?.code) {
    switch (error.code) {
      case 'PGRST116':
        return new SupabaseError('Resource not found', error.code);
      case '23505':
        return new SupabaseError('Duplicate entry', error.code);
      case '23503':
        return new SupabaseError('Foreign key constraint violation', error.code);
      case '42501':
        return new SupabaseError('Permission denied', error.code);
      default:
        return new SupabaseError(error.message || 'Database error', error.code);
    }
  }
  
  return new SupabaseError(error?.message || 'Unknown error occurred');
}

// Enhanced session management
export const auth = {
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw handleSupabaseError(error);
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof SupabaseError ? error : handleSupabaseError(error) };
    }
  },

  async signUp(email: string, password: string, metadata?: any) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });
      
      if (error) throw handleSupabaseError(error);
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof SupabaseError ? error : handleSupabaseError(error) };
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw handleSupabaseError(error);
      return { error: null };
    } catch (error) {
      return { error: error instanceof SupabaseError ? error : handleSupabaseError(error) };
    }
  },

  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw handleSupabaseError(error);
      return { session, error: null };
    } catch (error) {
      return { session: null, error: error instanceof SupabaseError ? error : handleSupabaseError(error) };
    }
  },

  async getUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw handleSupabaseError(error);
      return { user, error: null };
    } catch (error) {
      return { user: null, error: error instanceof SupabaseError ? error : handleSupabaseError(error) };
    }
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Enhanced database operations
export const db = {
  // Sessions operations
  async createSession(data: {
    room_code: string;
    title: string;
    description?: string;
    organizer_id: string;
    settings?: any;
  }) {
    try {
      const { data: session, error } = await supabase
        .from('sessions')
        .insert([data])
        .select()
        .single();
      
      if (error) throw handleSupabaseError(error);
      return { data: session, error: null };
    } catch (error) {
      return { data: null, error: error instanceof SupabaseError ? error : handleSupabaseError(error) };
    }
  },

  async getSession(roomCode: string) {
    try {
      const { data: session, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('room_code', roomCode)
        .single();
      
      if (error) throw handleSupabaseError(error);
      return { data: session, error: null };
    } catch (error) {
      return { data: null, error: error instanceof SupabaseError ? error : handleSupabaseError(error) };
    }
  },

  async updateSession(roomCode: string, updates: any) {
    try {
      const { data: session, error } = await supabase
        .from('sessions')
        .update(updates)
        .eq('room_code', roomCode)
        .select()
        .single();
      
      if (error) throw handleSupabaseError(error);
      return { data: session, error: null };
    } catch (error) {
      return { data: null, error: error instanceof SupabaseError ? error : handleSupabaseError(error) };
    }
  },

  async deleteSession(roomCode: string) {
    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('room_code', roomCode);
      
      if (error) throw handleSupabaseError(error);
      return { error: null };
    } catch (error) {
      return { error: error instanceof SupabaseError ? error : handleSupabaseError(error) };
    }
  },

  // Participants operations
  async addParticipant(sessionId: string, userId: string, metadata?: any) {
    try {
      const { data: participant, error } = await supabase
        .from('participants')
        .insert([{
          session_id: sessionId,
          user_id: userId,
          metadata: metadata || {},
        }])
        .select()
        .single();
      
      if (error) throw handleSupabaseError(error);
      return { data: participant, error: null };
    } catch (error) {
      return { data: null, error: error instanceof SupabaseError ? error : handleSupabaseError(error) };
    }
  },

  async getParticipants(sessionId: string) {
    try {
      const { data: participants, error } = await supabase
        .from('participants')
        .select('*')
        .eq('session_id', sessionId);
      
      if (error) throw handleSupabaseError(error);
      return { data: participants, error: null };
    } catch (error) {
      return { data: null, error: error instanceof SupabaseError ? error : handleSupabaseError(error) };
    }
  },

  // Real-time subscriptions
  subscribeToSession(roomCode: string, callback: (payload: any) => void) {
    return supabase
      .channel(`session:${roomCode}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sessions', filter: `room_code=eq.${roomCode}` },
        callback
      )
      .subscribe();
  },

  subscribeToParticipants(sessionId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`participants:${sessionId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'participants', filter: `session_id=eq.${sessionId}` },
        callback
      )
      .subscribe();
  }
};

// Real-time presence
export const presence = {
  async trackPresence(userId: string, roomCode: string, status: string) {
    try {
      const { error } = await supabase
        .from('presence')
        .upsert({
          user_id: userId,
          room_code: roomCode,
          status,
          last_seen: new Date().toISOString(),
        });
      
      if (error) throw handleSupabaseError(error);
      return { error: null };
    } catch (error) {
      return { error: error instanceof SupabaseError ? error : handleSupabaseError(error) };
    }
  },

  async getPresence(roomCode: string) {
    try {
      const { data: presence, error } = await supabase
        .from('presence')
        .select('*')
        .eq('room_code', roomCode)
        .gt('last_seen', new Date(Date.now() - 300000).toISOString()); // 5 minutes
      
      if (error) throw handleSupabaseError(error);
      return { data: presence, error: null };
    } catch (error) {
      return { data: null, error: error instanceof SupabaseError ? error : handleSupabaseError(error) };
    }
  }
};

// Export types
export type { Database } from '../types/supabase';
export type { SupabaseError };
