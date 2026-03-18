# 🤖 AI Chatbot — Powered by Claude

Advanced chatbot application built with **create-nextify** and **nextify-monorepo**, using the Anthropic Claude API.

## 🚀 Quick Start

```bash
# Create project
npx create-nextify@latest ai-chatbot
cd ai-chatbot

# Install dependencies
npm install

# Configure API key
echo "ANTHROPIC_API_KEY=your_key_here" > .env

# Start dev server
npm run dev
```

## 📁 Project Structure

```
ai-chatbot/
├── pages/                    # Nextify file-based routes
│   └── api/
│       ├── chat.ts           # POST /api/chat
│       ├── chat/stream.ts    # POST /api/chat/stream (SSE)
│       ├── title.ts          # POST /api/title
│       └── health.ts         # GET  /api/health
├── src/
│   ├── components/
│   │   ├── Sidebar.tsx       # Conversation list, search, pin
│   │   ├── ChatWindow.tsx    # Main chat area + suggestions
│   │   ├── MessageBubble.tsx # Markdown, code highlight, copy
│   │   └── ChatInput.tsx     # Model selector, send/stop
│   ├── context/
│   │   └── ChatContext.tsx   # Global state (useReducer)
│   ├── lib/
│   │   ├── api.ts            # Streaming API client
│   │   └── constants.ts      # Models, system prompts
│   ├── types/index.ts
│   └── styles/globals.css
├── nextify.config.ts         # defineConfig from nextify-monorepo
├── package.json
└── tsconfig.json
```

## 🔌 API Routes (Nextify)

| Method | Endpoint          | Description                   |
|--------|-------------------|-------------------------------|
| POST   | /api/chat         | Send message (non-streaming)  |
| POST   | /api/chat/stream  | Send message (SSE streaming)  |
| POST   | /api/title        | Auto-generate chat title      |
| GET    | /api/health       | Health check                  |

## ✨ Features

- ⚡ Real-time streaming via SSE
- 💬 Multiple conversations with sidebar
- 📌 Pin & rename conversations
- 🔍 Search conversations
- 🤖 3 Claude models (Sonnet, Opus, Haiku)
- 📋 Syntax highlighting for 20+ languages
- ⎘ Copy code/message buttons
- 🧠 Auto-generates conversation title
- ⚙️ Custom system prompts
- ⌨️ Configurable Enter-to-send

## ⚙️ Configuration

```ts
// nextify.config.ts
import { defineConfig } from 'nextify-monorepo'

export default defineConfig({
  port: 3000,
  api: { prefix: '/api', cors: true },
  build: { outDir: 'dist', sourcemap: true, minify: true },
})
```

## 🔑 Required Secrets (GitHub)

| Secret                | Description                            |
|-----------------------|----------------------------------------|
| `ANTHROPIC_API_KEY`   | Your Anthropic API key                 |
| `VERCEL_TOKEN`        | For Vercel deployment                  |
| `SLACK_WEBHOOK_URL`   | For deploy notifications (optional)   |

## 🛠 Scripts

```bash
npm run dev          # vite dev (reads nextify.config.ts)
npm run build        # tsc + vite build
npm run start        # vite preview
npm run type-check   # TypeScript check
npm run lint         # ESLint
npm run test         # Jest unit tests
npm run test:coverage # Jest with coverage report
npm run test:e2e     # Playwright E2E tests
npm run test:all     # Jest + Playwright
```

---

## ⚡ Why Nextify.js?

Nextify.js is the backbone of this project. Here is why it matters.

### 1. 🏗️ Structure and Organization

Nextify introduced a clear and professional project convention. Without it, this would be just a generic React app. With it, there is an explicit separation of responsibilities:

```
pages/             ← page routes (Nextify convention)
pages/api/         ← backend routes (Nextify convention)
src/               ← React logic and components
nextify.config.ts  ← single source of truth for all config
```

This structure mirrors the well-established Next.js pattern, making the project immediately recognizable to any developer.

### 2. 📂 File-Based Routing

Nextify brings **automatic routing by file structure**. Every file inside `pages/` becomes a route with zero configuration:

```
pages/index.tsx           →  GET  /
pages/api/chat.ts         →  POST /api/chat
pages/api/chat/stream.ts  →  POST /api/chat/stream
pages/api/title.ts        →  POST /api/title
```

Without Nextify, you would need to manually configure `react-router-dom` for pages and a separate Express/Fastify server for APIs — running two processes with different ports and manual CORS setup.

### 3. 🔧 Single Source of Truth

The `nextify.config.ts` with `defineConfig` from `nextify-monorepo` centralizes **all project configuration** in one place. The `vite.config.ts` only reads from it:

```ts
// nextify.config.ts — edit only here
export default defineConfig({
  port: 3000,                          // server port
  api: { prefix: '/api', cors: true }, // API route settings
  build: { outDir: 'dist', minify: true },
  vite: {
    resolve: { alias: { '@': '/src' } }, // path aliases
  },
})
```

Any change to port, aliases, CORS, or build output is made in **one file** — following the Single Source of Truth principle.

### 4. 🔌 Native API Routes (Full-Stack in One Project)

The most critical feature for this chatbot is the **native API Routes**. Nextify allows backend endpoints to live inside the frontend project — no separate server needed:

```ts
// pages/api/chat/stream.ts → POST /api/chat/stream
export default async function handler(req: Request) {
  // streams Claude API response directly to the client via SSE
  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream' },
  })
}
```

| Without Nextify | With Nextify |
|---|---|
| Separate Node.js server (Express/Fastify) | Everything in one project |
| Two `npm run` processes | Single `npm run dev` |
| Manual CORS configuration | Automatic via `api.cors: true` |
| Different ports for front and back | Single port 3000 |

### 5. 📦 Monorepo Ready

`nextify-monorepo` prepares the project to **scale** without a rewrite. If you need to add an admin panel or a landing page in the future:

```
apps/
├── chatbot/    ← current project
├── admin/      ← new app
└── landing/    ← new app
packages/
└── shared/     ← code shared across all apps
```

All apps share the same base configuration via `defineConfig`.

### 6. 🧪 Impact on Testing

The file-based routing directly shaped how tests were written. Because routes are real files, Playwright can test **real API endpoints** without any mocking:

```ts
// tests/e2e/api.spec.ts
test('GET /api/health returns ok: true', async ({ request }) => {
  const res = await request.get('/api/health')
  expect(res.ok()).toBeTruthy()
})
```

And Jest unit tests treat API handlers as **pure functions**:

```ts
// tests/unit/api/routes.test.ts
const { default: handler } = await import('../../pages/api/chat')
const res = await handler(makeRequest('POST', { messages: [...] }))
expect(res.status).toBe(200)
```

### Summary

| Without Nextify | With Nextify |
|---|---|
| React + separate Express server | Single full-stack project |
| Manual router with react-router | Automatic file-based routing |
| Two processes to run | `npm run dev` does everything |
| Config spread across multiple files | `nextify.config.ts` centralizes all |
| Hard to scale | Monorepo-ready from day one |
| Manual CORS setup | Automatic via config |

> Nextify turned what would be a simple React app with a backend bolted on the side into a **cohesive, scalable, full-stack project with a professional structure** — the glue that unifies the frontend, backend, and configuration into a single development experience.