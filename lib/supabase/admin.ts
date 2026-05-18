import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Server-only admin client that bypasses RLS. Use ONLY in trusted server code
// (route handlers, server actions, scheduled jobs) — never expose to the browser.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
