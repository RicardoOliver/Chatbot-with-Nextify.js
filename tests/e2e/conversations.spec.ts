import { test, expect } from '@playwright/test'

test.describe('Conversation Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  // ─── New Conversation ───────────────────────────────────────────────
  test('creates a new conversation when clicking New Chat', async ({ page }) => {
    await page.getByRole('button', { name: /new chat/i }).click()

    await expect(page.getByText('New Conversation')).toBeVisible()
  })

  test('shows chat window after creating conversation', async ({ page }) => {
    await page.getByRole('button', { name: /new chat/i }).click()

    await expect(page.getByPlaceholder(/message claude/i)).toBeVisible()
  })

  test('creates multiple conversations', async ({ page }) => {
    await page.getByRole('button', { name: /new chat/i }).click()
    await page.getByRole('button', { name: /new chat/i }).click()
    await page.getByRole('button', { name: /new chat/i }).click()

    const convItems = page.locator('aside').getByText('New Conversation')
    await expect(convItems).toHaveCount(3)
  })

  // ─── Search ─────────────────────────────────────────────────────────
  test('search filters conversations', async ({ page }) => {
    await page.getByRole('button', { name: /new chat/i }).click()

    await page.locator('input[placeholder*="Search"]').fill('xyz-no-match')
    await expect(page.getByText(/no results/i)).toBeVisible()
  })

  test('search is cleared and shows all results', async ({ page }) => {
    await page.getByRole('button', { name: /new chat/i }).click()

    const search = page.locator('input[placeholder*="Search"]')
    await search.fill('xyz')
    await search.fill('')

    await expect(page.getByText('New Conversation')).toBeVisible()
  })

  // ─── Delete ──────────────────────────────────────────────────────────
  test('deletes a conversation on delete button click', async ({ page }) => {
    await page.getByRole('button', { name: /new chat/i }).click()

    const convItem = page.locator('aside').getByText('New Conversation')
    await convItem.hover()
    await page.locator('aside').getByTitle('Delete').click()

    await expect(page.getByText(/no conversations yet/i)).toBeVisible()
  })

  // ─── Rename ───────────────────────────────────────────────────────────
  test('renames a conversation inline', async ({ page }) => {
    await page.getByRole('button', { name: /new chat/i }).click()

    const convItem = page.locator('aside').getByText('New Conversation')
    await convItem.hover()
    await page.locator('aside').getByTitle('Rename').click()

    const input = page.locator('aside input')
    await input.clear()
    await input.fill('My Renamed Chat')
    await input.press('Enter')

    await expect(page.getByText('My Renamed Chat')).toBeVisible()
  })

  // ─── Pin ─────────────────────────────────────────────────────────────
  test('pins a conversation', async ({ page }) => {
    await page.getByRole('button', { name: /new chat/i }).click()

    const convItem = page.locator('aside').getByText('New Conversation')
    await convItem.hover()
    await page.locator('aside').getByTitle(/pin/i).click()

    await expect(page.getByText(/pinned/i)).toBeVisible()
  })
})
