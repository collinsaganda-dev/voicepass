import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Declare environment variables types
declare global {
  interface ImportMeta {
    readonly env: {
      VITE_SUPABASE_URL: string;
      VITE_SUPABASE_ANON_KEY: string;
    };
  }
}

// Type check environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    `Missing environment variables: ${!supabaseUrl ? 'VITE_SUPABASE_URL' : ''} ${
      !supabaseAnonKey ? 'VITE_SUPABASE_ANON_KEY' : ''
    }`
  );
}

export const supabase: SupabaseClient<Database> = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: { 'x-application-name': 'voicepass-app' },
    }
  }
);

// Validate connection with retry logic
export async function validateConnection(retries = 3): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await Promise.race([
        supabase.from('sessions').select('count', { count: 'exact', head: true }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 5000)
        )
      ]);
      
      const typedResult = result as { error?: { message: string } };
      if (!typedResult.error) return true;
      
      console.warn(`Connection attempt ${i + 1} failed:`, typedResult.error.message);
      if (i < retries - 1) await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`Connection attempt ${i + 1} failed:`, error);
      if (i < retries - 1) await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return false;
}

// Error handling is handled through auth state changes
