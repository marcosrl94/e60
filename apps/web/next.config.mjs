import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { withSentryConfig } from '@sentry/nextjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Transpile our internal workspace packages so Next compiles their TS source.
  transpilePackages: ['@e60/ui', '@e60/domain', '@e60/api-client'],
  // Typed routes (stable in Next 15)
  typedRoutes: true,
  // Pin the workspace root so Next ignores any stray lockfile higher up the tree.
  outputFileTracingRoot: path.join(__dirname, '../..'),
};

// 7.13 · Wrap with Sentry. The plugin is a passthrough when no auth
// token + DSN are configured, so local dev without Sentry stays
// quiet. Source-map upload activates in CI when SENTRY_AUTH_TOKEN is
// set as a repo secret.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  reactComponentAnnotation: { enabled: true },
  // Tunnel ad-blockers tend to swallow /sentry.io/*; route via a same-
  // origin path so client breadcrumbs survive corporate proxies too.
  tunnelRoute: '/monitoring',
  disableLogger: true,
  automaticVercelMonitors: true,
});
