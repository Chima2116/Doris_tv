import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * The Supabase client for the browser. Uses the publishable key only, which is safe to ship;
 * row level security in the database decides what each signed-in person can read and change.
 * Returns null when the variables are missing, so the site still loads without a backend.
 */
export const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

let client: SupabaseClient | null = null;

export function getSupabase() {
  if (!supabaseConfigured) return null;
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    );
  }
  return client;
}
