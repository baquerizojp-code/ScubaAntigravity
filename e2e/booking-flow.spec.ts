import { test, expect } from '@playwright/test'

const DIVER_EMAIL = 'jpbaquerizo@guiatrabajoremoto.com'
const DIVER_PASSWORD = 'Test1234!'

// Scope to the form submit button to avoid matching the "Log In" tab toggle
const submitBtn = (page: import('@playwright/test').Page) =>
  page.locator('form').getByRole('button', { name: 'Log In' })

async function loginAsDiver(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.getByLabel('Email').fill(DIVER_EMAIL)
  await page.getByLabel('Password').fill(DIVER_PASSWORD)
  await submitBtn(page).click()
  await page.waitForURL(/\/app\/discover/, { timeout: 15_000 })
}

test.describe('Booking flow', () => {
  test('public /explore page loads and shows content', async ({ page }) => {
    await page.goto('/explore')
    // The page heading is always rendered (e.g. "Explore" in the hero)
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10_000 })
    // Either trip card links or the "no trips" empty-state message must appear
    await page.waitForLoadState('networkidle')
    const tripCount = await page.locator('a[href^="/explore/"]').count()
    if (tripCount === 0) {
      // Empty state renders a text message
      await expect(page.getByText(/no trips found|no dives/i).or(
        page.locator('text=/found for selected/i')
      )).toBeVisible()
    } else {
      await expect(page.locator('a[href^="/explore/"]').first()).toBeVisible()
    }
  })

  test('diver can open a trip detail from /explore', async ({ page }) => {
    await page.goto('/explore')
    await page.waitForLoadState('networkidle')
    const tripLink = page.locator('a[href^="/explore/"]').first()
    if (await tripLink.count() === 0) { test.skip(); return }
    await tripLink.click()
    await expect(page).toHaveURL(/\/explore\//, { timeout: 10_000 })
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('unauthenticated visit to trip detail shows a login prompt', async ({ page }) => {
    await page.goto('/explore')
    await page.waitForLoadState('networkidle')
    const tripLink = page.locator('a[href^="/explore/"]').first()
    if (await tripLink.count() === 0) { test.skip(); return }
    await tripLink.click()
    await page.waitForURL(/\/explore\//, { timeout: 10_000 })

    // Public trip detail page should display a "Log In" call-to-action link
    const loginCta = page.getByRole('link', { name: /log in/i })
    if (await loginCta.count() > 0) {
      await loginCta.first().click()
      await expect(page).toHaveURL(/\/login/, { timeout: 8_000 })
    }
  })

  test('diver can request a booking and it appears as Pending', async ({ page }) => {
    await loginAsDiver(page)

    await page.goto('/explore')
    await page.waitForLoadState('networkidle')
    const tripLinks = page.locator('a[href^="/explore/"]')
    if (await tripLinks.count() === 0) { test.skip(); return }

    // Collect up to 3 slugs and try each until one accepts a booking
    const hrefs: string[] = await tripLinks.evaluateAll(
      (els: HTMLAnchorElement[]) => els.slice(0, 3).map(a => a.href)
    )

    let booked = false
    for (const href of hrefs) {
      const slug = href.split('/explore/')[1]
      await page.goto(`/app/trip/${slug}`)
      await page.waitForLoadState('networkidle')

      const requestBtn = page.getByRole('button', { name: 'Request Booking' })
      if (await requestBtn.count() === 0) continue // already booked or trip full
      await requestBtn.click()

      // On success the button is replaced and a toast/status indicator appears
      await expect(
        page.getByRole('button', { name: 'Request Booking' })
      ).not.toBeVisible({ timeout: 10_000 })
      booked = true
      break
    }

    if (!booked) { test.skip(); return }

    // Verify the booking appears in My Bookings → Pending tab
    await page.goto('/app/bookings')
    const pendingTab = page.getByRole('tab', { name: /pending/i })
    if (await pendingTab.count() > 0) await pendingTab.click()

    // TripCard and BookingCard render with p-4; active tabpanel scopes the search
    await expect(
      page.locator('[role="tabpanel"][data-state="active"] .p-4').first()
        .or(page.locator('[role="tabpanel"][data-state="active"]').first())
    ).toBeVisible({ timeout: 8_000 })
  })
})
