import { test, expect } from '@playwright/test'

const DIVER_EMAIL = 'jpbaquerizo@guiatrabajoremoto.com'
const DIVER_PASSWORD = 'Test1234!'

// The login page renders two "Log In" elements: the tab toggle (type="button")
// and the form submit button. Scoping to form ensures we always hit the submit.
const submitBtn = (page: import('@playwright/test').Page, name: string) =>
  page.locator('form').getByRole('button', { name })

test.describe('Authentication', () => {
  test('login page shows email/password fields and submit button', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(submitBtn(page, 'Log In')).toBeVisible()
  })

  test('switching to Sign Up tab reveals signup form', async ({ page }) => {
    await page.goto('/login')
    // Click the tab-bar "Sign Up" toggle (type="button", comes first in DOM)
    await page.locator('button[type="button"]', { hasText: 'Sign Up' }).first().click()
    // Submit button label changes to "Sign Up" on the signup tab
    await expect(submitBtn(page, 'Sign Up')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
  })

  test('diver can log in and lands on discover page', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill(DIVER_EMAIL)
    await page.getByLabel('Password').fill(DIVER_PASSWORD)
    await submitBtn(page, 'Log In').click()
    await expect(page).toHaveURL(/\/app\/discover/, { timeout: 15_000 })
  })

  test('diver can log out via profile page', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill(DIVER_EMAIL)
    await page.getByLabel('Password').fill(DIVER_PASSWORD)
    await submitBtn(page, 'Log In').click()
    await page.waitForURL(/\/app\/discover/, { timeout: 15_000 })

    await page.goto('/app/profile')
    await page.getByRole('button', { name: 'Log Out' }).click()
    // After logout user is sent away from all protected /app/ routes
    await expect(page).not.toHaveURL(/\/app\//, { timeout: 10_000 })
  })
})
