import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * A Supabase client for public reads on the server (no signed-in user). Row level security
 * only returns public profiles and published filmmaker profiles through it.
 */
let client: SupabaseClient | null = null;

export function getPublicSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  if (!client) client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}
