import { defineConfig, configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    css: false,
    // The smoke consumer is a separate Next/Playwright project; never run its
    // specs under the kit's unit-test runner.
    exclude: [...configDefaults.exclude, 'smoke/**'],
  },
});
