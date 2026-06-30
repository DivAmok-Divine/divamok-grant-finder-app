import type { Match, Profile } from './types'

const TOP_N = 40
const TIMEOUT_MS = 20_000

type Ranked = { id: string; relevance: number; reason: string }

function tierFor(score: number): Match['tier'] {
  return score >= 85 ? 'high' : score >= 62 ? 'mid' : 'low'
}

/**
 * AI re-rank layer that sits on top of the free lexical engine.
 *   - Sends only the top-N lexical candidates to the server-side /api/ai-rank
 *     endpoint (Gemini), which re-orders them by true intent and writes a
 *     grounded reason for each — a cheap, free-tier-friendly retrieve→rerank.
 *   - BLENDS the AI relevance with the lexical score (AI-weighted) so the
 *     ranking *improves* the lexical one instead of throwing it away.
 *   - On ANY failure (no endpoint in a static deploy, no key, timeout, bad
 *     JSON) it returns null and the caller keeps the lexical order. Purely
 *     additive — it can only ever help, never break the existing results.
 */
export async function aiRerank(profile: Profile, lexical: Match[]): Promise<Match[] | null> {
  const head = lexical.slice(0, TOP_N)
  if (head.length === 0) return null
  const tail = lexical.slice(TOP_N)

  const candidates = head.map((m) => ({
    id: m.grant.id,
    title: m.grant.title,
    funder: m.grant.funder,
    snippet: (m.grant.description ?? '').replace(/\s+/g, ' ').trim().slice(0, 220),
  }))

  let ranked: Ranked[]
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
    const res = await fetch('/api/ai-rank', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile, candidates }),
      signal: ctrl.signal,
    }).finally(() => clearTimeout(timer))
    if (!res.ok) return null
    const data = await res.json()
    ranked = Array.isArray(data?.ranked) ? data.ranked : []
  } catch {
    return null
  }
  if (ranked.length === 0) return null

  const byId = new Map(head.map((m) => [m.grant.id, m]))
  const out: Match[] = []
  for (const r of ranked) {
    const m = byId.get(r.id)
    if (!m || typeof r.relevance !== 'number') continue
    byId.delete(r.id)
    const ai = Math.max(0, Math.min(100, Math.round(r.relevance)))
    // AI-weighted blend: keeps lexical evidence but lets intent reshape the order
    const score = Math.round(0.45 * m.score + 0.55 * ai)
    out.push({
      ...m,
      score,
      tier: tierFor(score),
      ai: { relevance: ai, reason: String(r.reason ?? '').trim() },
    })
  }
  // any candidate the model omitted — keep it (lexical), so nothing ever vanishes
  for (const m of head) if (byId.has(m.grant.id)) out.push(m)

  // re-sort the AI-vetted block by blended score, then append the lexical tail
  out.sort((a, b) => b.score - a.score)
  return [...out, ...tail]
}
