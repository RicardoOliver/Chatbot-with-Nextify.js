import { sendMessage, generateTitle, healthCheck } from '../../src/lib/api'
import type { ChatRequest } from '../../src/types'

// ─── Mock global fetch ────────────────────────────────────────────────
const mockFetch = jest.fn()
global.fetch = mockFetch

function mockOk(body: unknown) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => body,
    body: null,
  })
}

function mockError(status: number, error: string) {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status,
    json: async () => ({ error }),
  })
}

const baseRequest: ChatRequest = {
  messages: [{ role: 'user', content: 'Hello!' }],
  model: 'claude-sonnet-4-6',
}

// ─── sendMessage ─────────────────────────────────────────────────────
describe('sendMessage()', () => {
  beforeEach(() => mockFetch.mockClear())

  it('calls POST /api/chat with correct body', async () => {
    mockOk({ id: 'r1', content: 'Hi there!', model: 'claude-sonnet-4-6', usage: { input_tokens: 5, output_tokens: 10 } })

    await sendMessage(baseRequest)

    expect(mockFetch).toHaveBeenCalledWith('/api/chat', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }))

    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.messages[0].content).toBe('Hello!')
    expect(body.model).toBe('claude-sonnet-4-6')
  })

  it('returns parsed response on success', async () => {
    const response = { id: 'r1', content: 'Hello!', model: 'claude-sonnet-4-6', usage: { input_tokens: 5, output_tokens: 8 } }
    mockOk(response)

    const result = await sendMessage(baseRequest)
    expect(result.content).toBe('Hello!')
    expect(result.usage.output_tokens).toBe(8)
  })

  it('throws error when API returns non-ok status', async () => {
    mockError(429, 'Rate limit exceeded')
    await expect(sendMessage(baseRequest)).rejects.toThrow('Rate limit exceeded')
  })

  it('throws error on 500 server error', async () => {
    mockError(500, 'Internal server error')
    await expect(sendMessage(baseRequest)).rejects.toThrow('Internal server error')
  })
})

// ─── generateTitle ────────────────────────────────────────────────────
describe('generateTitle()', () => {
  beforeEach(() => mockFetch.mockClear())

  it('returns title from API', async () => {
    mockOk({ title: 'How to use TypeScript generics' })
    const title = await generateTitle('Can you explain TypeScript generics?')
    expect(title).toBe('How to use TypeScript generics')
  })

  it('falls back to truncated message if API fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    const long = 'A'.repeat(60)
    const title = await generateTitle(long)
    expect(title).toContain('...')
    expect(title.length).toBeLessThanOrEqual(43)
  })

  it('returns short message as-is when under 40 chars', async () => {
    mockFetch.mockRejectedValueOnce(new Error('fail'))
    const title = await generateTitle('Short message')
    expect(title).toBe('Short message')
    expect(title.endsWith('...')).toBe(false)
  })
})

// ─── healthCheck ─────────────────────────────────────────────────────
describe('healthCheck()', () => {
  beforeEach(() => mockFetch.mockClear())

  it('calls GET /api/health', async () => {
    mockOk({ ok: true, version: '1.0.0' })
    await healthCheck()
    expect(mockFetch).toHaveBeenCalledWith('/api/health')
  })

  it('returns health data', async () => {
    mockOk({ ok: true, version: '1.0.0', timestamp: '2025-01-01' })
    const result = await healthCheck()
    expect(result.ok).toBe(true)
    expect(result.version).toBe('1.0.0')
  })
})
