/**
 * Next.js instrumentation hook · 7.13.
 *
 * Runs once at server start for each runtime (nodejs · edge). Loads
 * the Sentry config that matches; the config is a no-op when no DSN
 * is set, so dev without observability stays quiet.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

export { captureRequestError as onRequestError } from '@sentry/nextjs';
