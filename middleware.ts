import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refreshes the Supabase auth session cookie on every request that matches the
// `config.matcher` below. Without this, the JWT can expire mid-session and the
// user gets silently logged out. Skipping it on static/asset/api routes.
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

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
