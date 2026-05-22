import { test, expect } from '@playwright/test'

/**
 * `npm run test:e2e` builds and serves with `next start` (see playwright.config.ts).
 * Do not point tests at `next dev` on Windows — HMR WebSocket issues can block hydration.
 */
test.describe('Core flows', () => {
  test('dashboard shows platform overview', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'load' })
    await expect(page.getByTestId('page-title')).toHaveText('Platform Command Center')
  })

  test('workspace switcher navigates to tenant-prefixed URL', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'load' })
    await page.getByLabel('Select workspace').selectOption('tenant-orbit')
    await page.waitForURL(/\/t\/orbit\/dashboard/, { timeout: 15_000 })
    await expect(page.getByTestId('page-title')).toHaveText('Platform Command Center')
  })

  test('onboarding checklist is reachable', async ({ page }) => {
    await page.goto('/onboarding', { waitUntil: 'load' })
    await expect(page.getByTestId('page-title')).toHaveText('Launch in Under 10 Minutes')
  })

  test('publish API wizard loads', async ({ page }) => {
    await page.goto('/apis/publish', { waitUntil: 'load' })
    await expect(page.getByTestId('page-title')).toHaveText('Launch API')
  })

  test('billing page shows subscription heading', async ({ page }) => {
    await page.goto('/billing', { waitUntil: 'load' })
    await expect(page.getByTestId('page-title')).toHaveText('Subscription & Usage')
  })
})

test.describe('Tenant-prefixed URLs', () => {
  test('middleware serves dashboard under /t/:slug/dashboard', async ({ page }) => {
    await page.goto('/t/acme/dashboard', { waitUntil: 'load' })
    await expect(page.getByTestId('page-title')).toHaveText('Platform Command Center')
  })
})
