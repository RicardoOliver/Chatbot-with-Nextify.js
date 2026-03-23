export default async function handler(req) {
    if (req.method !== 'POST') {
        return Response.json({ error: 'Method Not Allowed' }, { status: 405 });
    }
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        return Response.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
    }
    let body;
    try {
        body = await req.json();
    }
    catch {
        return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const { messages, model, systemPrompt, temperature = 0.7, maxTokens = 1024 } = body;
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
            model: model ?? 'claude-sonnet-4-6',
            max_tokens: maxTokens,
            temperature,
            stream: true,
            system: systemPrompt,
            messages: messages.map((m) => ({
                role: m.role === 'system' ? 'user' : m.role,
                content: m.content,
            })),
        }),
    });
    if (!anthropicRes.ok) {
        const err = await anthropicRes.json();
        return Response.json({ error: err?.error?.message ?? 'Anthropic API error' }, { status: anthropicRes.status });
    }
    const stream = new ReadableStream({
        async start(controller) {
            const reader = anthropicRes.body.getReader();
            const decoder = new TextDecoder();
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
                        controller.close();
                        break;
                    }
                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n');
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6).trim();
                            if (data === '[DONE]')
                                continue;
                            try {
                                const parsed = JSON.parse(data);
                                if (parsed.type === 'content_block_delta' &&
                                    parsed.delta?.text) {
                                    const out = JSON.stringify({
                                        delta: { text: parsed.delta.text }
                                    });
                                    controller.enqueue(new TextEncoder().encode(`data: ${out}\n\n`));
                                }
                            }
                            catch {
                                // ignora chunks inválidos
                            }
                        }
                    }
                }
            }
            catch {
                controller.close();
            }
        },
    });
    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
        },
    });
}
