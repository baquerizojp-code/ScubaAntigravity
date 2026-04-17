import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Next 16 "proxy" (formerly middleware). Runs before every matched request
 * to refresh the Supabase session cookie so Server Components see an
 * up-to-date user on render.
 *
 * Auth-based redirects (e.g. gating /admin) are intentionally NOT here —
 * those live in per-route layouts in Phase D so role checks happen with the
 * database session, not just an access token.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

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
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Critical: call getUser() (not getSession()) so @supabase/ssr validates
  // the JWT against the Supabase Auth server and refreshes it if expired.
  await supabase.auth.getUser();

  return response;
}

// Proxy in Next 16 always runs on Node.js — no runtime export allowed.
export const config = {
  matcher: [
    // Skip Next internals, static files, and common asset extensions.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?|ttf)$).*)',
  ],
};
