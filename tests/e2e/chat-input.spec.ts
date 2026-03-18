import { test, expect } from '@playwright/test'

test.describe('Chat Input', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /new chat/i }).click()
  })

  // ─── Input field ─────────────────────────────────────────────────────
  test('textarea is visible and focusable', async ({ page }) => {
    const input = page.getByPlaceholder(/message claude/i)
    await expect(input).toBeVisible()
    await input.click()
    await expect(input).toBeFocused()
  })

  test('send button is disabled when input is empty', async ({ page }) => {
    const send = page.getByTitle(/send/i)
    await expect(send).toBeDisabled()
  })

  test('send button becomes enabled when input has text', async ({ page }) => {
    await page.getByPlaceholder(/message claude/i).fill('Hello!')
    const send = page.getByTitle(/send/i)
    await expect(send).toBeEnabled()
  })

  test('clears input after sending', async ({ page }) => {
    // Mock the API response so the message can be "sent"
    await page.route('/api/chat/stream', route => route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      body: 'data: {"delta":{"text":"Hi!"}}\n\ndata: [DONE]\n\n',
    }))
    await page.route('/api/title', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ title: 'Test Chat' }),
    }))

    const input = page.getByPlaceholder(/message claude/i)
    await input.fill('Hello Claude!')
    await page.getByTitle(/send/i).click()

    await expect(input).toHaveValue('')
  })

  test('sends message on Enter key', async ({ page }) => {
    await page.route('/api/chat/stream', route => route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      body: 'data: [DONE]\n\n',
    }))
    await page.route('/api/title', route => route.fulfill({
      status: 200,
      body: JSON.stringify({ title: 'Chat' }),
    }))

    const input = page.getByPlaceholder(/message claude/i)
    await input.fill('Hi!')
    await input.press('Enter')

    await expect(page.getByText('Hi!')).toBeVisible()
  })

  test('Shift+Enter inserts newline instead of sending', async ({ page }) => {
    const input = page.getByPlaceholder(/message claude/i)
    await input.fill('Line 1')
    await input.press('Shift+Enter')
    await input.type('Line 2')

    const value = await input.inputValue()
    expect(value).toContain('\n')
  })

  // ─── Model selector ──────────────────────────────────────────────────
  test('displays model selector buttons', async ({ page }) => {
    await expect(page.getByText(/Sonnet/)).toBeVisible()
    await expect(page.getByText(/Opus/)).toBeVisible()
    await expect(page.getByText(/Haiku/)).toBeVisible()
  })

  test('switches model on click', async ({ page }) => {
    await page.getByText(/Opus/).click()
    const opusBtn = page.getByText(/Opus/)
    await expect(opusBtn).toHaveCSS('font-weight', '700')
  })

  // ─── Clear button ─────────────────────────────────────────────────────
  test('clear button wipes messages from active conversation', async ({ page }) => {
    await page.route('/api/chat/stream', route => route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      body: 'data: {"delta":{"text":"Response"}}\n\ndata: [DONE]\n\n',
    }))
    await page.route('/api/title', route => route.fulfill({
      body: JSON.stringify({ title: 'Chat' }),
    }))

    const input = page.getByPlaceholder(/message claude/i)
    await input.fill('Hello')
    await input.press('Enter')

    await page.getByRole('button', { name: /clear/i }).click()
    await expect(page.getByText('Hello')).not.toBeVisible()
  })
})
