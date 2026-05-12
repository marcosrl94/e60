import { signOut } from '@/app/auth/actions';

/**
 * Friendly desktop-only screen shown below the `lg` breakpoint (1024px).
 *
 * The shell layout is a 64px + 220px + 1fr grid that needs ~900px of
 * width to look right. Rather than half-baked mobile support, we surface
 * an honest message + a sign-out form so a mobile visitor isn't stuck.
 */
export function MobileGate({ email }: { email?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 py-12">
      <div className="w-full max-w-[360px] rounded-xl border border-line bg-panel p-6 text-center shadow-e60-sm">
        <div className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-nfq-blue">
          E6.0 · ESG Platform
        </div>
        <h1 className="mb-2 text-[18px] font-semibold text-ink-1">
          Best on a larger screen
        </h1>
        <p className="text-[13px] leading-relaxed text-ink-3">
          The Disclosure Hub is designed for desktop workflows
          (≥ 768&nbsp;px). Open this link on your laptop or rotate
          your tablet to landscape to access the full app.
        </p>

        {email ? (
          <div className="mt-5 rounded-md border border-line bg-canvas px-3 py-2 text-[11.5px] text-ink-3">
            Signed in as{' '}
            <span className="font-mono text-ink-2">{email}</span>
          </div>
        ) : null}

        <form action={signOut} className="mt-5">
          <button
            type="submit"
            className="w-full rounded-md border border-line bg-canvas px-3 py-2.5 text-[13px] font-medium text-ink-1 transition-colors hover:border-nfq-blue/60 hover:bg-panel"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
