import { createClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a singleton client for client-side usage
let clientInstance: ReturnType<typeof createClient> | null = null;

export const createClientSupabaseClient = () => {
  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return clientInstance;
};

// For server components, create a fresh instance each time
export const createServerSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseKey);
}; 