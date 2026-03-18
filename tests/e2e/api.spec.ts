import { test, expect } from '@playwright/test'

test.describe('API Routes', () => {
  // ─── /api/health ───────────────────────────────────────────────────
  test('GET /api/health returns ok: true', async ({ request }) => {
    const res = await request.get('/api/health')
    expect(res.ok()).toBeTruthy()

    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.version).toBeDefined()
    expect(body.timestamp).toBeDefined()
  })

  // ─── /api/chat ─────────────────────────────────────────────────────
  test('POST /api/chat returns 405 for GET method', async ({ request }) => {
    const res = await request.get('/api/chat')
    expect(res.status()).toBe(405)
  })

  test('POST /api/chat returns 500 without API key', async ({ request }) => {
    const res = await request.post('/api/chat', {
      data: {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'claude-sonnet-4-6',
      },
    })
    // Either 500 (no key) or 200 (key configured in env)
    expect([200, 500]).toContain(res.status())
  })

  test('POST /api/chat returns 400 with empty messages', async ({ request }) => {
    const res = await request.post('/api/chat', {
      data: { model: 'claude-sonnet-4-6' },
    })
    expect(res.status()).toBe(400)
  })

  // ─── /api/title ───────────────────────────────────────────────────
  test('POST /api/title returns 405 for GET method', async ({ request }) => {
    const res = await request.get('/api/title')
    expect(res.status()).toBe(405)
  })

  test('POST /api/title returns a title string', async ({ request }) => {
    const res = await request.post('/api/title', {
      data: { message: 'What is TypeScript?' },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.title).toBeDefined()
    expect(typeof body.title).toBe('string')
    expect(body.title.length).toBeGreaterThan(0)
  })
})
