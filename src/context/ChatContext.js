import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useReducer, useCallback, useRef, } from 'react';
import { v4 as uuid } from 'uuid';
import { DEFAULT_SETTINGS } from '../lib/constants';
import { streamMessage, generateTitle } from '../lib/api';
function createConversation(model) {
    return {
        id: uuid(),
        title: 'New Conversation',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        model,
    };
}
function reducer(state, action) {
    switch (action.type) {
        case 'NEW_CONVERSATION': {
            const conv = createConversation(state.settings.model);
            return {
                ...state,
                conversations: [conv, ...state.conversations],
                activeId: conv.id,
                error: null,
            };
        }
        case 'SET_ACTIVE':
            return { ...state, activeId: action.id, error: null };
        case 'DELETE_CONVERSATION': {
            const remaining = state.conversations.filter(c => c.id !== action.id);
            const newActive = state.activeId === action.id
                ? (remaining[0]?.id ?? null)
                : state.activeId;
            return { ...state, conversations: remaining, activeId: newActive };
        }
        case 'PIN_CONVERSATION':
            return {
                ...state,
                conversations: state.conversations.map(c => c.id === action.id ? { ...c, pinned: !c.pinned } : c),
            };
        case 'RENAME_CONVERSATION':
            return {
                ...state,
                conversations: state.conversations.map(c => c.id === action.id ? { ...c, title: action.title } : c),
            };
        case 'ADD_MESSAGE':
            return {
                ...state,
                conversations: state.conversations.map(c => c.id === action.conversationId
                    ? { ...c, messages: [...c.messages, action.message], updatedAt: Date.now() }
                    : c),
            };
        case 'UPDATE_MESSAGE':
            return {
                ...state,
                conversations: state.conversations.map(c => c.id === action.conversationId
                    ? {
                        ...c,
                        messages: c.messages.map(m => m.id === action.messageId ? { ...m, ...action.patch } : m),
                    }
                    : c),
            };
        case 'UPDATE_SETTINGS':
            return { ...state, settings: { ...state.settings, ...action.patch } };
        case 'SET_STREAMING':
            return { ...state, isStreaming: action.value };
        case 'SET_ERROR':
            return { ...state, error: action.error };
        case 'CLEAR_CONVERSATION':
            return {
                ...state,
                conversations: state.conversations.map(c => c.id === action.id ? { ...c, messages: [], updatedAt: Date.now() } : c),
            };
        default:
            return state;
    }
}
const ChatContext = createContext(null);
const initial = {
    conversations: [],
    activeId: null,
    settings: DEFAULT_SETTINGS,
    isStreaming: false,
    error: null,
};
export function ChatProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, initial);
    const abortRef = useRef(null);
    const activeConversation = state.conversations.find(c => c.id === state.activeId) ?? null;
    const newConversation = useCallback(() => {
        dispatch({ type: 'NEW_CONVERSATION' });
    }, []);
    const setActive = useCallback((id) => {
        dispatch({ type: 'SET_ACTIVE', id });
    }, []);
    const deleteConversation = useCallback((id) => {
        dispatch({ type: 'DELETE_CONVERSATION', id });
    }, []);
    const pinConversation = useCallback((id) => {
        dispatch({ type: 'PIN_CONVERSATION', id });
    }, []);
    const renameConversation = useCallback((id, title) => {
        dispatch({ type: 'RENAME_CONVERSATION', id, title });
    }, []);
    const clearConversation = useCallback((id) => {
        dispatch({ type: 'CLEAR_CONVERSATION', id });
    }, []);
    const stopStreaming = useCallback(() => {
        abortRef.current?.abort();
        dispatch({ type: 'SET_STREAMING', value: false });
    }, []);
    const updateSettings = useCallback((patch) => {
        dispatch({ type: 'UPDATE_SETTINGS', patch });
    }, []);
    const sendMessage = useCallback(async (content) => {
        if (!content.trim() || state.isStreaming)
            return;
        // Ensure there's an active conversation
        let convId = state.activeId;
        if (!convId) {
            const conv = createConversation(state.settings.model);
            dispatch({ type: 'NEW_CONVERSATION' });
            convId = conv.id;
        }
        const conversation = state.conversations.find(c => c.id === convId) ??
            { id: convId, messages: [], model: state.settings.model };
        // User message
        const userMsg = {
            id: uuid(), role: 'user', content,
            timestamp: Date.now(), status: 'done',
        };
        dispatch({ type: 'ADD_MESSAGE', conversationId: convId, message: userMsg });
        // Auto-generate title after first message
        if (conversation.messages.length === 0) {
            generateTitle(content).then(title => {
                dispatch({ type: 'RENAME_CONVERSATION', id: convId, title });
            });
        }
        // Assistant placeholder
        const assistantMsg = {
            id: uuid(), role: 'assistant', content: '',
            timestamp: Date.now(), status: 'streaming',
            model: state.settings.model,
        };
        dispatch({ type: 'ADD_MESSAGE', conversationId: convId, message: assistantMsg });
        dispatch({ type: 'SET_STREAMING', value: true });
        dispatch({ type: 'SET_ERROR', error: null });
        const controller = new AbortController();
        abortRef.current = controller;
        try {
            const history = [
                ...conversation.messages.map(m => ({ role: m.role, content: m.content })),
                { role: 'user', content },
            ];
            let accumulated = '';
            for await (const chunk of streamMessage({
                messages: history,
                model: state.settings.model,
                systemPrompt: state.settings.systemPrompt,
                temperature: state.settings.temperature,
                maxTokens: state.settings.maxTokens,
                stream: true,
            }, controller.signal)) {
                accumulated += chunk;
                dispatch({
                    type: 'UPDATE_MESSAGE',
                    conversationId: convId,
                    messageId: assistantMsg.id,
                    patch: { content: accumulated, status: 'streaming' },
                });
            }
            dispatch({
                type: 'UPDATE_MESSAGE',
                conversationId: convId,
                messageId: assistantMsg.id,
                patch: { status: 'done' },
            });
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : 'Unknown error';
            if (msg !== 'AbortError' && !msg.includes('abort')) {
                dispatch({ type: 'SET_ERROR', error: msg });
                dispatch({
                    type: 'UPDATE_MESSAGE',
                    conversationId: convId,
                    messageId: assistantMsg.id,
                    patch: { status: 'error', content: `Error: ${msg}` },
                });
            }
        }
        finally {
            dispatch({ type: 'SET_STREAMING', value: false });
        }
    }, [state]);
    return (_jsx(ChatContext.Provider, { value: {
            state, activeConversation,
            newConversation, setActive, deleteConversation,
            pinConversation, renameConversation, clearConversation,
            sendMessage, stopStreaming, updateSettings,
        }, children: children }));
}
export function useChat() {
    const ctx = useContext(ChatContext);
    if (!ctx)
        throw new Error('useChat must be used within ChatProvider');
    return ctx;
}
