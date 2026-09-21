import { test, expect } from '@playwright/test'

test.describe('Frontend', () => {
  test('can go on homepage', async ({ page }) => {
    await page.goto('http://localhost:3000')

    await expect(page).toHaveTitle(/Farhan\.app CMS/)

    await expect(page.locator('p').first()).toContainText('Nothing to see here')
  })
})
