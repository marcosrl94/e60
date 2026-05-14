import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/__tests__/**',
        'src/index.ts', // root barrel only — module barrels carry real logic
      ],
      thresholds: {
        // Phase 7 target per SCALABILITY.md §18.3: 50% en domain.
        // Bumps to 70% when snapshot/output engine code lands.
        lines: 50,
        functions: 50,
        branches: 50,
        statements: 50,
      },
    },
  },
});
