import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * updateSession refreshes the Supabase auth cookie on every request that
 * hits the Next.js middleware. Without this, the JWT eventually expires
 * and Server Components silently lose their session.
 *
 * If Supabase env vars are missing (e.g. preview deploy without integration),
 * we skip the refresh rather than crash the whole edge — auth-dependent
 * routes will still hit a non-authed Supabase client downstream.
 */
export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
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

  // Triggers the cookie refresh; we don't read the user here.
  await supabase.auth.getUser();

  return supabaseResponse;
};
