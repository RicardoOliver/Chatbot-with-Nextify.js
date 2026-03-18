/**
 * vite.config.ts
 *
 * As configurações abaixo espelham o nextify.config.ts.
 * O nextify.config.ts serve como documentação da intenção do projeto
 * e é usado pelo CI/CD. O Vite usa este arquivo para rodar localmente.
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@':           resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@hooks':      resolve(__dirname, 'src/hooks'),
      '@context':    resolve(__dirname, 'src/context'),
      '@lib':        resolve(__dirname, 'src/lib'),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor:   ['react', 'react-dom'],
          markdown: ['react-markdown', 'remark-gfm'],
        },
      },
    },
  },
})
