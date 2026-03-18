/**
 * dev-server.ts
 *
 * Servidor de desenvolvimento unificado:
 * - Express processa as rotas de pages/api/  (padrão Nextify)
 * - Vite dev server serve o frontend com HMR
 *
 * Rode com: npm run dev
 */

import express from 'express'
import { createServer as createViteServer } from 'vite'
import { createRequire } from 'module'
import { pathToFileURL } from 'url'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import * as dotenv from 'dotenv'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require   = createRequire(import.meta.url)

// ── Lê a porta do nextify.config.ts ──────────────────────────────────
let PORT = 3000
try {
  const cfgPath = path.join(__dirname, 'nextify.config.ts')
  if (fs.existsSync(cfgPath)) {
    // extrai port via regex simples para evitar importar o nextify-monorepo
    const src  = fs.readFileSync(cfgPath, 'utf-8')
    const match = src.match(/port\s*:\s*(\d+)/)
    if (match) PORT = parseInt(match[1], 10)
  }
} catch { /* usa default 3000 */ }

// ── Converte Web API Request → Express request e volta ────────────────
async function webHandlerToExpress(
  handlerPath: string,
  req: express.Request,
  res: express.Response,
) {
  try {
    // Importa o handler dinamicamente (suporte a TypeScript via Vite)
    const mod = await import(pathToFileURL(handlerPath).href + `?t=${Date.now()}`)
    const handler = mod.default

    // Monta um Web API Request a partir do Express request
    const url  = `http://localhost:${PORT}${req.originalUrl}`
    const body = ['GET', 'HEAD'].includes(req.method)
      ? undefined
      : JSON.stringify(req.body)

    const webReq = new Request(url, {
      method:  req.method,
      headers: req.headers as HeadersInit,
      body,
    })

    // Chama o handler e converte o Web API Response de volta
    const webRes: Response = await handler(webReq)

    res.status(webRes.status)
    webRes.headers.forEach((value, key) => res.setHeader(key, value))

    const contentType = webRes.headers.get('content-type') ?? ''

    if (contentType.includes('text/event-stream')) {
      // SSE streaming
      res.setHeader('Content-Type',  'text/event-stream')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection',    'keep-alive')
      res.flushHeaders()

      const reader = webRes.body!.getReader()
      const decoder = new TextDecoder()

      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read()
          if (done) { res.end(); break }
          res.write(decoder.decode(value, { stream: true }))
        }
      }
      req.on('close', () => reader.cancel())
      await pump()
    } else {
      const text = await webRes.text()
      res.send(text)
    }
  } catch (err) {
    console.error(`[API] Error in ${handlerPath}:`, err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// ── Descobre todos os arquivos em pages/api/ ──────────────────────────
function discoverApiRoutes(dir: string, base = '/api'): Array<{ route: string; file: string }> {
  const routes: Array<{ route: string; file: string }> = []
  if (!fs.existsSync(dir)) return routes

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      routes.push(...discoverApiRoutes(fullPath, `${base}/${entry.name}`))
    } else if (entry.name.match(/\.(ts|js)$/)) {
      const routeName = entry.name.replace(/\.(ts|js)$/, '')
      const route = routeName === 'index' ? base : `${base}/${routeName}`
      routes.push({ route, file: fullPath })
    }
  }
  return routes
}

async function startServer() {
  const app = express()
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  // ── CORS ─────────────────────────────────────────────────────────
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin',  '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    if (req.method === 'OPTIONS') { res.sendStatus(204); return }
    next()
  })

  // ── Registra rotas de pages/api/ automaticamente ──────────────────
  const apiDir    = path.join(__dirname, 'pages', 'api')
  const apiRoutes = discoverApiRoutes(apiDir)

  console.log('\n[Nextify] API Routes:')
  for (const { route, file } of apiRoutes) {
    app.all(route, (req, res) => webHandlerToExpress(file, req, res))
    console.log(`  → ${route.padEnd(25)} (${path.relative(__dirname, file)})`)
  }

  // ── Vite dev server (frontend + HMR) ─────────────────────────────
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  })
  app.use(vite.middlewares)

  // ── Start ────────────────────────────────────────────────────────
  app.listen(PORT, () => {
    console.log(`\n[Nextify] Dev server running:`)
    console.log(`  → Local:   http://localhost:${PORT}`)
    console.log(`  → API:     http://localhost:${PORT}/api\n`)
  })
}

startServer().catch(console.error)
