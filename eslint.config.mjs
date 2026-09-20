import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';

// Flat config (ESLint 9). The gate is intentionally pragmatic: correctness
// rules that must never ship are `error`. Every enabled rule is an error;
// debt was paid in 4.4.0 (Fase 1 plan). Formatting is hand-written and
// unenforced by tooling (see spec D6).

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
    plugins: { 'react-hooks': reactHooks, react },
    settings: { react: { version: 'detect' } },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'react/jsx-key': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-undef': 'error',
      'react/no-children-prop': 'error',
      'react/no-danger-with-children': 'error',
      'react/self-closing-comp': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
      'prefer-const': 'error',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-useless-escape': 'error',
      '@typescript-eslint/no-empty-object-type': 'error',
    },
  },
  {
    ...jsxA11y.flatConfigs.recommended,
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
      // Deprecated in the plugin; superseded by label-has-associated-control.
      'jsx-a11y/label-has-for': 'off',
      'jsx-a11y/label-has-associated-control': ['error', {
        controlComponents: ['Input', 'Select', 'Textarea', 'NumberInput', 'MoneyInput', 'PhoneInput', 'TagInput', 'TimePicker', 'Slider', 'Combobox', 'MultiCombobox', 'DatePicker', 'DateRangePicker', 'Checkbox', 'Radio', 'Switch', 'FileUpload', 'PasswordInput'],
        depth: 3,
      }],
      // The plugin exempts role="presentation" from the two sibling
      // interaction rules (no-static-element-interactions,
      // no-noninteractive-element-interactions) but not from this one — a
      // gap, since a focusable role="presentation" element is a real,
      // spec-sanctioned pattern (HTML-AAM's focusable-element conflict
      // resolution ignores the presentational role and exposes it as a
      // plain focusable container). Used for composite widgets whose
      // landmark/semantic role lives on an ancestor (e.g. Carousel's
      // role="region"), so the focus/keydown target itself carries no role.
      // 'separator' too: ARIA 1.2 explicitly makes a separator interactive
      // once it carries tabindex (a resize handle, not a static <hr>-like
      // divider) — the plugin's role classification predates that carve-out.
      'jsx-a11y/no-noninteractive-tabindex': ['error', { tags: [], roles: ['tabpanel', 'presentation', 'separator'], allowExpressionValues: true }],
      // `role` is also a domain prop on several kit components (UserMenu,
      // Testimonial: the person's job title, not an ARIA role) — scope this
      // rule to actual DOM elements so it doesn't flag those call sites.
      'jsx-a11y/aria-role': ['error', { ignoreNonDOM: true }],
    },
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
);
