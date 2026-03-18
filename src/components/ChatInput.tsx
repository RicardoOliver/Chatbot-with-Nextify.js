import { useState, useRef, useEffect } from 'react'
import { useChat } from '../context/ChatContext'
import { MODELS } from '../lib/constants'

export default function ChatInput() {
  const { state, sendMessage, stopStreaming, updateSettings } = useChat()
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { isStreaming, settings } = state

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }, [value])

  const handleSend = async () => {
    const trimmed = value.trim()
    if (!trimmed || isStreaming) return
    setValue('')
    await sendMessage(trimmed)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (settings.sendOnEnter && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const currentModel = MODELS.find(m => m.id === settings.model)

  return (
    <div style={{
      padding: '16px 24px 20px',
      borderTop: '1px solid var(--border-default)',
      background: 'var(--bg-base)',
    }}>
      {/* Model selector row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        marginBottom: '10px',
        flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          Model:
        </span>
        {MODELS.map(m => (
          <button
            key={m.id}
            onClick={() => updateSettings({ model: m.id })}
            style={{
              fontSize: '11px', fontFamily: 'var(--font-mono)',
              padding: '3px 9px',
              borderRadius: '20px',
              border: `1px solid ${settings.model === m.id ? 'var(--amber-border)' : 'var(--border-default)'}`,
              background: settings.model === m.id ? 'var(--amber-dim)' : 'transparent',
              color: settings.model === m.id ? 'var(--amber)' : 'var(--text-muted)',
              cursor: 'pointer',
              fontWeight: settings.model === m.id ? 700 : 400,
              transition: 'all 0.15s',
            }}
          >
            {m.name.replace('Claude ', '')}
          </button>
        ))}

        <div style={{ flex: 1 }} />

        <label style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          fontSize: '11px', color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)', cursor: 'pointer',
        }}>
          <input
            type="checkbox"
            checked={settings.sendOnEnter}
            onChange={e => updateSettings({ sendOnEnter: e.target.checked })}
            style={{ accentColor: 'var(--amber)', cursor: 'pointer' }}
          />
          Enter to send
        </label>
      </div>

      {/* Input area */}
      <div style={{
        display: 'flex', gap: '10px', alignItems: 'flex-end',
        background: 'var(--bg-surface)',
        border: `1px solid ${isStreaming ? 'var(--amber-border)' : 'var(--border-default)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '10px 12px',
        transition: 'border-color 0.2s',
      }}
        onFocus={() => {}}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isStreaming ? 'Claude is thinking...' : 'Message Claude... (Shift+Enter for new line)'}
          disabled={isStreaming}
          rows={1}
          style={{
            flex: 1,
            background: 'none', border: 'none', outline: 'none',
            resize: 'none',
            color: isStreaming ? 'var(--text-muted)' : 'var(--text-primary)',
            fontSize: '14px', lineHeight: 1.6,
            fontFamily: 'var(--font-sans)',
            maxHeight: '200px', overflowY: 'auto',
          }}
        />

        {isStreaming ? (
          <button
            onClick={stopStreaming}
            title="Stop generating"
            style={{
              width: 36, height: 36, flexShrink: 0,
              background: 'rgba(255,95,87,0.15)',
              border: '1px solid rgba(255,95,87,0.3)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--red)', fontSize: '16px',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'pulse-amber 1.5s ease infinite',
            }}
          >
            ■
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!value.trim()}
            title="Send (Enter)"
            style={{
              width: 36, height: 36, flexShrink: 0,
              background: value.trim() ? 'var(--amber)' : 'var(--bg-elevated)',
              border: `1px solid ${value.trim() ? 'transparent' : 'var(--border-default)'}`,
              borderRadius: 'var(--radius-md)',
              color: value.trim() ? '#080c10' : 'var(--text-muted)',
              fontSize: '16px', cursor: value.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
          >
            ↑
          </button>
        )}
      </div>

      <div style={{
        fontSize: '10px', color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)', textAlign: 'center',
        marginTop: '8px',
      }}>
        {currentModel?.name} · {currentModel?.contextWindow.toLocaleString()} token context
      </div>
    </div>
  )
}
