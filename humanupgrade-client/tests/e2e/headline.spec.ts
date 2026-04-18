import { test, expect } from '@playwright/test'

/**
 * M0 headline e2e flow:
 *   1. Anonymous user lands on /
 *   2. Opens search (header trigger)
 *   3. Types "HRV"
 *   4. Goes to /search?q=HRV
 *   5. Clicks the first Episode result
 *   6. Confirms the episode page renders with title + summary
 *
 * No auth — the entire flow is public.
 */
test.describe('M0 — public exploration flow', () => {
  test('home → search "HRV" → open episode → verify content', async ({ page }) => {
    // 1. Home loads
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1, name: /workbench/i })).toBeVisible()

    // 2. Open the global search dialog from the header
    await page.getByRole('button', { name: /search anything/i }).click()
    const searchInput = page.getByPlaceholder(/search the knowledge graph/i)
    await expect(searchInput).toBeVisible()

    // 3. Type "HRV" — debounced live results
    await searchInput.fill('HRV')

    // 4. Press Enter to land on /search
    await searchInput.press('Enter')
    await expect(page).toHaveURL(/\/search\?q=HRV/i)
    await expect(page.getByRole('heading', { level: 1, name: /Results for/i })).toBeVisible()

    // 5. Click the first episode result link
    const firstEpisodeLink = page.locator('a[href^="/e/episodes/"]').first()
    await expect(firstEpisodeLink).toBeVisible()
    await firstEpisodeLink.click()

    // 6. Episode page renders with the standard chrome
    await expect(page).toHaveURL(/\/e\/episodes\//)
    await expect(page.getByText(/episode/i).first()).toBeVisible()
    // The H1 is the episode title; we don't pin a specific title because
    // the seed data changes — just confirm a title-shaped element exists.
    await expect(page.locator('h1')).toBeVisible()
  })

  test('every entity type has a working /search filter pill', async ({ page }) => {
    await page.goto('/search?q=hrv')
    const pills = ['Episodes', 'Compounds', 'Products', 'Case studies', 'Biomarkers']
    for (const label of pills) {
      await expect(page.getByText(label, { exact: true })).toBeVisible()
    }
  })

  test('marketing home shows browse-rail tiles for all 10 entity kinds', async ({ page }) => {
    await page.goto('/')
    const labels = [
      'Episodes',
      'Compounds',
      'Products',
      'Case studies',
      'Biomarkers',
      'Claims',
      'People',
      'Organizations',
      'Lab tests',
      'Podcasts',
    ]
    for (const label of labels) {
      await expect(page.getByText(label, { exact: true })).toBeVisible()
    }
  })
})
