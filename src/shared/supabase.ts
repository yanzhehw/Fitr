import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

/**
 * Lazily creates and caches a Supabase client instance.
 *
 * Throws if VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY are not set.
 * Copy `.env.example` to `.env.local` and fill in real values from your
 * Supabase project's API settings.
 *
 * Note: this currently uses Supabase's default session storage. When real
 * auth flows are added (PRD §4.1 onboarding), wire up a chrome.storage
 * adapter so sessions persist consistently across the popup, options page,
 * content script, and background service worker.
 */
export function getSupabaseClient(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      '[Fitr] Supabase env vars are not set. Copy .env.example to .env.local and fill in your project credentials.',
    );
  }

  cachedClient = createClient(url, key);
  return cachedClient;
}
