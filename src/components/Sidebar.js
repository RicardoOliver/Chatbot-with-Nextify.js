import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef } from 'react';
import { useChat } from '../context/ChatContext';
export default function Sidebar() {
    const { state, activeConversation, newConversation, setActive, deleteConversation, pinConversation, renameConversation } = useChat();
    const [search, setSearch] = useState('');
    const [renamingId, setRenamingId] = useState(null);
    const [renameValue, setRenameValue] = useState('');
    const renameRef = useRef(null);
    const { conversations } = state;
    const filtered = conversations.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));
    const pinned = filtered.filter(c => c.pinned);
    const recent = filtered.filter(c => !c.pinned);
    const startRename = (c) => {
        setRenamingId(c.id);
        setRenameValue(c.title);
        setTimeout(() => renameRef.current?.focus(), 50);
    };
    const confirmRename = (id) => {
        if (renameValue.trim())
            renameConversation(id, renameValue.trim());
        setRenamingId(null);
    };
    const formatDate = (ts) => {
        const d = new Date(ts);
        const now = new Date();
        if (d.toDateString() === now.toDateString())
            return 'Today';
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        if (d.toDateString() === yesterday.toDateString())
            return 'Yesterday';
        return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
    };
    const ConvItem = ({ conv }) => {
        const isActive = conv.id === activeConversation?.id;
        const [hovered, setHovered] = useState(false);
        return (_jsxs("div", { onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false), onClick: () => setActive(conv.id), style: {
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'var(--amber-dim)' : hovered ? 'var(--bg-elevated)' : 'transparent',
                border: `1px solid ${isActive ? 'var(--amber-border)' : 'transparent'}`,
                cursor: 'pointer',
                transition: 'all 0.15s',
                marginBottom: '2px',
            }, children: [_jsx("span", { style: { fontSize: '13px', flexShrink: 0, opacity: isActive ? 1 : 0.5 }, children: conv.pinned ? '📌' : '💬' }), renamingId === conv.id ? (_jsx("input", { ref: renameRef, value: renameValue, onChange: e => setRenameValue(e.target.value), onBlur: () => confirmRename(conv.id), onKeyDown: e => {
                        if (e.key === 'Enter')
                            confirmRename(conv.id);
                        if (e.key === 'Escape')
                            setRenamingId(null);
                    }, onClick: e => e.stopPropagation(), style: {
                        flex: 1, background: 'var(--bg-elevated)',
                        border: '1px solid var(--amber-border)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                        fontSize: '12px', padding: '2px 6px',
                        outline: 'none', fontFamily: 'var(--font-mono)',
                    } })) : (_jsx("span", { style: {
                        flex: 1, fontSize: '12px',
                        color: isActive ? 'var(--amber)' : 'var(--text-secondary)',
                        fontWeight: isActive ? 600 : 400,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        fontFamily: 'var(--font-mono)',
                    }, children: conv.title })), hovered && renamingId !== conv.id && (_jsxs("div", { style: { display: 'flex', gap: '2px', flexShrink: 0 }, onClick: e => e.stopPropagation(), children: [_jsx("button", { onClick: () => pinConversation(conv.id), title: conv.pinned ? 'Unpin' : 'Pin', style: iconBtn, children: "\uD83D\uDCCC" }), _jsx("button", { onClick: () => startRename(conv), title: "Rename", style: iconBtn, children: "\u270E" }), _jsx("button", { onClick: () => deleteConversation(conv.id), title: "Delete", style: { ...iconBtn, color: 'var(--red)' }, children: "\u2715" })] }))] }));
    };
    return (_jsxs("aside", { style: {
            width: 'var(--sidebar-w)',
            height: '100vh',
            background: 'var(--bg-surface)',
            borderRight: '1px solid var(--border-default)',
            display: 'flex', flexDirection: 'column',
            flexShrink: 0, overflow: 'hidden',
        }, children: [_jsxs("div", { style: {
                    padding: '16px',
                    borderBottom: '1px solid var(--border-default)',
                }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }, children: [_jsx("div", { style: {
                                    width: 32, height: 32,
                                    background: 'var(--amber)',
                                    borderRadius: 'var(--radius-md)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '16px', flexShrink: 0,
                                }, children: "\u26A1" }), _jsxs("div", { children: [_jsx("div", { style: { fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '14px', color: 'var(--amber)' }, children: "AI Chatbot" }), _jsx("div", { style: { fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }, children: "Powered by Claude" })] })] }), _jsxs("button", { onClick: newConversation, style: {
                            width: '100%', padding: '8px',
                            background: 'var(--amber)', color: '#080c10',
                            border: 'none', borderRadius: 'var(--radius-md)',
                            fontFamily: 'var(--font-mono)', fontWeight: 700,
                            fontSize: '12px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                            transition: 'opacity 0.15s',
                        }, onMouseEnter: e => (e.currentTarget.style.opacity = '0.85'), onMouseLeave: e => (e.currentTarget.style.opacity = '1'), children: [_jsx("span", { children: "+" }), " New Chat"] })] }), _jsx("div", { style: { padding: '10px 16px', borderBottom: '1px solid var(--border-subtle)' }, children: _jsxs("div", { style: {
                        display: 'flex', alignItems: 'center', gap: '6px',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-md)',
                        padding: '6px 10px',
                    }, children: [_jsx("span", { style: { fontSize: '12px', color: 'var(--text-muted)' }, children: "\u2315" }), _jsx("input", { value: search, onChange: e => setSearch(e.target.value), placeholder: "Search chats...", style: {
                                flex: 1, background: 'none', border: 'none', outline: 'none',
                                color: 'var(--text-primary)', fontSize: '12px',
                                fontFamily: 'var(--font-mono)',
                            } })] }) }), _jsx("div", { style: { flex: 1, overflow: 'auto', padding: '8px 10px' }, children: conversations.length === 0 ? (_jsxs("div", { style: {
                        textAlign: 'center', padding: '40px 20px',
                        color: 'var(--text-muted)', fontSize: '12px',
                        fontFamily: 'var(--font-mono)',
                    }, children: [_jsx("div", { style: { fontSize: '28px', marginBottom: '8px' }, children: "\uD83D\uDCAC" }), "No conversations yet.", _jsx("br", {}), "Start a new chat!"] })) : (_jsxs(_Fragment, { children: [pinned.length > 0 && (_jsxs(_Fragment, { children: [_jsx("div", { style: sectionLabel, children: "Pinned" }), pinned.map(c => _jsx(ConvItem, { conv: c }, c.id))] })), recent.length > 0 && (_jsxs(_Fragment, { children: [pinned.length > 0 && _jsx("div", { style: sectionLabel, children: "Recent" }), recent.map(c => _jsx(ConvItem, { conv: c }, c.id))] })), filtered.length === 0 && (_jsxs("div", { style: { fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px', fontFamily: 'var(--font-mono)' }, children: ["No results for \"", search, "\""] }))] })) }), _jsxs("div", { style: {
                    padding: '10px 16px',
                    borderTop: '1px solid var(--border-default)',
                    fontSize: '11px', color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }, children: [_jsxs("span", { children: [conversations.length, " chat", conversations.length !== 1 ? 's' : ''] }), _jsx("a", { href: "/settings", style: { color: 'var(--text-muted)', fontSize: '14px' }, children: "\u2699" })] })] }));
}
const iconBtn = {
    background: 'none', border: 'none',
    cursor: 'pointer', fontSize: '11px',
    color: 'var(--text-muted)', padding: '2px 3px',
    borderRadius: '3px', lineHeight: 1,
};
const sectionLabel = {
    fontSize: '10px', fontWeight: 700,
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
    textTransform: 'uppercase', letterSpacing: '0.1em',
    padding: '8px 4px 4px',
};
