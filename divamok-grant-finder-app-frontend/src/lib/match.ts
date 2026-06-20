import type { Geo, Grant, Match, Profile } from './types'
import { EU_COUNTRIES } from './countries'
import { expandConcepts } from './concepts'

function profileGeo(country: string): Geo {
  if (country === 'United States') return 'US'
  if (country === 'United Kingdom') return 'UK'
  if (EU_COUNTRIES.has(country)) return 'EU'
  return 'OTHER'
}

function geoLabel(geo?: Geo): string {
  if (geo === 'US') return 'US'
  if (geo === 'EU') return 'EU / associated-country'
  if (geo === 'UK') return 'UK'
  if (geo === 'Global') return 'any region'
  return String(geo ?? 'local')
}

const STOP = new Set([
  'the', 'and', 'for', 'with', 'your', 'that', 'this', 'from', 'are', 'our', 'you',
  'what', 'will', 'into', 'than', 'other', 'all', 'who', 'how', 'why', 'about', 'its',
])

function words(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w))
}

/** Light stemmer — "funding/funded/funds" and "pharmacies/pharmacy" collapse. */
function stem(w: string): string {
  if (w.length <= 4) return w
  let s = w
  s = s.replace(/ies$/, 'y')
  s = s.replace(/(ses|xes|zes|ches|shes)$/, (m) => m.slice(0, -2))
  s = s.replace(/s$/, '')
  s = s.replace(/(ing|edly|ed|ations|ation|ments|ment|ities|ity|ally|al)$/, '')
  return s.length >= 3 ? s : w
}

function freq(tokens: string[]): Map<string, number> {
  const m = new Map<string, number>()
  for (const t of tokens) m.set(t, (m.get(t) ?? 0) + 1)
  return m
}

function sectorMatches(sector: string, all: Set<string>): boolean {
  return words(sector).map(stem).some((t) => all.has(t))
}

/**
 * Free lexical matching engine — BM25F over stemmed tokens, with match evidence.
 *   - Query = sectors + pitch, synonym-expanded then stemmed.
 *   - BM25F: rare words weigh more, term frequency saturates, length-normalized,
 *     TITLE hits 3×, funder 1.5×, description 1×.
 *   - Captures the real words that matched (matchedTerms) for chips/highlighting.
 *   - Pure & deterministic (no time/randomness) — the deadline countdown is
 *     computed at display time, not here.
 */
export function matchGrants(profile: Profile, grants: Grant[]): Match[] {
  const pGeo = profileGeo(profile.country)
  const hasIntent = profile.sectors.length > 0 || profile.pitch.trim().length >= 3

  const qTokens = new Set<string>()
  for (const term of expandConcepts(`${profile.sectors.join(' ')} ${profile.pitch}`)) {
    for (const w of words(term)) qTokens.add(stem(w))
  }

  const N = grants.length || 1
  const idx = grants.map((g) => {
    const tw = words(g.title)
    const fw = words(g.funder)
    const dw = words(g.description ?? '')
    const t = tw.map(stem)
    const f = fw.map(stem)
    const d = dw.map(stem)
    const orig = new Map<string, string>()
    tw.forEach((w, k) => { if (!orig.has(t[k])) orig.set(t[k], w) })
    fw.forEach((w, k) => { if (!orig.has(f[k])) orig.set(f[k], w) })
    dw.forEach((w, k) => { if (!orig.has(d[k])) orig.set(d[k], w) })
    return { tF: freq(t), fF: freq(f), dF: freq(d), dl: t.length + f.length + d.length, all: new Set([...t, ...f, ...d]), orig }
  })
  const avgdl = idx.reduce((s, x) => s + x.dl, 0) / N || 1

  const idf = new Map<string, number>()
  for (const qt of qTokens) {
    let df = 0
    for (const x of idx) if (x.all.has(qt)) df++
    idf.set(qt, Math.log(1 + (N - df + 0.5) / (df + 0.5)))
  }

  const k1 = 1.2
  const b = 0.6

  const rows = grants.map((g, i) => {
    const x = idx[i]
    let raw = 0
    const hitStems: { s: string; idf: number }[] = []
    for (const qt of qTokens) {
      const tf = (x.tF.get(qt) ?? 0) * 3 + (x.fF.get(qt) ?? 0) * 1.5 + (x.dF.get(qt) ?? 0)
      if (tf > 0) {
        const w = idf.get(qt) ?? 0
        hitStems.push({ s: qt, idf: w })
        const denom = tf + k1 * (1 - b + (b * x.dl) / avgdl)
        raw += w * ((tf * (k1 + 1)) / denom)
      }
    }
    // most distinctive matched words, as real (readable) terms — the "receipts"
    const seen = new Set<string>()
    const matchedTerms: string[] = []
    for (const h of hitStems.sort((a, c) => c.idf - a.idf)) {
      const word = x.orig.get(h.s)
      if (word && !seen.has(word)) {
        seen.add(word)
        matchedTerms.push(word)
      }
      if (matchedTerms.length >= 4) break
    }
    const geoEligible = g.geo === pGeo || g.geo === 'Global'
    const matchedSector = profile.sectors.find((s) => sectorMatches(s, x.all))
    return { grant: g, raw, matched: hitStems.length, matchedTerms, geoEligible, geoBlocked: !geoEligible, isAward: g.type === 'award', matchedSector }
  })

  const kept = hasIntent ? rows.filter((r) => r.matched >= 1) : rows

  const matches: Match[] = kept.map((r) => {
    let score = hasIntent ? 40 + 58 * (r.raw / (r.raw + 8)) : 70
    score += r.geoEligible ? 5 : -14
    if (r.isAward) score -= 14
    score = Math.max(6, Math.min(98, Math.round(score)))
    const tier: Match['tier'] = score >= 85 ? 'high' : score >= 62 ? 'mid' : 'low'

    const list = r.matchedTerms.slice(0, 3).join(', ')
    const focus = r.matchedSector ? r.matchedSector.toLowerCase() : r.matchedTerms.slice(0, 2).join(' & ')

    let why: Match['why']
    let verify: string
    if (r.isAward) {
      why = {
        lead: 'Funder intel:',
        rest: `${r.grant.funder} has funded ${list || 'this space'} — shows who backs it, but it's a past award, not an open call.`,
      }
      verify = 'Historical funding, not an open application — use it to spot funders worth approaching.'
    } else if (r.geoBlocked) {
      why = {
        lead: 'On-topic, wrong region:',
        rest: `Picks up ${list || 'your themes'}, but this is ${geoLabel(r.grant.geo)} funding — you'd need a ${geoLabel(r.grant.geo)} entity.`,
      }
      verify = `Geo filter: requires ${geoLabel(r.grant.geo)} incorporation. Shown anyway, ranked lower.`
    } else if (r.matched === 0 && !r.matchedSector) {
      why = { lead: 'In your region:', rest: `Open call from ${r.grant.funder}.` }
      verify = 'Confirm applicant type & eligibility on the official page before you apply.'
    } else {
      why = {
        lead: tier === 'high' ? 'Strong fit:' : r.matched >= 2 ? 'Good fit:' : 'Worth a look:',
        rest: `Open call from ${r.grant.funder} on your ${focus || 'focus'} focus${list ? ` — matched ${list}` : ''}.`,
      }
      verify = 'Confirm applicant type & eligibility on the official page before you apply.'
    }

    return { grant: r.grant, score, tier, geoBlocked: r.geoBlocked, matchedTerms: r.matchedTerms, why, verify }
  })

  return matches.sort((a, b) => b.score - a.score).slice(0, 150)
}
