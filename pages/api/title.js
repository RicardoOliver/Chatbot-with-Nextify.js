export default async function handler(req) {
    if (req.method !== 'POST') {
        return Response.json({ error: 'Method Not Allowed' }, { status: 405 });
    }
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        return Response.json({ title: 'New Conversation' });
    }
    const { message } = await req.json();
    try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 20,
                messages: [{
                        role: 'user',
                        content: `Generate a very short title (max 5 words, no quotes) for a conversation that starts with: "${message.slice(0, 200)}"`,
                    }],
            }),
        });
        const data = await res.json();
        const title = data.content?.[0]?.text?.trim() ?? 'New Conversation';
        return Response.json({ title });
    }
    catch {
        return Response.json({ title: message.slice(0, 40) });
    }
}
