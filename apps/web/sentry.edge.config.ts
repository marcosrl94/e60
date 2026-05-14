/**
 * Sentry edge runtime init · 7.13 observability baseline.
 *
 * Loaded by the edge runtime (middleware, edge route handlers).
 * Lighter than the server config — no source map uploads, no
 * profiling integrations.
 */

import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),
    sendDefaultPii: false,
  });
}
