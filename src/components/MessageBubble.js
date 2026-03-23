import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
export default function MessageBubble({ message }) {
    const [copied, setCopied] = useState(false);
    const isUser = message.role === 'user';
    const isStreaming = message.status === 'streaming';
    const isError = message.status === 'error';
    const copyMessage = () => {
        navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };
    const time = new Date(message.timestamp).toLocaleTimeString('en', {
        hour: '2-digit', minute: '2-digit',
    });
    return (_jsxs("div", { className: "animate-in", style: {
            display: 'flex',
            flexDirection: isUser ? 'row-reverse' : 'row',
            gap: '12px',
            alignItems: 'flex-start',
            maxWidth: '100%',
        }, children: [_jsx("div", { style: {
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
                }, children: isUser ? '👤' : isError ? '⚠' : '⚡' }), _jsxs("div", { style: {
                    flex: 1,
                    maxWidth: isUser ? '75%' : '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                }, children: [_jsxs("div", { style: {
                            display: 'flex', alignItems: 'center', gap: '8px',
                            marginBottom: '5px',
                            flexDirection: isUser ? 'row-reverse' : 'row',
                        }, children: [_jsx("span", { style: {
                                    fontSize: '11px', fontWeight: 700,
                                    fontFamily: 'var(--font-mono)',
                                    color: isUser ? 'var(--cyan)' : isError ? 'var(--red)' : 'var(--amber)',
                                    textTransform: 'uppercase', letterSpacing: '0.05em',
                                }, children: isUser ? 'You' : message.model ? `Claude` : 'Assistant' }), _jsx("span", { style: { fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }, children: time }), message.model && !isUser && (_jsx("span", { style: {
                                    fontSize: '10px', color: 'var(--text-muted)',
                                    background: 'var(--bg-elevated)',
                                    padding: '1px 5px', borderRadius: '3px',
                                    fontFamily: 'var(--font-mono)',
                                    border: '1px solid var(--border-subtle)',
                                }, children: message.model.replace('claude-', '').replace('-20251001', '') }))] }), _jsx("div", { style: {
                            background: isUser ? 'var(--cyan-dim)' : isError ? 'rgba(255,95,87,0.08)' : 'var(--bg-surface)',
                            border: `1px solid ${isUser ? 'rgba(77,217,232,0.2)' : isError ? 'rgba(255,95,87,0.2)' : 'var(--border-default)'}`,
                            borderRadius: isUser
                                ? 'var(--radius-lg) var(--radius-sm) var(--radius-lg) var(--radius-lg)'
                                : 'var(--radius-sm) var(--radius-lg) var(--radius-lg) var(--radius-lg)',
                            padding: '12px 16px',
                            position: 'relative',
                            minWidth: '40px',
                        }, children: isUser ? (_jsx("p", { style: {
                                fontSize: '14px', lineHeight: 1.65,
                                color: 'var(--text-primary)',
                                fontFamily: 'var(--font-sans)',
                                whiteSpace: 'pre-wrap',
                            }, children: message.content })) : (_jsxs("div", { className: "md-content", children: [message.content ? (_jsx(ReactMarkdown, { remarkPlugins: [remarkGfm], components: {
                                        code({ node, className, children, ...props }) {
                                            const match = /language-(\w+)/.exec(className ?? '');
                                            const isBlock = !!match;
                                            if (isBlock) {
                                                const lang = match[1];
                                                const code = String(children).replace(/\n$/, '');
                                                return (_jsxs("div", { style: { position: 'relative' }, children: [_jsxs("div", { style: {
                                                                display: 'flex', alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                                background: '#1e1e1e',
                                                                padding: '6px 14px',
                                                                borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                                                                borderBottom: '1px solid #333',
                                                            }, children: [_jsx("span", { style: { fontSize: '11px', color: '#888', fontFamily: 'var(--font-mono)' }, children: lang }), _jsx(CopyButton, { code: code })] }), _jsx(SyntaxHighlighter, { style: vscDarkPlus, language: lang, PreTag: "div", customStyle: {
                                                                margin: 0,
                                                                borderRadius: '0 0 var(--radius-md) var(--radius-md)',
                                                                fontSize: '13px',
                                                            }, children: code })] }));
                                            }
                                            return _jsx("code", { className: className, ...props, children: children });
                                        },
                                    }, children: message.content })) : null, isStreaming && (_jsx("span", { style: { display: 'inline-flex', gap: '3px', marginLeft: '4px', verticalAlign: 'middle' }, children: [0, 1, 2].map(i => (_jsx("span", { style: {
                                            width: 5, height: 5, borderRadius: '50%',
                                            background: 'var(--amber)',
                                            display: 'inline-block',
                                            animation: `typing-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
                                        } }, i))) }))] })) }), !isStreaming && message.content && !isUser && (_jsx("button", { onClick: copyMessage, style: {
                            marginTop: '4px',
                            fontSize: '11px',
                            color: copied ? 'var(--green)' : 'var(--text-muted)',
                            background: 'none', border: 'none',
                            cursor: 'pointer', fontFamily: 'var(--font-mono)',
                            padding: '2px 4px',
                            transition: 'color 0.15s',
                        }, children: copied ? '✓ Copied' : '⎘ Copy' }))] })] }));
}
function CopyButton({ code }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };
    return (_jsx("button", { onClick: copy, style: {
            fontSize: '11px', fontFamily: 'var(--font-mono)',
            color: copied ? '#4dd9e8' : '#888',
            background: 'none', border: 'none', cursor: 'pointer',
            transition: 'color 0.15s',
        }, children: copied ? '✓ Copied' : 'Copy' }));
}
