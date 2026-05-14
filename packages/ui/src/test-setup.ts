import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Unmount all rendered trees + clear the document between tests so
// one test's DOM doesn't leak to the next.
afterEach(() => {
  cleanup();
});
