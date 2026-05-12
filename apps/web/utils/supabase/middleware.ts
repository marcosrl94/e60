import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Paths that don't require authentication. Anything else under the matcher
 * (see /apps/web/middleware.ts) bounces to /login when the visitor has no
 * session.
 */
const PUBLIC_PATHS = new Set<string>([
  '/login',
  '/sign-up',
  '/check-email',
]);
const PUBLIC_PREFIXES = ['/auth/'];

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/**
 * updateSession refreshes the Supabase auth cookie on every request and
 * gates protected routes:
 *
 *  - No user + protected path  → 302 /login?next=<original>
 *  - Authed user + /login|/sign-up → 302 /disclosure-hub/overview
 *
 * Without the cookie refresh the JWT eventually expires and Server
 * Components silently lose their session. Without the gate any anonymous
 * visitor would render the shell with empty data.
 *
 * If Supabase env vars are missing (e.g. preview deploy without the
 * Vercel integration), we skip both refresh and gating rather than crash
 * the whole edge — better degraded UX than a 500 wall.
 */
export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers },
  });

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;

  if (!user && !isPublic(pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(loginUrl);
  }

  if (user && (pathname === '/login' || pathname === '/sign-up')) {
    const dashboard = request.nextUrl.clone();
    dashboard.pathname = '/disclosure-hub/overview';
    dashboard.search = '';
    return NextResponse.redirect(dashboard);
  }

  return supabaseResponse;
};
