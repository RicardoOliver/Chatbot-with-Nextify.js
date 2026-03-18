import { useState, useRef } from 'react'
import { useChat } from '../context/ChatContext'
import type { Conversation } from '../types'

export default function Sidebar() {
  const { state, activeConversation, newConversation, setActive, deleteConversation, pinConversation, renameConversation } = useChat()
  const [search, setSearch] = useState('')
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const renameRef = useRef<HTMLInputElement>(null)

  const { conversations } = state

  const filtered = conversations.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()),
  )
  const pinned = filtered.filter(c => c.pinned)
  const recent = filtered.filter(c => !c.pinned)

  const startRename = (c: Conversation) => {
    setRenamingId(c.id)
    setRenameValue(c.title)
    setTimeout(() => renameRef.current?.focus(), 50)
  }

  const confirmRename = (id: string) => {
    if (renameValue.trim()) renameConversation(id, renameValue.trim())
    setRenamingId(null)
  }

  const formatDate = (ts: number) => {
    const d = new Date(ts)
    const now = new Date()
    if (d.toDateString() === now.toDateString()) return 'Today'
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return d.toLocaleDateString('en', { month: 'short', day: 'numeric' })
  }

  const ConvItem = ({ conv }: { conv: Conversation }) => {
    const isActive = conv.id === activeConversation?.id
    const [hovered, setHovered] = useState(false)

    return (
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setActive(conv.id)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '8px 10px',
          borderRadius: 'var(--radius-md)',
          background: isActive ? 'var(--amber-dim)' : hovered ? 'var(--bg-elevated)' : 'transparent',
          border: `1px solid ${isActive ? 'var(--amber-border)' : 'transparent'}`,
          cursor: 'pointer',
          transition: 'all 0.15s',
          marginBottom: '2px',
        }}
      >
        <span style={{ fontSize: '13px', flexShrink: 0, opacity: isActive ? 1 : 0.5 }}>
          {conv.pinned ? '📌' : '💬'}
        </span>

        {renamingId === conv.id ? (
          <input
            ref={renameRef}
            value={renameValue}
            onChange={e => setRenameValue(e.target.value)}
            onBlur={() => confirmRename(conv.id)}
            onKeyDown={e => {
              if (e.key === 'Enter') confirmRename(conv.id)
              if (e.key === 'Escape') setRenamingId(null)
            }}
            onClick={e => e.stopPropagation()}
            style={{
              flex: 1, background: 'var(--bg-elevated)',
              border: '1px solid var(--amber-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              fontSize: '12px', padding: '2px 6px',
              outline: 'none', fontFamily: 'var(--font-mono)',
            }}
          />
        ) : (
          <span style={{
            flex: 1, fontSize: '12px',
            color: isActive ? 'var(--amber)' : 'var(--text-secondary)',
            fontWeight: isActive ? 600 : 400,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            fontFamily: 'var(--font-mono)',
          }}>
            {conv.title}
          </span>
        )}

        {hovered && renamingId !== conv.id && (
          <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => pinConversation(conv.id)}
              title={conv.pinned ? 'Unpin' : 'Pin'}
              style={iconBtn}
            >📌</button>
            <button
              onClick={() => startRename(conv)}
              title="Rename"
              style={iconBtn}
            >✎</button>
            <button
              onClick={() => deleteConversation(conv.id)}
              title="Delete"
              style={{ ...iconBtn, color: 'var(--red)' }}
            >✕</button>
          </div>
        )}
      </div>
    )
  }

  return (
    <aside style={{
      width: 'var(--sidebar-w)',
      height: '100vh',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-default)',
      display: 'flex', flexDirection: 'column',
      flexShrink: 0, overflow: 'hidden',
    }}>

      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid var(--border-default)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{
            width: 32, height: 32,
            background: 'var(--amber)',
            borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', flexShrink: 0,
          }}>⚡</div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '14px', color: 'var(--amber)' }}>
              AI Chatbot
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Powered by Claude
            </div>
          </div>
        </div>

        <button
          onClick={newConversation}
          style={{
            width: '100%', padding: '8px',
            background: 'var(--amber)', color: '#080c10',
            border: 'none', borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-mono)', fontWeight: 700,
            fontSize: '12px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          <span>+</span> New Chat
        </button>
      </div>

      {/* Search */}
      <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          padding: '6px 10px',
        }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>⌕</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search chats..."
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: '12px',
              fontFamily: 'var(--font-mono)',
            }}
          />
        </div>
      </div>

      {/* Conversations */}
      <div style={{ flex: 1, overflow: 'auto', padding: '8px 10px' }}>
        {conversations.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '40px 20px',
            color: 'var(--text-muted)', fontSize: '12px',
            fontFamily: 'var(--font-mono)',
          }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>💬</div>
            No conversations yet.
            <br />Start a new chat!
          </div>
        ) : (
          <>
            {pinned.length > 0 && (
              <>
                <div style={sectionLabel}>Pinned</div>
                {pinned.map(c => <ConvItem key={c.id} conv={c} />)}
              </>
            )}
            {recent.length > 0 && (
              <>
                {pinned.length > 0 && <div style={sectionLabel}>Recent</div>}
                {recent.map(c => <ConvItem key={c.id} conv={c} />)}
              </>
            )}
            {filtered.length === 0 && (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px', fontFamily: 'var(--font-mono)' }}>
                No results for "{search}"
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '10px 16px',
        borderTop: '1px solid var(--border-default)',
        fontSize: '11px', color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span>{conversations.length} chat{conversations.length !== 1 ? 's' : ''}</span>
        <a href="/settings" style={{ color: 'var(--text-muted)', fontSize: '14px' }}>⚙</a>
      </div>
    </aside>
  )
}

const iconBtn: React.CSSProperties = {
  background: 'none', border: 'none',
  cursor: 'pointer', fontSize: '11px',
  color: 'var(--text-muted)', padding: '2px 3px',
  borderRadius: '3px', lineHeight: 1,
}

const sectionLabel: React.CSSProperties = {
  fontSize: '10px', fontWeight: 700,
  color: 'var(--text-muted)',
  fontFamily: 'var(--font-mono)',
  textTransform: 'uppercase', letterSpacing: '0.1em',
  padding: '8px 4px 4px',
}
