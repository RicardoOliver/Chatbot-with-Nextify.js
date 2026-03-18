import type { Message, Conversation, ChatSettings, ChatModel } from '../../src/types'

// ─── Factory helpers ──────────────────────────────────────────────────
function makeMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: 'msg-1',
    role: 'user',
    content: 'Hello, Claude!',
    timestamp: Date.now(),
    status: 'done',
    ...overrides,
  }
}

function makeConversation(overrides: Partial<Conversation> = {}): Conversation {
  return {
    id: 'conv-1',
    title: 'Test Conversation',
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    model: 'claude-sonnet-4-6',
    ...overrides,
  }
}

// ─── Message tests ────────────────────────────────────────────────────
describe('Message type', () => {
  it('creates a valid user message', () => {
    const msg = makeMessage()
    expect(msg.role).toBe('user')
    expect(msg.content).toBe('Hello, Claude!')
    expect(msg.status).toBe('done')
  })

  it('creates a valid assistant message', () => {
    const msg = makeMessage({ role: 'assistant', content: 'Hi there!', status: 'streaming' })
    expect(msg.role).toBe('assistant')
    expect(msg.status).toBe('streaming')
  })

  it('allows optional fields', () => {
    const msg = makeMessage({ tokens: 42, model: 'claude-sonnet-4-6' })
    expect(msg.tokens).toBe(42)
    expect(msg.model).toBe('claude-sonnet-4-6')
  })

  it('timestamp should be a positive number', () => {
    const msg = makeMessage()
    expect(msg.timestamp).toBeGreaterThan(0)
  })
})

// ─── Conversation tests ───────────────────────────────────────────────
describe('Conversation type', () => {
  it('creates an empty conversation', () => {
    const conv = makeConversation()
    expect(conv.messages).toHaveLength(0)
    expect(conv.title).toBe('Test Conversation')
  })

  it('holds multiple messages', () => {
    const messages = [
      makeMessage({ id: '1', role: 'user', content: 'Hi' }),
      makeMessage({ id: '2', role: 'assistant', content: 'Hello!' }),
    ]
    const conv = makeConversation({ messages })
    expect(conv.messages).toHaveLength(2)
    expect(conv.messages[0].role).toBe('user')
    expect(conv.messages[1].role).toBe('assistant')
  })

  it('supports pinned conversations', () => {
    const conv = makeConversation({ pinned: true })
    expect(conv.pinned).toBe(true)
  })

  it('supports tags', () => {
    const conv = makeConversation({ tags: ['work', 'coding'] })
    expect(conv.tags).toContain('work')
    expect(conv.tags).toContain('coding')
  })

  it('updatedAt should change when messages are added', () => {
    const conv = makeConversation({ updatedAt: 1000 })
    const updated: Conversation = { ...conv, updatedAt: Date.now() }
    expect(updated.updatedAt).toBeGreaterThan(conv.updatedAt)
  })
})

// ─── ChatSettings tests ───────────────────────────────────────────────
describe('ChatSettings type', () => {
  it('builds valid settings', () => {
    const settings: ChatSettings = {
      model: 'claude-sonnet-4-6',
      systemPrompt: 'You are helpful.',
      temperature: 0.7,
      maxTokens: 1024,
      streamingEnabled: true,
      theme: 'dark',
      fontSize: 'md',
      sendOnEnter: true,
    }
    expect(settings.model).toBe('claude-sonnet-4-6')
    expect(settings.temperature).toBe(0.7)
    expect(settings.theme).toBe('dark')
  })
})

// ─── ChatModel type guard ─────────────────────────────────────────────
describe('ChatModel', () => {
  const validModels: ChatModel[] = [
    'claude-opus-4-6',
    'claude-sonnet-4-6',
    'claude-haiku-4-5-20251001',
  ]

  it('all valid models are strings', () => {
    validModels.forEach(m => expect(typeof m).toBe('string'))
  })

  it('all valid models start with "claude-"', () => {
    validModels.forEach(m => expect(m.startsWith('claude-')).toBe(true))
  })
})
