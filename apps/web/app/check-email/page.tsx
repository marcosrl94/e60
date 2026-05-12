import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { createClient } from '@/utils/supabase/server';

/**
 * /check-email — landing after a sign-up that did NOT yield a session
 * because Supabase has email confirmation ON. We tell the user to open
 * the link in their inbox. If they already have a session (e.g. they
 * confirmed in another tab and came back), bounce them to the dashboard.
 */
export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await searchParams;
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect('/disclosure-hub/overview' as Route);
  }

  const email = params.email ?? '';

  return (
    <div className="min-h-screen bg-canvas px-4 py-16">
      <div className="mx-auto w-full max-w-[440px]">
        <div className="mb-8 text-center">
          <div className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-nfq-blue">
            E6.0 · ESG Platform
          </div>
          <h1 className="text-[22px] font-semibold text-ink-1">
            Check your inbox
          </h1>
          <p className="mt-1.5 text-[13px] text-ink-3">
            We sent a confirmation link to activate your account.
          </p>
        </div>

        <div className="rounded-xl border border-line bg-panel p-6 shadow-e60-sm">
          <div className="mb-4 rounded-md border border-line-soft bg-canvas px-3 py-2.5 text-center">
            <div className="font-mono text-[10px] uppercase tracking-wider text-ink-4">
              Sent to
            </div>
            <div className="mt-1 font-mono text-[13px] text-ink-1">
              {email || 'your email'}
            </div>
          </div>

          <ol className="space-y-2.5 text-[12.5px] leading-relaxed text-ink-2">
            <li>
              <strong className="text-ink-1">1.</strong> Open the email
              titled <em className="text-ink-1">&ldquo;Confirm your
              signup&rdquo;</em>.
            </li>
            <li>
              <strong className="text-ink-1">2.</strong> Click the
              confirmation link{' '}
              <strong className="text-ink-1">
                from the same browser
              </strong>{' '}
              you signed up on. Opening it on a different device breaks
              the security handshake.
            </li>
            <li>
              <strong className="text-ink-1">3.</strong> You&apos;ll land
              back here, signed in automatically.
            </li>
          </ol>

          <div className="mt-5 rounded-md border border-line-soft bg-canvas px-3 py-2.5 text-[11.5px] leading-relaxed text-ink-3">
            <strong className="text-ink-2">Not seeing it?</strong> Check
            spam or promotions. Confirmation emails can take up to a
            minute to arrive.
          </div>
        </div>

        <p className="mt-6 text-center text-[12.5px] text-ink-3">
          Wrong email?{' '}
          <a href="/sign-up" className="font-medium text-nfq-blue hover:underline">
            Sign up again
          </a>{' '}
          ·{' '}
          <a href="/login" className="font-medium text-nfq-blue hover:underline">
            Back to sign in
          </a>
        </p>
      </div>
    </div>
  );
}
