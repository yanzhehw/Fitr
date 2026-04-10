import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

/**
 * Lazily creates and caches a Supabase client instance.
 *
 * Throws if VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY are not set.
 * Copy `.env.example` to `.env.local` and fill in real values from your
 * Supabase project's API settings.
 */
export function getSupabaseClient(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      '[Fitr] Supabase env vars are not set. Copy .env.example to .env.local and fill in your project credentials.',
    );
  }

  cachedClient = createClient(url, key);
  return cachedClient;
}
