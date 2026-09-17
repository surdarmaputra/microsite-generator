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

async function createSite(page: import('@playwright/test').Page, name: string, slug: string) {
  await page.getByRole('button', { name: /new site/i }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('Name').fill(name)
  await dialog.getByLabel('Slug').fill(slug)
  await dialog.getByRole('button', { name: 'Create' }).click()
  await page.waitForURL(/\/admin\/editor\//)
}

test('admin flow: login → create → add blocks → publish → public page → unpublish', async ({ page }) => {
  const slug = `test-campaign-${Date.now().toString(36)}`

  // 1. Login
  await login(page)

  // 2. Navigate to /admin and see the sites list
  await expect(page).toHaveURL('/admin')
  await expect(page.getByRole('heading', { name: /sites|microsites/i })).toBeVisible()

  // 3. Create a new site — 4. lands in the editor
  await createSite(page, 'Test Campaign', slug)

  // 5. Add a CTA block
  await page.getByRole('button', { name: /add block/i }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'cta' }).click()

  // Fill in the CTA fields
  await page.getByLabel('Label').fill('Click me')
  await page.getByLabel('URL').fill('https://example.com')

  // 6. Wait for autosave — look for "Saved" state indicator
  await expect(page.getByText(/saved/i)).toBeVisible({ timeout: 15_000 })

  // 7. Publish the site
  await page.getByRole('button', { name: /^publish$/i }).click()
  await page.getByRole('dialog').getByRole('button', { name: /^publish$/i }).click()
  await expect(page.getByText(/^published$/i)).toBeVisible({ timeout: 10_000 })

  // 8. Navigate to the public page and verify the CTA block
  const publicPage = await page.context().newPage()
  await publicPage.goto(`/${slug}`)
  await expect(publicPage).toHaveURL(`/${slug}`)
  const ctaLink = publicPage.getByRole('link', { name: /click me/i })
  await expect(ctaLink).toBeVisible()
  await expect(ctaLink).toHaveAttribute('href', 'https://example.com')
  await publicPage.close()

  // 9. Verify the JSON API endpoint
  const apiResponse = await page.request.get(`/api/v1/microsites/${slug}`)
  expect(apiResponse.status()).toBe(200)
  const json = await apiResponse.json()
  expect(json).toHaveProperty('meta')
  expect(json).toHaveProperty('blocks')

  // 10. Unpublish from the sites list → public page should return 404
  await page.goto('/admin')
  const row = page.getByRole('row').filter({ hasText: slug })
  await row.getByRole('button', { name: /unpublish/i }).click()
  await expect(row.getByText(/^draft$/i)).toBeVisible({ timeout: 10_000 })

  const notFoundPage = await page.context().newPage()
  await notFoundPage.goto(`/${slug}`)
  await expect(notFoundPage.getByText(/not found|404/i)).toBeVisible({ timeout: 5000 })
  await notFoundPage.close()
})

test('409 conflict: saving with stale version shows banner', async ({ page, context }) => {
  // First login and get to the editor
  await login(page)

  // Create a fresh site for conflict testing
  await createSite(page, 'Conflict Test', `conflict-test-${Date.now().toString(36)}`)

  // Open a second browser tab simulating another editor session
  const secondPage = await context.newPage()
  await secondPage.goto(page.url())
  await secondPage.waitForLoadState('networkidle')

  // Make an edit in the second tab (making the first tab stale)
  await secondPage.getByLabel('Title').fill('Title from second tab')
  await expect(secondPage.getByText(/saved/i)).toBeVisible({ timeout: 15_000 })
  await secondPage.close()

  // Now edit in the first tab — the autosave should hit a 409 conflict
  await page.getByLabel('Title').fill('Title from first tab (stale)')

  await expect(
    page.getByText(/conflict|stale|out of date|another user|another tab/i)
  ).toBeVisible({ timeout: 15_000 })
})
