import { test, expect } from '@playwright/test'

test.describe('Frontend', () => {
  test('homepage shows the editor guide', async ({ page }) => {
    await page.goto('http://localhost:3000')

    await expect(page).toHaveTitle(/Using the CMS/)

    await expect(page.locator('h1').first()).toHaveText('Using the CMS')
  })
})
