import type { ChatRequest } from '../../src/types'

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method Not Allowed' }, { status: 405 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
  }

  let body: ChatRequest
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { messages, model, systemPrompt, temperature = 0.7, maxTokens = 1024 } = body

  if (!messages?.length) {
    return Response.json({ error: 'messages array is required' }, { status: 400 })
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
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
        system: systemPrompt,
        messages: messages.map(m => ({
          role: m.role === 'system' ? 'user' : m.role,
          content: m.content,
        })),
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      return Response.json(
        { error: err?.error?.message ?? 'Anthropic API error' },
        { status: response.status },
      )
    }

    const data = await response.json()
    return Response.json({
      id: data.id,
      content: data.content[0]?.text ?? '',
      model: data.model,
      usage: data.usage,
    })
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 },
    )
  }
}
