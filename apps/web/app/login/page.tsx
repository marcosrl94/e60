import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { createClient } from '@/utils/supabase/server';
import { LoginForm } from './LoginForm';

/**
 * /login — sign-in surface for both email/password and Google.
 *
 * If the user already has a session we bounce them to the dashboard
 * immediately — no point rendering the form. The `?next=` query param
 * survives the redirect chain so deep links land on the right route.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect((params.next ?? '/disclosure-hub/overview') as Route);
  }

  return (
    <div className="min-h-screen bg-canvas px-4 py-16">
      <div className="mx-auto w-full max-w-[400px]">
        <div className="mb-8 text-center">
          <div className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-nfq-blue">
            E6.0 · ESG Platform
          </div>
          <h1 className="text-[22px] font-semibold text-ink-1">
            Sign in to continue
          </h1>
          <p className="mt-1.5 text-[13px] text-ink-3">
            Disclosure Hub for European banks
          </p>
        </div>

        <div className="rounded-xl border border-line bg-panel p-6 shadow-e60-sm">
          <LoginForm next={params.next} initialError={params.error} />
        </div>

        <p className="mt-6 text-center text-[12.5px] text-ink-3">
          Don&apos;t have an account?{' '}
          <a
            href={
              params.next
                ? `/sign-up?next=${encodeURIComponent(params.next)}`
                : '/sign-up'
            }
            className="font-medium text-nfq-blue hover:underline"
          >
            Create one
          </a>
        </p>
      </div>
    </div>
  );
}
