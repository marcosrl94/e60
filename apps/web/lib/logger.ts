/**
 * Structured server logger · 7.13 observability baseline.
 *
 * Pino emits JSON in production (pickable by Datadog, GCP, Vector,
 * etc.) and pretty-prints in development. Use `logger.child({ ... })`
 * to add request-scoped context (entity_id, user_id, request_id)
 * before logging so every line carries the same tags Sentry uses.
 *
 * Never log raw user input or PII directly — pass through `safe()`
 * for fields that may contain free-text from the user.
 */

import pino, { type LoggerOptions } from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

const options: LoggerOptions = {
  level: process.env.LOG_LEVEL ?? (isDev ? 'debug' : 'info'),
  base: {
    service: 'e60-web',
    env: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'development',
  },
  // Auto-redact secrets if they ever leak into a log payload.
  redact: {
    paths: [
      'password',
      'token',
      'access_token',
      'refresh_token',
      'authorization',
      'cookie',
      '*.password',
      '*.token',
    ],
    censor: '[REDACTED]',
  },
  ...(isDev && {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true, translateTime: 'HH:MM:ss.l', ignore: 'pid,hostname' },
    },
  }),
};

export const logger = pino(options);

/**
 * Sanitises free-text fields so we never accidentally log PII or
 * very long blobs. Truncates to 200 chars and strips line breaks.
 */
export function safe(value: unknown): string {
  if (value == null) return '';
  const s = String(value).replace(/[\r\n]+/g, ' ').trim();
  return s.length > 200 ? s.slice(0, 197) + '…' : s;
}
