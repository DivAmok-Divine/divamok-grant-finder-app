import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// @ts-ignore — untyped Node ESM ingestion module, run server-side in dev only
import { collectGrants } from './ingest/collect.mjs'

// Serves /api/grants in dev by running live ingestion server-side (no CORS, no
// Supabase). The frontend calls this on login to refresh. In a static deploy
// this route is absent and the app falls back to the bundled snapshot.
function devGrantsApi(): Plugin {
  return {
    name: 'dev-grants-api',
    configureServer(server) {
      server.middlewares.use('/api/grants', async (_req, res) => {
        try {
          const data = await collectGrants()
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(data))
        } catch (e) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: String(e) }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), devGrantsApi()],
  server: {
    host: true,
    proxy: {
      '/api/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/api/saved': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
