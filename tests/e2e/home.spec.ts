import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('displays app title and logo', async ({ page }) => {
    await expect(page.locator('text=AI Chatbot')).toBeVisible()
    await expect(page.locator('text=Powered by Claude')).toBeVisible()
  })

  test('sidebar is visible on load', async ({ page }) => {
    await expect(page.locator('aside')).toBeVisible()
  })

  test('shows "New Chat" button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /new chat/i })).toBeVisible()
  })

  test('shows empty state message when no conversations', async ({ page }) => {
    await expect(page.getByText(/no conversations yet/i)).toBeVisible()
  })

  test('has correct page title', async ({ page }) => {
    await expect(page).toHaveTitle(/AI Chatbot/)
  })
})
