/**
 * Mock handlers for local development without a running backend.
 *
 * Stub for now; populate with MSW handlers once the team chooses
 * a mocking approach. Recommended: msw v2 with HTTP handlers per endpoint,
 * seeded with the data shape from `_mockups/` HTML files.
 *
 * Usage in a test or dev setup:
 *
 *   import { setupServer } from 'msw/node';
 *   import { handlers } from '@e60/api-client/mock';
 *   const server = setupServer(...handlers);
 */

export const handlers: never[] = [];
