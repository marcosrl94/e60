/**
 * Translate raw Supabase / OAuth error strings into plain-English copy
 * we want to surface to the user. Anything we don't recognise falls
 * through unchanged so the underlying Supabase message still reaches
 * the user — better an ugly accurate error than a silent failure.
 */
export function translateAuthError(raw: string): string {
  if (raw === 'missing_code') {
    return 'Sign-in could not complete. Please try again.';
  }
  if (raw.startsWith('PKCE code verifier not found')) {
    return 'Open the email link from the same browser you signed up on. If that’s not possible, sign in below with your password instead.';
  }
  if (raw === 'Invalid login credentials') {
    return 'That email/password combination is not recognised.';
  }
  if (raw.startsWith('Email not confirmed')) {
    return 'Confirm your email first — check your inbox for the activation link.';
  }
  if (raw.startsWith('Email rate limit exceeded')) {
    return 'Too many requests. Wait a minute and try again.';
  }
  if (raw === 'User already registered') {
    return 'An account with this email already exists. Sign in instead.';
  }
  return raw;
}
