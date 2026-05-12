// Flat ESLint config for the @e60 workspace.
//
// ESLint 9 dropped legacy .eslintrc.* support in favour of this format.
// Single config covers every package — root invocations and per-package
// runs both resolve here. Rules are deliberately on the lenient side:
// the goal is to catch real bugs (unused imports, unreachable code) and
// keep CI honest, not enforce style — Prettier owns that.
//
// Scope: files matched by the explicit `files` blocks below. Anything
// not matched is silently skipped, which is intentional for generated
// code and assets.

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/*.gen.ts',
      '**/next-env.d.ts',
      'apps/web/public/**',
      'supabase/migrations/**',
    ],
  },

  js.configs.recommended,

  // TypeScript files — base recommended rules without type-checking
  // (no `parserOptions.project`) so lint runs in <2s without spinning up
  // a full TS program per package.
  ...tseslint.configs.recommended,

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // Underscored args/vars are intentionally unused — Zustand selectors,
      // catch blocks, framework-handed callbacks.
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // We use `any` in narrow places (legacy SDK shims, generic JSON
      // pass-through) — type-check is the real gate.
      '@typescript-eslint/no-explicit-any': 'off',
      // Inferred return types are fine for React components.
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      // Banner constants frequently use `Array<T>` style — both are OK.
      '@typescript-eslint/array-type': 'off',
      // We hit this a lot in seed data shape coercion.
      '@typescript-eslint/no-non-null-assertion': 'off',
      // Empty interfaces extend openapi types — legitimate.
      '@typescript-eslint/no-empty-object-type': 'off',
      // Allow `// @ts-expect-error` without a comment description.
      '@typescript-eslint/ban-ts-comment': [
        'warn',
        {
          'ts-expect-error': 'allow-with-description',
          'ts-ignore': true,
          'ts-nocheck': true,
        },
      ],
    },
  },

  // JS / mjs files (config + build scripts) — slimmer rules, no TS.
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
);
