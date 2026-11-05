import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ENV, isSupabaseConfigured } from './env.js';

let supabaseClient: SupabaseClient | null = null;
let supabaseAdminClient: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  supabaseClient = createClient(
    ENV.SUPABASE_URL,
    ENV.SUPABASE_ANON_KEY || ENV.SUPABASE_SERVICE_ROLE_KEY
  );

  supabaseAdminClient = createClient(
    ENV.SUPABASE_URL,
    ENV.SUPABASE_SERVICE_ROLE_KEY || ENV.SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
  console.log('✅ Supabase client initialized with provided credentials.');
} else {
  console.warn(
    '⚠️ Supabase credentials not found or incomplete in server/.env. Backend will run in demo/mock mode for testing.'
  );
}

export const getSupabase = (): SupabaseClient | null => supabaseClient;
export const getSupabaseAdmin = (): SupabaseClient | null => supabaseAdminClient;

