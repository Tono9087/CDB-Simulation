/**
 * Supabase Connection Utility for Vercel Serverless Functions
 *
 * Replaces _mongodb.js — uses the Supabase JS client (service role key)
 * to interact with the `victims` table.
 */

import { createClient } from '@supabase/supabase-js';

let supabase = null;

/**
 * Returns a singleton Supabase client (service role — bypasses RLS)
 */
export function getSupabaseClient() {
  if (supabase) return supabase;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables must be set');
  }

  supabase = createClient(url, key, {
    auth: { persistSession: false },
  });

  return supabase;
}
