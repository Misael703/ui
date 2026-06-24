import { defineConfig } from '@playwright/test';

const PORT = Number(process.env.SMOKE_PORT) || 3100;
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  reporter: [['list']],
  use: { baseURL: `http://localhost:${PORT}`, trace: 'off' },
  // `next build` is run by the orchestrator before this; here we only serve.
  webServer: {
    command: 'npm run start',
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
