import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { Message } from '../types'

interface MessageBubbleProps {
  message: Message
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'
  const isStreaming = message.status === 'streaming'
  const isError = message.status === 'error'

  const copyMessage = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const time = new Date(message.timestamp).toLocaleTimeString('en', {
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <div
      className="animate-in"
      style={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        gap: '12px',
        alignItems: 'flex-start',
        maxWidth: '100%',
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 32, height: 32,
        borderRadius: '50%',
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '14px',
        background: isUser
          ? 'linear-gradient(135deg, var(--cyan), #2980b9)'
          : isError ? 'rgba(255,95,87,0.2)' : 'var(--amber-dim)',
        border: `1px solid ${isUser ? 'rgba(77,217,232,0.3)' : isError ? 'rgba(255,95,87,0.3)' : 'var(--amber-border)'}`,
        marginTop: '2px',
      }}>
        {isUser ? '👤' : isError ? '⚠' : '⚡'}
      </div>

      {/* Bubble */}
      <div style={{
        flex: 1,
        maxWidth: isUser ? '75%' : '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
      }}>
        {/* Role + time */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          marginBottom: '5px',
          flexDirection: isUser ? 'row-reverse' : 'row',
        }}>
          <span style={{
            fontSize: '11px', fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            color: isUser ? 'var(--cyan)' : isError ? 'var(--red)' : 'var(--amber)',
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            {isUser ? 'You' : message.model ? `Claude` : 'Assistant'}
          </span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {time}
          </span>
          {message.model && !isUser && (
            <span style={{
              fontSize: '10px', color: 'var(--text-muted)',
              background: 'var(--bg-elevated)',
              padding: '1px 5px', borderRadius: '3px',
              fontFamily: 'var(--font-mono)',
              border: '1px solid var(--border-subtle)',
            }}>
              {message.model.replace('claude-', '').replace('-20251001', '')}
            </span>
          )}
        </div>

        {/* Content */}
        <div style={{
          background: isUser ? 'var(--cyan-dim)' : isError ? 'rgba(255,95,87,0.08)' : 'var(--bg-surface)',
          border: `1px solid ${isUser ? 'rgba(77,217,232,0.2)' : isError ? 'rgba(255,95,87,0.2)' : 'var(--border-default)'}`,
          borderRadius: isUser
            ? 'var(--radius-lg) var(--radius-sm) var(--radius-lg) var(--radius-lg)'
            : 'var(--radius-sm) var(--radius-lg) var(--radius-lg) var(--radius-lg)',
          padding: '12px 16px',
          position: 'relative',
          minWidth: '40px',
        }}>
          {isUser ? (
            <p style={{
              fontSize: '14px', lineHeight: 1.65,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)',
              whiteSpace: 'pre-wrap',
            }}>
              {message.content}
            </p>
          ) : (
            <div className="md-content">
              {message.content ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className ?? '')
                      const isBlock = !!match

                      if (isBlock) {
                        const lang = match![1]
                        const code = String(children).replace(/\n$/, '')
                        return (
                          <div style={{ position: 'relative' }}>
                            <div style={{
                              display: 'flex', alignItems: 'center',
                              justifyContent: 'space-between',
                              background: '#1e1e1e',
                              padding: '6px 14px',
                              borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                              borderBottom: '1px solid #333',
                            }}>
                              <span style={{ fontSize: '11px', color: '#888', fontFamily: 'var(--font-mono)' }}>
                                {lang}
                              </span>
                              <CopyButton code={code} />
                            </div>
                            <SyntaxHighlighter
                              style={vscDarkPlus}
                              language={lang}
                              PreTag="div"
                              customStyle={{
                                margin: 0,
                                borderRadius: '0 0 var(--radius-md) var(--radius-md)',
                                fontSize: '13px',
                              }}
                            >
                              {code}
                            </SyntaxHighlighter>
                          </div>
                        )
                      }
                      return <code className={className} {...props}>{children}</code>
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              ) : null}
              {isStreaming && (
                <span style={{ display: 'inline-flex', gap: '3px', marginLeft: '4px', verticalAlign: 'middle' }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: 'var(--amber)',
                      display: 'inline-block',
                      animation: `typing-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        {!isStreaming && message.content && !isUser && (
          <button
            onClick={copyMessage}
            style={{
              marginTop: '4px',
              fontSize: '11px',
              color: copied ? 'var(--green)' : 'var(--text-muted)',
              background: 'none', border: 'none',
              cursor: 'pointer', fontFamily: 'var(--font-mono)',
              padding: '2px 4px',
              transition: 'color 0.15s',
            }}
          >
            {copied ? '✓ Copied' : '⎘ Copy'}
          </button>
        )}
      </div>
    </div>
  )
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button onClick={copy} style={{
      fontSize: '11px', fontFamily: 'var(--font-mono)',
      color: copied ? '#4dd9e8' : '#888',
      background: 'none', border: 'none', cursor: 'pointer',
      transition: 'color 0.15s',
    }}>
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  )
}
