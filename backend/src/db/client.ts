import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

/**
 * Returns a Supabase client using the service-role key.
 * This bypasses RLS — intended for backend use only.
 */
export function getServiceClient(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      '[Fitr Backend] SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set. See backend/.env.example.',
    );
  }

  cachedClient = createClient(url, key);
  return cachedClient;
}
