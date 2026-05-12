import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { createClient } from '@/utils/supabase/server';
import { SignUpForm } from './SignUpForm';

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
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
            Create your account
          </h1>
          <p className="mt-1.5 text-[13px] text-ink-3">
            Disclosure Hub for European banks
          </p>
        </div>

        <div className="rounded-xl border border-line bg-panel p-6 shadow-e60-sm">
          <SignUpForm next={params.next} />
        </div>

        <p className="mt-6 text-center text-[12.5px] text-ink-3">
          Already have an account?{' '}
          <a
            href={
              params.next
                ? `/login?next=${encodeURIComponent(params.next)}`
                : '/login'
            }
            className="font-medium text-nfq-blue hover:underline"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
