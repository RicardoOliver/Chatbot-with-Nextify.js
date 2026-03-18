import { useEffect, useRef } from 'react'
import { useChat } from '../context/ChatContext'
import MessageBubble from './MessageBubble'
import ChatInput from './ChatInput'
import { WELCOME_MESSAGES } from '../lib/constants'

const WELCOME = WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)]

export default function ChatWindow() {
  const { activeConversation, newConversation, clearConversation, state } = useChat()
  const bottomRef = useRef<HTMLDivElement>(null)
  const messages = activeConversation?.messages ?? []

  // Auto-scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, messages[messages.length - 1]?.content])

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      height: '100vh', overflow: 'hidden',
      background: 'var(--bg-base)',
    }}>
      {/* Top bar */}
      <header style={{
        height: '52px',
        borderBottom: '1px solid var(--border-default)',
        display: 'flex', alignItems: 'center',
        padding: '0 20px', gap: '12px',
        background: 'var(--bg-surface)',
        flexShrink: 0,
      }}>
        <div style={{
          flex: 1, overflow: 'hidden',
          fontFamily: 'var(--font-mono)', fontSize: '13px',
          color: activeConversation ? 'var(--text-primary)' : 'var(--text-muted)',
          whiteSpace: 'nowrap', textOverflow: 'ellipsis',
        }}>
          {activeConversation ? (
            <>
              <span style={{ color: 'var(--amber)' }}>~/chats/</span>
              {activeConversation.title}
            </>
          ) : (
            <span>Select or start a new conversation</span>
          )}
        </div>

        {activeConversation && (
          <div style={{ display: 'flex', gap: '6px' }}>
            <HeaderBtn
              onClick={() => clearConversation(activeConversation.id)}
              title="Clear chat"
              label="⌫ Clear"
            />
            <HeaderBtn
              onClick={newConversation}
              title="New chat"
              label="+ New"
              amber
            />
          </div>
        )}
      </header>

      {/* Messages */}
      <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
        {!activeConversation || messages.length === 0 ? (
          <WelcomeScreen onNew={newConversation} hasConversation={!!activeConversation} />
        ) : (
          <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {messages.map(msg => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto', flexShrink: 0 }}>
        <ChatInput />
      </div>
    </div>
  )
}

function HeaderBtn({
  onClick, title, label, amber
}: { onClick: () => void; title: string; label: string; amber?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        padding: '5px 10px',
        background: amber ? 'var(--amber-dim)' : 'var(--bg-elevated)',
        border: `1px solid ${amber ? 'var(--amber-border)' : 'var(--border-default)'}`,
        borderRadius: 'var(--radius-md)',
        color: amber ? 'var(--amber)' : 'var(--text-secondary)',
        fontSize: '11px', cursor: 'pointer',
        fontFamily: 'var(--font-mono)', fontWeight: amber ? 700 : 400,
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  )
}

function WelcomeScreen({ onNew, hasConversation }: { onNew: () => void; hasConversation: boolean }) {
  const prompts = [
    'Explain how React hooks work',
    'Write a REST API in TypeScript',
    'Refactor this code for better performance',
    'Explain Big O notation with examples',
    'Write unit tests for a sorting function',
    'How does the event loop work in JavaScript?',
  ]

  return (
    <div className="animate-in" style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', textAlign: 'center',
      padding: '40px 24px',
    }}>
      <div style={{
        width: 64, height: 64,
        background: 'var(--amber-dim)',
        border: '1px solid var(--amber-border)',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '28px', marginBottom: '20px',
        boxShadow: 'var(--amber-glow)',
      }}>⚡</div>

      <h1 style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '22px', fontWeight: 700,
        color: 'var(--amber)', marginBottom: '8px',
      }}>
        {WELCOME}
      </h1>

      <p style={{
        fontSize: '14px', color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)', marginBottom: '32px',
      }}>
        {hasConversation ? 'Start typing below.' : 'Create a new chat to get started.'}
      </p>

      {!hasConversation && (
        <button onClick={onNew} style={{
          padding: '10px 24px',
          background: 'var(--amber)', color: '#080c10',
          border: 'none', borderRadius: 'var(--radius-md)',
          fontFamily: 'var(--font-mono)', fontWeight: 700,
          fontSize: '13px', cursor: 'pointer', marginBottom: '40px',
        }}>
          + Start New Chat
        </button>
      )}

      {/* Suggested prompts */}
      {hasConversation && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '10px', width: '100%', maxWidth: '640px',
        }}>
          {prompts.map(p => (
            <SuggestedPrompt key={p} text={p} />
          ))}
        </div>
      )}
    </div>
  )
}

function SuggestedPrompt({ text }: { text: string }) {
  const { sendMessage } = useChat()
  return (
    <button
      onClick={() => sendMessage(text)}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 14px',
        color: 'var(--text-secondary)',
        fontSize: '12px', cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'var(--font-mono)',
        transition: 'all 0.15s',
        lineHeight: 1.4,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--amber-border)'
        ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--amber)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-default)'
        ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'
      }}
    >
      "{text}"
    </button>
  )
}
