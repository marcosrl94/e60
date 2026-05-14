/**
 * Sentry client-side init · 7.13 observability baseline.
 *
 * Only enabled when `NEXT_PUBLIC_SENTRY_DSN` is set so local dev
 * (without a DSN) stays quiet. Tags planned per §18.8 audit:
 * `tenant`, `entity_id`, `user_id`. `user_id` is attached via
 * `Sentry.setUser()` on auth events; the other two come from the
 * tenant resolution layer that lands with 7.4 multi-tenant.
 */

import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
    // Conservative sample rates for the baseline — bump per env via
    // `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE` when traffic warrants it.
    tracesSampleRate: Number(
      process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? '0.1',
    ),
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
    // Strip PII from breadcrumbs (Supabase JWT in headers, user emails
    // in URL params during auth flows, etc.).
    sendDefaultPii: false,
    integrations: [Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true })],
  });
}
