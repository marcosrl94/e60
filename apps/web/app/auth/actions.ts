'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { createClient } from '@/utils/supabase/server';

/**
 * Auth server actions.
 *
 * All auth happens server-side so cookies get set through the SSR client
 * (see utils/supabase/server.ts). Forms post here; on success we redirect,
 * on failure we return { error } for the client form to render.
 *
 * Note on Google OAuth: `signInWithOAuth` doesn't set cookies itself — it
 * just builds the Google auth URL. We redirect the browser to that URL,
 * Google bounces back to /auth/callback with a `code`, and the callback
 * route handler exchanges it for a session.
 */

type ActionResult = { error: string } | undefined;

function sanitizeNext(value: FormDataEntryValue | null): string {
  const raw = typeof value === 'string' ? value : '';
  // Only allow same-origin relative paths to prevent open-redirect.
  if (!raw.startsWith('/') || raw.startsWith('//')) {
    return '/disclosure-hub/overview';
  }
  return raw;
}

async function getOrigin(): Promise<string> {
  const h = await headers();
  // On Vercel, `host` can resolve to the deployment's canonical name
  // (e.g. e60-web-marcosrl94s-projects.vercel.app, which is behind
  // Vercel SSO) even when the user navigates on the public alias
  // (e60-web.vercel.app). `x-forwarded-host` is the user-facing
  // hostname — use it first so OAuth redirects land back where the
  // visitor actually is.
  const host =
    h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto =
    h.get('x-forwarded-proto') ??
    (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

export async function signInWithEmail(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const next = sanitizeNext(formData.get('next'));

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  const supabase = createClient(await cookies());
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: error.message };
  }
  redirect(next as Route);
}

export async function signUpWithEmail(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const next = sanitizeNext(formData.get('next'));

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }
  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' };
  }

  const supabase = createClient(await cookies());
  const origin = await getOrigin();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) {
    return { error: error.message };
  }
  // Email confirmation is OFF for the demo project — signUp returns a
  // session synchronously and cookies are set. Redirect straight to the
  // intended destination. If you flip confirmations ON later, you'll
  // want to show a "check your inbox" screen here instead.
  redirect(next as Route);
}

export async function signInWithGoogle(formData: FormData): Promise<ActionResult> {
  const next = sanitizeNext(formData.get('next'));
  const supabase = createClient(await cookies());
  const origin = await getOrigin();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error || !data.url) {
    return { error: error?.message ?? 'Could not start Google sign-in.' };
  }
  redirect(data.url as Route);
}

export async function signOut(): Promise<void> {
  const supabase = createClient(await cookies());
  await supabase.auth.signOut();
  redirect('/login' as Route);
}
