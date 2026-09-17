import { test, expect } from '@playwright/test'

const USERNAME = process.env['TEST_USERNAME'] ?? 'admin'
const PASSWORD = process.env['TEST_PASSWORD'] ?? 'password'

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.waitForLoadState('networkidle')
  await page.getByLabel(/username/i).fill(USERNAME)
  await page.getByLabel(/password/i).fill(PASSWORD)
  await page.getByRole('button', { name: /sign in|log in|login/i }).click()
  await page.waitForURL('/admin')
}

test('admin flow: login → create → add blocks → publish → public page → unpublish', async ({ page }) => {
  // 1. Login
  await login(page)

  // 2. Navigate to /admin and see the sites list
  await expect(page).toHaveURL('/admin')
  await expect(page.getByRole('heading', { name: /sites|microsites/i })).toBeVisible()

  // 3. Create a new site
  await page.getByRole('button', { name: /new site|create/i }).click()
  const nameInput = page.getByLabel(/name|title/i)
  const slugInput = page.getByLabel(/slug/i)
  await nameInput.fill('Test Campaign')
  // Slug may be auto-filled; overwrite it
  await slugInput.fill('test-campaign')
  await page.getByRole('button', { name: /create|save/i }).click()

  // 4. Navigate to editor
  await page.waitForURL(/\/admin\/test-campaign|\/admin\/.*\/edit/)

  // 5. Add a CTA block
  const addBlockBtn = page.getByRole('button', { name: /add block|insert block/i })
  await addBlockBtn.click()
  const ctaOption = page.getByRole('button', { name: /cta|call to action/i })
  await ctaOption.click()

  // Fill in the CTA fields
  await page.getByLabel(/label/i).fill('Click me')
  await page.getByLabel(/href|url|link/i).fill('https://example.com')

  // 6. Wait for autosave — look for "Saved" state indicator
  await expect(page.getByText(/saved/i)).toBeVisible({ timeout: 10_000 })

  // 7. Publish the site
  await page.getByRole('button', { name: /publish/i }).click()
  await expect(page.getByText(/published/i)).toBeVisible({ timeout: 10_000 })

  // 8. Navigate to the public page and verify the CTA block
  const publicPage = page.context().newPage()
  await (await publicPage).goto('/test-campaign')
  await expect(await publicPage).toHaveURL('/test-campaign')
  const ctaLink = (await publicPage).getByRole('link', { name: /click me/i })
  await expect(ctaLink).toBeVisible()
  await expect(ctaLink).toHaveAttribute('href', 'https://example.com')
  await (await publicPage).close()

  // 9. Verify the JSON API endpoint
  const apiResponse = await page.request.get('/api/v1/microsites/test-campaign')
  expect(apiResponse.status()).toBe(200)
  const json = await apiResponse.json()
  expect(json).toHaveProperty('meta')
  expect(json).toHaveProperty('blocks')

  // 10. Unpublish from admin → public page should return 404
  await page.goto('/admin/test-campaign')
  await page.getByRole('button', { name: /unpublish/i }).click()
  // Confirm unpublish if there is a dialog
  const confirmBtn = page.getByRole('button', { name: /confirm|yes|unpublish/i })
  if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await confirmBtn.click()
  }
  await expect(page.getByText(/draft|unpublished/i)).toBeVisible({ timeout: 10_000 })

  // The public page should now return 404
  const notFoundPage = await page.context().newPage()
  await notFoundPage.goto('/test-campaign')
  await expect(notFoundPage).toHaveURL('/test-campaign')
  expect(notFoundPage.url()).toContain('test-campaign')
  // Either the response is 404 or the page shows a not-found message
  await expect(notFoundPage.getByText(/not found|404/i)).toBeVisible({ timeout: 5000 })
  await notFoundPage.close()
})

test('409 conflict: saving with stale version shows banner', async ({ page, context }) => {
  // First login and get to the editor
  await login(page)

  // Create a fresh site for conflict testing
  await page.getByRole('button', { name: /new site|create/i }).click()
  const slugInput = page.getByLabel(/slug/i)
  await page.getByLabel(/name|title/i).fill('Conflict Test')
  await slugInput.fill('conflict-test')
  await page.getByRole('button', { name: /create|save/i }).click()
  await page.waitForURL(/\/admin\/conflict-test|\/admin\/.*\/edit/)

  // Open a second browser tab simulating another editor session
  const secondPage = await context.newPage()
  await secondPage.goto(page.url())
  await secondPage.waitForLoadState('networkidle')

  // Make an edit and save in the second tab (making the first tab stale)
  const secondTitleField = secondPage.getByLabel(/title/i).first()
  await secondTitleField.fill('Title from second tab')
  await secondPage.getByRole('button', { name: /save/i }).click()
  await expect(secondPage.getByText(/saved/i)).toBeVisible({ timeout: 10_000 })
  await secondPage.close()

  // Now edit in the first tab and try to save — should show 409 conflict banner
  const firstTitleField = page.getByLabel(/title/i).first()
  await firstTitleField.fill('Title from first tab (stale)')
  await page.getByRole('button', { name: /save/i }).click()

  await expect(page.getByText(/conflict|stale|out of date|another user/i)).toBeVisible({ timeout: 10_000 })
})
