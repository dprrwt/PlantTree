import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refreshes the Supabase auth session cookie on every request that matches the
// `config.matcher` below. Without this, the JWT can expire mid-session and the
// user gets silently logged out. Skipping it on static/asset/api routes.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  // Skip the session refresh on prefetch requests. When an authed page loads,
  // Next.js fires a prefetch for every link on it; if each one refreshes the
  // session, they race to rotate the same refresh token — the first wins and
  // invalidates it, the rest fail and @supabase/ssr clears the auth cookie,
  // silently logging the user out a few seconds after login. Real navigations
  // (the ones whose Set-Cookie the browser actually commits) still refresh.
  // Next.js sets `next-router-prefetch: 1` on its router prefetches; browsers
  // set `sec-purpose: prefetch` (or legacy `purpose: prefetch`) on speculative
  // ones. Any of them means "don't touch the session."
  const isPrefetch =
    request.headers.get("next-router-prefetch") === "1" ||
    request.headers.get("sec-purpose")?.includes("prefetch") === true ||
    request.headers.get("purpose") === "prefetch";
  if (isPrefetch) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Triggers a token refresh if the session is close to expiring.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    // Run on everything except static assets, image optimizer, favicon, and /api/health.
    "/((?!_next/static|_next/image|favicon.ico|api/health).*)",
  ],
};
