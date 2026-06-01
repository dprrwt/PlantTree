import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST-only on purpose. Logout mutates state (clears the session), so it must
// never be reachable by GET: Next.js prefetches <Link>s in production, and a
// prefetched GET logout silently signs the user out a few seconds after login.
// The sign-out control is a POST form (see the authed layout) — prefetch only
// issues GETs, so it can never trigger this. A stray GET gets 405, not a logout.
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/admin/login", request.url), {
    status: 303,
  });
}
