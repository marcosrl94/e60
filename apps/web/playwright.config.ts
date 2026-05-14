import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright smoke harness · 7.12-C baseline.
 *
 * One project, chromium-only, hitting a local Next dev server. The
 * config reuses an already-running server (port 3000) when available
 * so local `pnpm dev` keeps working alongside the test runner; in CI
 * the webServer block always boots fresh.
 *
 * Run: `pnpm --filter @e60/web test:e2e`
 *
 * NOTE: Not yet wired to CI — the workflow would need to install
 * chromium (`pnpm exec playwright install --with-deps chromium`) +
 * boot the Next server. Tracked as part of 7.11 CI hardening.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://127.0.0.1:3000/login',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
