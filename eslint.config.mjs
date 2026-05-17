import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-config-prettier/flat';

// Flat config (ESLint 9). The gate is intentionally pragmatic: correctness
// rules that must never ship are `error`; pre-existing debt in this
// previously-unlinted codebase is `warn` so CI stays green while the debt is
// visible and can be paid down incrementally. Formatting is owned by Prettier
// (eslint-config-prettier disables stylistic rules).
const a11yWarnings = Object.fromEntries(
  Object.keys(jsxA11y.flatConfigs.recommended.rules).map((rule) => [rule, 'warn']),
);

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'storybook-static/**',
      'node_modules/**',
      'coverage/**',
      '**/*.cjs',
      '*.config.*',
      '.storybook/**',
      'smoke/**',
      'scripts/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}', 'tests/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      // Correctness — these are real bugs, never ship them.
      'react-hooks/rules-of-hooks': 'error',
      // Debt made visible without blocking the gate.
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
      'prefer-const': 'warn',
      'no-empty': ['warn', { allowEmptyCatch: true }],
      'no-useless-escape': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
    },
  },
  {
    ...jsxA11y.flatConfigs.recommended,
    files: ['src/**/*.{ts,tsx}'],
  },
  {
    // a11y is already governed by the design audit; surface plugin findings
    // as warnings rather than blocking on heuristics over custom components.
    files: ['src/**/*.{ts,tsx}'],
    rules: a11yWarnings,
  },
  {
    files: ['tests/**/*.{ts,tsx}', 'src/**/*.stories.tsx'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      // Storybook story render functions legitimately call hooks inline; the
      // rule's value is for shipped components, which keep it as `error`.
      'react-hooks/rules-of-hooks': 'off',
    },
  },
  prettier,
);
