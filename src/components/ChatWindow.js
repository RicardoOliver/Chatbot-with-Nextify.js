import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { WELCOME_MESSAGES } from '../lib/constants';
const WELCOME = WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)];
export default function ChatWindow() {
    const { activeConversation, newConversation, clearConversation, state } = useChat();
    const bottomRef = useRef(null);
    const messages = activeConversation?.messages ?? [];
    // Auto-scroll to bottom on new message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length, messages[messages.length - 1]?.content]);
    return (_jsxs("div", { style: {
            flex: 1, display: 'flex', flexDirection: 'column',
            height: '100vh', overflow: 'hidden',
            background: 'var(--bg-base)',
        }, children: [_jsxs("header", { style: {
                    height: '52px',
                    borderBottom: '1px solid var(--border-default)',
                    display: 'flex', alignItems: 'center',
                    padding: '0 20px', gap: '12px',
                    background: 'var(--bg-surface)',
                    flexShrink: 0,
                }, children: [_jsx("div", { style: {
                            flex: 1, overflow: 'hidden',
                            fontFamily: 'var(--font-mono)', fontSize: '13px',
                            color: activeConversation ? 'var(--text-primary)' : 'var(--text-muted)',
                            whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                        }, children: activeConversation ? (_jsxs(_Fragment, { children: [_jsx("span", { style: { color: 'var(--amber)' }, children: "~/chats/" }), activeConversation.title] })) : (_jsx("span", { children: "Select or start a new conversation" })) }), activeConversation && (_jsxs("div", { style: { display: 'flex', gap: '6px' }, children: [_jsx(HeaderBtn, { onClick: () => clearConversation(activeConversation.id), title: "Clear chat", label: "\u232B Clear" }), _jsx(HeaderBtn, { onClick: newConversation, title: "New chat", label: "+ New", amber: true })] }))] }), _jsx("div", { style: { flex: 1, overflow: 'auto', padding: '24px' }, children: !activeConversation || messages.length === 0 ? (_jsx(WelcomeScreen, { onNew: newConversation, hasConversation: !!activeConversation })) : (_jsxs("div", { style: { maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }, children: [messages.map(msg => (_jsx(MessageBubble, { message: msg }, msg.id))), _jsx("div", { ref: bottomRef })] })) }), _jsx("div", { style: { maxWidth: '800px', width: '100%', margin: '0 auto', flexShrink: 0 }, children: _jsx(ChatInput, {}) })] }));
}
function HeaderBtn({ onClick, title, label, amber }) {
    return (_jsx("button", { onClick: onClick, title: title, style: {
            padding: '5px 10px',
            background: amber ? 'var(--amber-dim)' : 'var(--bg-elevated)',
            border: `1px solid ${amber ? 'var(--amber-border)' : 'var(--border-default)'}`,
            borderRadius: 'var(--radius-md)',
            color: amber ? 'var(--amber)' : 'var(--text-secondary)',
            fontSize: '11px', cursor: 'pointer',
            fontFamily: 'var(--font-mono)', fontWeight: amber ? 700 : 400,
            transition: 'all 0.15s',
        }, children: label }));
}
function WelcomeScreen({ onNew, hasConversation }) {
    const prompts = [
        'Explain how React hooks work',
        'Write a REST API in TypeScript',
        'Refactor this code for better performance',
        'Explain Big O notation with examples',
        'Write unit tests for a sorting function',
        'How does the event loop work in JavaScript?',
    ];
    return (_jsxs("div", { className: "animate-in", style: {
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            minHeight: '60vh', textAlign: 'center',
            padding: '40px 24px',
        }, children: [_jsx("div", { style: {
                    width: 64, height: 64,
                    background: 'var(--amber-dim)',
                    border: '1px solid var(--amber-border)',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '28px', marginBottom: '20px',
                    boxShadow: 'var(--amber-glow)',
                }, children: "\u26A1" }), _jsx("h1", { style: {
                    fontFamily: 'var(--font-mono)',
                    fontSize: '22px', fontWeight: 700,
                    color: 'var(--amber)', marginBottom: '8px',
                }, children: WELCOME }), _jsx("p", { style: {
                    fontSize: '14px', color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)', marginBottom: '32px',
                }, children: hasConversation ? 'Start typing below.' : 'Create a new chat to get started.' }), !hasConversation && (_jsx("button", { onClick: onNew, style: {
                    padding: '10px 24px',
                    background: 'var(--amber)', color: '#080c10',
                    border: 'none', borderRadius: 'var(--radius-md)',
                    fontFamily: 'var(--font-mono)', fontWeight: 700,
                    fontSize: '13px', cursor: 'pointer', marginBottom: '40px',
                }, children: "+ Start New Chat" })), hasConversation && (_jsx("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '10px', width: '100%', maxWidth: '640px',
                }, children: prompts.map(p => (_jsx(SuggestedPrompt, { text: p }, p))) }))] }));
}
function SuggestedPrompt({ text }) {
    const { sendMessage } = useChat();
    return (_jsxs("button", { onClick: () => sendMessage(text), style: {
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
        }, onMouseEnter: e => {
            e.currentTarget.style.borderColor = 'var(--amber-border)';
            e.currentTarget.style.color = 'var(--amber)';
        }, onMouseLeave: e => {
            e.currentTarget.style.borderColor = 'var(--border-default)';
            e.currentTarget.style.color = 'var(--text-secondary)';
        }, children: ["\"", text, "\""] }));
}
