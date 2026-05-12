import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * OAuth callback handler.
 *
 * Google redirects here (via Supabase) with a `code` query param after the
 * user authorises. We exchange the code for a session — cookies get set
 * via the SSR client — and then redirect to the original `next` path.
 *
 * If the exchange fails we surface the message in the URL so the login
 * page can render it inline.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const rawNext = url.searchParams.get('next') ?? '/disclosure-hub/overview';
  // Guard against open-redirect — only same-origin relative paths.
  const next =
    rawNext.startsWith('/') && !rawNext.startsWith('//')
      ? rawNext
      : '/disclosure-hub/overview';

  if (!code) {
    return NextResponse.redirect(
      new URL('/login?error=missing_code', request.url),
    );
  }

  const supabase = createClient(await cookies());
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(error.message)}`,
        request.url,
      ),
    );
  }

  return NextResponse.redirect(new URL(next, request.url));
}
