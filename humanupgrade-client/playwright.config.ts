import { defineConfig, devices } from '@playwright/test'

/**
 * Run with:
 *   pnpm test:e2e             (against an already-running dev server)
 *   pnpm test:e2e --ui        (interactive)
 *
 * The webServer block is intentionally NOT enabled here so the test runner
 * doesn't try to spawn its own dev server — we expect humanupgradeapi and
 * humanupgrade-client to already be running locally (or proxied to a
 * preview URL). This matches our two-codebase reality.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',

  timeout: 30_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
