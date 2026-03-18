// ─── Helpers ─────────────────────────────────────────────────────────
function makeRequest(method: string, body?: unknown, url = 'http://localhost/api/chat'): Request {
  return new Request(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
}

// ─── /api/health ─────────────────────────────────────────────────────
describe('GET /api/health', () => {
  it('returns ok: true with version and timestamp', async () => {
    const { default: handler } = await import('../../pages/api/health')
    const res = await handler(makeRequest('GET'))
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.ok).toBe(true)
    expect(data.version).toBe('1.0.0')
    expect(data.timestamp).toBeDefined()
  })
})

// ─── /api/chat ────────────────────────────────────────────────────────
describe('POST /api/chat', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    global.fetch = jest.fn()
  })

  afterEach(() => {
    process.env = originalEnv
    jest.restoreAllMocks()
  })

  it('returns 405 for non-POST methods', async () => {
    const { default: handler } = await import('../../pages/api/chat')
    const res = await handler(makeRequest('GET'))
    expect(res.status).toBe(405)
  })

  it('returns 500 if ANTHROPIC_API_KEY is missing', async () => {
    delete process.env.ANTHROPIC_API_KEY
    const { default: handler } = await import('../../pages/api/chat')
    const res = await handler(makeRequest('POST', {
      messages: [{ role: 'user', content: 'Hi' }],
      model: 'claude-sonnet-4-6',
    }))
    expect(res.status).toBe(500)
    const data = await res.json()
    expect(data.error).toContain('ANTHROPIC_API_KEY')
  })

  it('returns 400 when messages array is missing', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key'
    const { default: handler } = await import('../../pages/api/chat')
    const res = await handler(makeRequest('POST', { model: 'claude-sonnet-4-6' }))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toContain('messages')
  })

  it('returns structured response from Anthropic API', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key'
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'msg_123',
        content: [{ text: 'Hello! How can I help?' }],
        model: 'claude-sonnet-4-6',
        usage: { input_tokens: 10, output_tokens: 20 },
      }),
    })

    const { default: handler } = await import('../../pages/api/chat')
    const res = await handler(makeRequest('POST', {
      messages: [{ role: 'user', content: 'Hello' }],
      model: 'claude-sonnet-4-6',
    }))

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.content).toBe('Hello! How can I help?')
    expect(data.usage.output_tokens).toBe(20)
  })

  it('forwards Anthropic API errors correctly', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key'
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({ error: { message: 'Rate limit exceeded' } }),
    })

    const { default: handler } = await import('../../pages/api/chat')
    const res = await handler(makeRequest('POST', {
      messages: [{ role: 'user', content: 'Hello' }],
      model: 'claude-sonnet-4-6',
    }))

    expect(res.status).toBe(429)
    const data = await res.json()
    expect(data.error).toBe('Rate limit exceeded')
  })
})

// ─── /api/title ───────────────────────────────────────────────────────
describe('POST /api/title', () => {
  beforeEach(() => { global.fetch = jest.fn() })

  it('returns 405 for non-POST methods', async () => {
    const { default: handler } = await import('../../pages/api/title')
    const res = await handler(makeRequest('GET'))
    expect(res.status).toBe(405)
  })

  it('falls back gracefully when no API key', async () => {
    delete process.env.ANTHROPIC_API_KEY
    const { default: handler } = await import('../../pages/api/title')
    const res = await handler(makeRequest('POST', { message: 'What is React?' }))
    const data = await res.json()
    expect(data.title).toBeDefined()
    expect(typeof data.title).toBe('string')
  })

  it('returns generated title from Anthropic', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key'
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ content: [{ text: 'Understanding React Hooks' }] }),
    })

    const { default: handler } = await import('../../pages/api/title')
    const res = await handler(makeRequest('POST', { message: 'Explain React hooks in detail' }))
    const data = await res.json()
    expect(data.title).toBe('Understanding React Hooks')
  })
})
