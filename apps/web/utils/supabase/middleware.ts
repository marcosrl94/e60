import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Vercel sometimes routes requests through the team-alias hostnames
 * (`e60-web-marcosrl94s-projects.vercel.app`, the per-branch alias) even
 * when the user typed the canonical `e60-web.vercel.app`. Cookies set
 * on one don't carry to the other, so users keep landing on the wrong
 * URL after auth round-trips. We force-redirect those aliases to the
 * canonical host before doing anything else.
 *
 * Preview deployments (`e60-<hash>-marcosrl94s-projects.vercel.app`)
 * are intentional and stay as-is.
 */
const CANONICAL_HOST = 'e60-web.vercel.app';
const ALIASES_TO_REWRITE = new Set<string>([
  'e60-web-marcosrl94s-projects.vercel.app',
  'e60-web-git-main-marcosrl94s-projects.vercel.app',
]);

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
  // ── Canonical-host redirect ──────────────────────────────────────
  // Vercel may route through the team-alias hostnames even when the
  // user typed the canonical URL. Force them onto the canonical host
  // so cookies + OAuth redirects stay on a single domain.
  const requestHost =
    request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? '';
  if (ALIASES_TO_REWRITE.has(requestHost)) {
    const target = new URL(request.nextUrl.toString());
    target.host = CANONICAL_HOST;
    return NextResponse.redirect(target, 308);
  }

  // ── Stray OAuth code rescue ──────────────────────────────────────
  // If Supabase's Redirect URL allowlist isn't configured to include
  // /auth/callback, Supabase falls back to Site URL and dumps the
  // ?code= at the root. Catch that and redirect it to /auth/callback
  // so the code-for-session exchange still succeeds. The `next` query
  // param is preserved by appending the original path that was being
  // bounced to.
  const code = request.nextUrl.searchParams.get('code');
  if (code && request.nextUrl.pathname !== '/auth/callback') {
    const callback = request.nextUrl.clone();
    const next = request.nextUrl.pathname === '/' ? '/' : request.nextUrl.pathname;
    callback.pathname = '/auth/callback';
    callback.search = `?code=${encodeURIComponent(code)}&next=${encodeURIComponent(next)}`;
    return NextResponse.redirect(callback);
  }

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
