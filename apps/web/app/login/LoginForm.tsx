'use client';

import { useState, useTransition } from 'react';
import { signInWithEmail, signInWithGoogle } from '@/app/auth/actions';
import { translateAuthError } from '@/app/auth/translate';

const GOOGLE_LOGO = (
  <svg viewBox="0 0 18 18" className="h-[15px] w-[15px]" aria-hidden>
    <path
      d="M17.64 9.205c0-.638-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
      fill="#4285F4"
    />
    <path
      d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.583-5.036-3.71H.957v2.332A8.997 8.997 0 009 18z"
      fill="#34A853"
    />
    <path
      d="M3.964 10.712A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.712V4.956H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.044l3.007-2.332z"
      fill="#FBBC05"
    />
    <path
      d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.956L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      fill="#EA4335"
    />
  </svg>
);

export function LoginForm({
  next,
  initialError,
}: {
  next?: string;
  initialError?: string;
}) {
  const [error, setError] = useState<string | undefined>(
    initialError ? translateAuthError(initialError) : undefined,
  );
  const [isPending, startTransition] = useTransition();

  const handleEmailSubmit = (formData: FormData) => {
    setError(undefined);
    startTransition(async () => {
      const result = await signInWithEmail(formData);
      if (result?.error) setError(translateAuthError(result.error));
    });
  };

  const handleGoogleSubmit = (formData: FormData) => {
    setError(undefined);
    startTransition(async () => {
      const result = await signInWithGoogle(formData);
      if (result?.error) setError(translateAuthError(result.error));
    });
  };

  return (
    <div className="space-y-5">
      {error ? (
        <div
          role="alert"
          className="rounded-md border border-nfq-red/30 bg-nfq-red/5 px-3 py-2 text-[12px] text-nfq-red"
        >
          {error}
        </div>
      ) : null}

      <form action={handleGoogleSubmit}>
        <input type="hidden" name="next" value={next ?? ''} />
        <button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2.5 rounded-md border border-line bg-canvas px-3 py-2.5 text-[13px] font-medium text-ink-1 transition-colors hover:border-nfq-blue/60 hover:bg-panel disabled:cursor-not-allowed disabled:opacity-60"
        >
          {GOOGLE_LOGO}
          Continue with Google
        </button>
      </form>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="font-mono text-[10px] uppercase tracking-wider text-ink-4">
          or
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <form action={handleEmailSubmit} className="space-y-3">
        <input type="hidden" name="next" value={next ?? ''} />
        <label className="block">
          <span className="mb-1 block text-[11.5px] font-medium text-ink-2">
            Email
          </span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className="w-full rounded-md border border-line bg-canvas px-3 py-2 text-[13px] text-ink-1 focus:border-nfq-blue focus:outline-none focus:ring-2 focus:ring-nfq-blue/20"
            placeholder="you@bank.com"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11.5px] font-medium text-ink-2">
            Password
          </span>
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className="w-full rounded-md border border-line bg-canvas px-3 py-2 text-[13px] text-ink-1 focus:border-nfq-blue focus:outline-none focus:ring-2 focus:ring-nfq-blue/20"
          />
        </label>
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-nfq-blue px-3 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-nfq-blue/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
