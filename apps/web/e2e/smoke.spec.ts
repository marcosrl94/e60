import { test, expect } from '@playwright/test';

/**
 * Smoke harness · 7.12-C baseline.
 *
 * Single assertion that the dev server boots, the middleware/auth
 * stack does not crash, and the login surface renders. Future tests
 * (logged-in journeys) need a seeded session via Supabase Auth's
 * admin API — out of scope for the baseline.
 */

test.describe('smoke', () => {
  test('root redirects to /login when unauthenticated', async ({ page }) => {
    const response = await page.goto('/');
    // The Next middleware bounces unauthenticated traffic to /login;
    // either we land directly on /login (most likely) or the chain
    // resolves to /login via a 30x.
    expect(page.url()).toMatch(/\/login/);
    // The page payload is HTML 200 after the redirect.
    expect(response?.ok()).toBe(true);
  });

  test('/login renders the sign-in form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  });
});
