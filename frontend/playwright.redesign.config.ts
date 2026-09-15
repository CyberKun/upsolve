import { defineConfig } from '@playwright/test';

// Self-contained presentation checks; the full-stack runner remains unchanged.
export default defineConfig({
  testDir: './e2e',
  testMatch: 'redesign.spec.ts',
  timeout: 30000,
  workers: 1,
  use: {
    baseURL: 'http://localhost:15174',
    channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 15174 --strictPort',
    url: 'http://localhost:15174',
    reuseExistingServer: !process.env.CI,
  },
});
