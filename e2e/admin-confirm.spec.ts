import { test, expect } from '@playwright/test'

const ADMIN_EMAIL = 'facturajpb@gmail.com'
const ADMIN_PASSWORD = 'Test1234!'

// Scope to the form submit button to avoid matching the "Log In" tab toggle
const submitBtn = (page: import('@playwright/test').Page) =>
  page.locator('form').getByRole('button', { name: 'Log In' })

async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.getByLabel('Email').fill(ADMIN_EMAIL)
  await page.getByLabel('Password').fill(ADMIN_PASSWORD)
  await submitBtn(page).click()
  await page.waitForURL(/\/admin/, { timeout: 15_000 })
}

test.describe('Admin booking management', () => {
  test('admin can log in and reach the admin dashboard', async ({ page }) => {
    await loginAsAdmin(page)
    await expect(page).toHaveURL(/\/admin/, { timeout: 10_000 })
  })

  test('admin bookings page renders Pending tab', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/bookings')
    await expect(page.getByRole('tab', { name: /pending/i })).toBeVisible({
      timeout: 10_000,
    })
  })

  test('admin can confirm a pending booking and it moves to Confirmed tab', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/bookings?tab=pending')

    const pendingTab = page.getByRole('tab', { name: /pending/i })
    if (await pendingTab.count() > 0) await pendingTab.click()

    // Wait for the tab content to settle
    await page.waitForLoadState('networkidle')

    const confirmBtn = page.getByRole('button', { name: 'Confirm' }).first()
    if (await confirmBtn.count() === 0) {
      // No pending bookings currently — skip the confirm step
      test.skip()
      return
    }

    await confirmBtn.click()

    // If a "Confirm Anyway" emergency-contact dialog appears, dismiss it
    const confirmAnyway = page.getByRole('button', { name: /confirm anyway/i })
    if (await confirmAnyway.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await confirmAnyway.click()
    }

    // The Confirm button for that booking disappears from the Pending tab
    await expect(confirmBtn).not.toBeVisible({ timeout: 10_000 })

    // Switch to Confirmed tab and verify at least one booking card is there.
    // BookingCard renders <Card className="p-4"> so .p-4 is unique to cards.
    const confirmedTab = page.getByRole('tab', { name: /confirmed/i })
    await confirmedTab.click()
    await page.waitForLoadState('networkidle')
    await expect(
      page.locator('[role="tabpanel"][data-state="active"] .p-4').first()
    ).toBeVisible({ timeout: 8_000 })
  })
})
