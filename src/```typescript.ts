```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project-ref.supabase.co';
const supabaseAnonKey = 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function validateConnection(retries = 3): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      // Check connection using a simple query
      const { data, error } = await supabase.from('sessions').select('id').limit(1);
      
      if (!error) return true;
      
      console.warn(`Connection attempt ${i + 1} failed:`, error.message);
      if (i < retries - 1) await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`Connection attempt ${i + 1} failed:`, error);
      if (i < retries - 1) await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return false;
}
```