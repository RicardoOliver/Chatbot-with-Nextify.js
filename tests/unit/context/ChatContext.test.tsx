import { renderHook, act, waitFor } from '@testing-library/react'
import { ChatProvider, useChat } from '../../src/context/ChatContext'
import type { ReactNode } from 'react'

// ─── Mock streaming API ───────────────────────────────────────────────
jest.mock('../../src/lib/api', () => ({
  streamMessage: jest.fn(async function* () {
    yield 'Hello'
    yield ', world!'
  }),
  generateTitle: jest.fn().mockResolvedValue('Test Chat'),
}))

const wrapper = ({ children }: { children: ReactNode }) => (
  <ChatProvider>{children}</ChatProvider>
)

// ─── Initial state ────────────────────────────────────────────────────
describe('ChatContext — initial state', () => {
  it('starts with no conversations', () => {
    const { result } = renderHook(() => useChat(), { wrapper })
    expect(result.current.state.conversations).toHaveLength(0)
  })

  it('activeConversation is null initially', () => {
    const { result } = renderHook(() => useChat(), { wrapper })
    expect(result.current.activeConversation).toBeNull()
  })

  it('isStreaming is false initially', () => {
    const { result } = renderHook(() => useChat(), { wrapper })
    expect(result.current.state.isStreaming).toBe(false)
  })

  it('error is null initially', () => {
    const { result } = renderHook(() => useChat(), { wrapper })
    expect(result.current.state.error).toBeNull()
  })
})

// ─── newConversation ──────────────────────────────────────────────────
describe('ChatContext — newConversation()', () => {
  it('creates a conversation and sets it active', () => {
    const { result } = renderHook(() => useChat(), { wrapper })

    act(() => { result.current.newConversation() })

    expect(result.current.state.conversations).toHaveLength(1)
    expect(result.current.activeConversation).not.toBeNull()
    expect(result.current.activeConversation?.title).toBe('New Conversation')
  })

  it('creates multiple conversations', () => {
    const { result } = renderHook(() => useChat(), { wrapper })

    act(() => { result.current.newConversation() })
    act(() => { result.current.newConversation() })

    expect(result.current.state.conversations).toHaveLength(2)
  })

  it('new conversation starts with empty messages', () => {
    const { result } = renderHook(() => useChat(), { wrapper })
    act(() => { result.current.newConversation() })
    expect(result.current.activeConversation?.messages).toHaveLength(0)
  })
})

// ─── deleteConversation ───────────────────────────────────────────────
describe('ChatContext — deleteConversation()', () => {
  it('removes conversation by id', () => {
    const { result } = renderHook(() => useChat(), { wrapper })

    act(() => { result.current.newConversation() })
    const id = result.current.activeConversation!.id

    act(() => { result.current.deleteConversation(id) })

    expect(result.current.state.conversations).toHaveLength(0)
    expect(result.current.activeConversation).toBeNull()
  })

  it('activates adjacent conversation after delete', () => {
    const { result } = renderHook(() => useChat(), { wrapper })

    act(() => { result.current.newConversation() })
    act(() => { result.current.newConversation() })

    const id = result.current.state.activeId!
    act(() => { result.current.deleteConversation(id) })

    expect(result.current.state.conversations).toHaveLength(1)
    expect(result.current.state.activeId).not.toBeNull()
  })
})

// ─── pinConversation ──────────────────────────────────────────────────
describe('ChatContext — pinConversation()', () => {
  it('pins and unpins a conversation', () => {
    const { result } = renderHook(() => useChat(), { wrapper })
    act(() => { result.current.newConversation() })
    const id = result.current.activeConversation!.id

    act(() => { result.current.pinConversation(id) })
    expect(result.current.activeConversation?.pinned).toBe(true)

    act(() => { result.current.pinConversation(id) })
    expect(result.current.activeConversation?.pinned).toBe(false)
  })
})

// ─── renameConversation ───────────────────────────────────────────────
describe('ChatContext — renameConversation()', () => {
  it('updates conversation title', () => {
    const { result } = renderHook(() => useChat(), { wrapper })
    act(() => { result.current.newConversation() })
    const id = result.current.activeConversation!.id

    act(() => { result.current.renameConversation(id, 'My Renamed Chat') })

    expect(result.current.activeConversation?.title).toBe('My Renamed Chat')
  })
})

// ─── updateSettings ───────────────────────────────────────────────────
describe('ChatContext — updateSettings()', () => {
  it('updates model setting', () => {
    const { result } = renderHook(() => useChat(), { wrapper })
    act(() => { result.current.updateSettings({ model: 'claude-opus-4-6' }) })
    expect(result.current.state.settings.model).toBe('claude-opus-4-6')
  })

  it('updates temperature setting', () => {
    const { result } = renderHook(() => useChat(), { wrapper })
    act(() => { result.current.updateSettings({ temperature: 0.2 }) })
    expect(result.current.state.settings.temperature).toBe(0.2)
  })

  it('merges settings correctly', () => {
    const { result } = renderHook(() => useChat(), { wrapper })
    const original = result.current.state.settings.streamingEnabled

    act(() => { result.current.updateSettings({ sendOnEnter: false }) })

    expect(result.current.state.settings.sendOnEnter).toBe(false)
    expect(result.current.state.settings.streamingEnabled).toBe(original)
  })
})

// ─── sendMessage ─────────────────────────────────────────────────────
describe('ChatContext — sendMessage()', () => {
  it('adds user and assistant messages', async () => {
    const { result } = renderHook(() => useChat(), { wrapper })
    act(() => { result.current.newConversation() })

    await act(async () => {
      await result.current.sendMessage('Hello!')
    })

    await waitFor(() => {
      expect(result.current.state.isStreaming).toBe(false)
    })

    const msgs = result.current.activeConversation?.messages ?? []
    expect(msgs.length).toBeGreaterThanOrEqual(2)
    expect(msgs[0].role).toBe('user')
    expect(msgs[0].content).toBe('Hello!')
    expect(msgs[1].role).toBe('assistant')
  })

  it('assembles streamed content', async () => {
    const { result } = renderHook(() => useChat(), { wrapper })
    act(() => { result.current.newConversation() })

    await act(async () => {
      await result.current.sendMessage('Say hi')
    })

    await waitFor(() => {
      expect(result.current.state.isStreaming).toBe(false)
    })

    const msgs = result.current.activeConversation?.messages ?? []
    const assistant = msgs.find(m => m.role === 'assistant')
    expect(assistant?.content).toBe('Hello, world!')
  })

  it('ignores empty messages', async () => {
    const { result } = renderHook(() => useChat(), { wrapper })
    act(() => { result.current.newConversation() })

    await act(async () => { await result.current.sendMessage('  ') })

    expect(result.current.activeConversation?.messages).toHaveLength(0)
  })
})
