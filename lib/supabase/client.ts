import { createBrowserClient } from "@supabase/ssr";

function makeClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // The session is owned server-side: server actions set the auth cookie
        // and proxy.ts refreshes it. The browser client only reads it (realtime
        // auth) or writes it once (the email-link callback's setSession). It must
        // NOT run its own refresh loop — concurrent client + server refreshes
        // rotate the refresh token against each other, the loser's refresh fails,
        // and @supabase/ssr clears the auth cookie, logging the user out.
        autoRefreshToken: false,
      },
    },
  );
}

// One shared browser client for the whole tab. @supabase/ssr warns that
// creating multiple instances makes them fight over the same auth cookie —
// and the donor grove mounts one per MessageThread, which is exactly what was
// silently logging users out a few seconds after login.
let browserClient: ReturnType<typeof makeClient> | undefined;

export function createClient() {
  return (browserClient ??= makeClient());
}
