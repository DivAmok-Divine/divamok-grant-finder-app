import { defineConfig, loadEnv } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
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

// Reads and JSON-parses the body of a raw Node request (with a hard size cap).
function readJsonBody(req: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (c: any) => {
      raw += c
      if (raw.length > 2_000_000) {
        req.destroy()
        reject(new Error('body too large'))
      }
    })
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {})
      } catch (e) {
        reject(e)
      }
    })
    req.on('error', reject)
  })
}

// Server-side Gemini re-rank. The lexical engine pre-filters to a few dozen
// candidates; Gemini re-orders them by true intent and writes a grounded reason
// for each. The API key stays here (Node/dev server) and never reaches the
// browser bundle. Structured JSON output + thinking disabled = fast and cheap.
async function geminiRerank(apiKey: string, model: string, profile: any, candidates: any[]) {
  const lines = candidates
    .map((c) => `[${c.id}] ${c.title} — ${c.funder}${c.snippet ? ` :: ${c.snippet}` : ''}`)
    .join('\n')

  const prompt = `You are an expert grant-matching analyst.

APPLICANT
- Type: ${profile.audience}
- Company: ${profile.company}
- Country: ${profile.country || 'unspecified'}
- Stage: ${profile.stage}
- Sectors: ${(profile.sectors || []).join(', ') || 'unspecified'}
- What they do: ${profile.pitch || 'unspecified'}

CANDIDATE GRANTS (pre-filtered by keyword — some may be weak or off-topic):
${lines}

TASK
Re-rank these by TRUE relevance to what the applicant actually does — read the
intent, not just shared keywords. For each grant return:
- id: exactly as written in [brackets]
- relevance: integer 0-100 (how well it fits THIS applicant; score weak,
  keyword-only matches low so they sink)
- reason: ONE short, specific sentence, grounded ONLY in the grant text and the
  applicant profile above. Never invent facts.
Return every candidate, ordered best-first.`

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 18_000)
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: ctrl.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            // disable "thinking" — keeps 2.5-flash fast and free-tier friendly
            thinkingConfig: { thinkingBudget: 0 },
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                ranked: {
                  type: 'ARRAY',
                  items: {
                    type: 'OBJECT',
                    properties: {
                      id: { type: 'STRING' },
                      relevance: { type: 'INTEGER' },
                      reason: { type: 'STRING' },
                    },
                    required: ['id', 'relevance', 'reason'],
                  },
                },
              },
              required: ['ranked'],
            },
          },
        }),
      },
    )
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`gemini ${res.status}: ${body.slice(0, 200)}`)
    }
    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    return JSON.parse(text)
  } finally {
    clearTimeout(timer)
  }
}

// Serves /api/ai-rank in dev — the server-side AI re-rank. Absent in a static
// deploy (the client falls back to the lexical order). 503s cleanly if no key.
function aiRankApi(apiKey: string, model: string): Plugin {
  return {
    name: 'dev-ai-rank-api',
    configureServer(server) {
      server.middlewares.use('/api/ai-rank', async (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        if (req.method !== 'POST') {
          res.statusCode = 405
          return res.end(JSON.stringify({ error: 'POST only' }))
        }
        if (!apiKey) {
          res.statusCode = 503
          return res.end(JSON.stringify({ error: 'AI not configured (no GEMINI_API_KEY)' }))
        }
        try {
          const { profile, candidates } = await readJsonBody(req)
          if (!profile || !Array.isArray(candidates) || candidates.length === 0) {
            res.statusCode = 400
            return res.end(JSON.stringify({ error: 'profile + candidates[] required' }))
          }
          const out = await geminiRerank(apiKey, model, profile, candidates.slice(0, 50))
          res.end(JSON.stringify(out))
        } catch (e) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: String(e) }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // Gemini creds live in the repo-root .env (one level up from the frontend),
  // loaded server-side only — never exposed to the browser via import.meta.env.
  const here = path.dirname(fileURLToPath(import.meta.url))
  const env = loadEnv(mode, path.resolve(here, '..'), '')
  const GEMINI_API_KEY = env.GEMINI_API_KEY || ''
  const GEMINI_MODEL = env.GEMINI_MODEL || 'gemini-2.5-flash'

  return {
    plugins: [react(), tailwindcss(), devGrantsApi(), aiRankApi(GEMINI_API_KEY, GEMINI_MODEL)],
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
  }
})
