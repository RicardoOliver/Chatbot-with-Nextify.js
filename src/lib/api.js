const API_BASE = '/api';
// ─── Send a chat message (non-streaming) ─────────────────────────────
export async function sendMessage(req) {
    const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
}
// ─── Stream a chat response ───────────────────────────────────────────
export async function* streamMessage(req, signal) {
    const res = await fetch(`${API_BASE}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...req, stream: true }),
        signal,
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `HTTP ${res.status}`);
    }
    const reader = res.body?.getReader();
    if (!reader)
        throw new Error('No response body');
    const decoder = new TextDecoder();
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done)
                break;
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6).trim();
                    if (data === '[DONE]')
                        return;
                    try {
                        const parsed = JSON.parse(data);
                        const text = parsed?.delta?.text ?? parsed?.text ?? '';
                        if (text)
                            yield text;
                    }
                    catch {
                        // skip malformed chunks
                    }
                }
            }
        }
    }
    finally {
        reader.releaseLock();
    }
}
// ─── Generate conversation title ─────────────────────────────────────
export async function generateTitle(firstMessage) {
    try {
        const res = await fetch(`${API_BASE}/title`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: firstMessage }),
        });
        if (!res.ok)
            throw new Error();
        const data = await res.json();
        return data.title ?? 'New Conversation';
    }
    catch {
        return firstMessage.slice(0, 40) + (firstMessage.length > 40 ? '...' : '');
    }
}
// ─── Health check ────────────────────────────────────────────────────
export async function healthCheck() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
}
