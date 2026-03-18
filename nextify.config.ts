import { defineConfig } from 'nextify-monorepo'

/**
 * nextify.config.ts — fonte de verdade do projeto.
 * O vite.config.ts lê este arquivo automaticamente.
 * Edite apenas aqui para configurar o projeto.
 */
export default defineConfig({
  // ── Servidor ───────────────────────────────────────────────────────
  port: 3000,

  // ── API Routes ─────────────────────────────────────────────────────
  api: {
    prefix: '/api',
    cors: true,
  },

  // ── Build ──────────────────────────────────────────────────────────
  build: {
    outDir:    'dist',
    sourcemap: true,
    minify:    true,
  },

  // ── Vite (passado direto para o Vite via vite.config.ts) ──────────
  vite: {
    resolve: {
      alias: {
        '@':            '/src',
        '@components':  '/src/components',
        '@hooks':       '/src/hooks',
        '@context':     '/src/context',
        '@lib':         '/src/lib',
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor:   ['react', 'react-dom'],
            markdown: ['react-markdown', 'remark-gfm'],
          },
        },
      },
    },
  },
})
