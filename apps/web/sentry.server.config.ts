/**
 * Sentry server-side init · 7.13 observability baseline.
 *
 * Captures unhandled errors + server-side traces. Same DSN as the
 * client config; server-only secret stays in `SENTRY_AUTH_TOKEN` for
 * source map upload during build (not used at runtime).
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
