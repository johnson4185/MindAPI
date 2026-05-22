import { defineConfig, devices } from '@playwright/test'

const isCI = !!process.env.CI
const skipWebServer = !!process.env.PLAYWRIGHT_SKIP_WEBSERVER
const port = process.env.PLAYWRIGHT_PORT || '3005'
const baseURL = process.env.PLAYWRIGHT_BASE_URL || `http://127.0.0.1:${port}`

/**
 * E2E must run against `next start`, not `next dev`: Playwright's Chromium often
 * breaks the Next.js dev HMR WebSocket on Windows, which prevents client hydration
 * and leaves data-fetching effects (dashboard, billing) stuck on loading skeletons.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: 'html',
  expect: {
    timeout: 15_000,
  },
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  ...(!skipWebServer
    ? {
        webServer: {
          command: `npm run build && npx next start -p ${port}`,
          url: baseURL,
          reuseExistingServer: !isCI,
          timeout: 240_000,
        },
      }
    : {}),
})
