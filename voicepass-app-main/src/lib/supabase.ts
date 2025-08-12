import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zlgwvfqlhixugfmdjtci.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsZ3d2ZnFsaGl4dWdmbWRqdGNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTEyNzUsImV4cCI6MjA2OTg2NzI3NX0.sZAyzzjKrW3iAxRbL8K5ktn16vuRy1Pj9GPUIK0KnJI'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Database helpers
export const generateRoomCode = async (): Promise<string> => {
  const { data, error } = await supabase.rpc('generate_room_code')
  if (error) throw error
  return data
}
