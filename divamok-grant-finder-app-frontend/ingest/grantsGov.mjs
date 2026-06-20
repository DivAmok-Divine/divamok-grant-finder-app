import { decodeEntities, fmtUS, stripHtml, mapLimit } from './util.mjs'

// Grants.gov Search2 (list) + fetchOpportunity (detail). We run several
// sector-aligned keyword queries, merge (deduped by id), then enrich each with
// its synopsis + eligibility text so the matcher can rank on real content.
const SEARCH = 'https://api.grants.gov/v1/api/search2'
const DETAIL = 'https://api.grants.gov/v1/api/fetchOpportunity'

const KEYWORDS = [
  'energy', 'clean energy', 'climate', 'health', 'biomedical', 'technology',
  'artificial intelligence', 'manufacturing', 'agriculture', 'education',
  'water', 'housing', 'small business', 'research', 'cybersecurity', 'innovation',
]

async function search(keyword) {
  const res = await fetch(SEARCH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rows: 25, keyword, oppStatuses: 'posted|forecasted' }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = await res.json()
  return json?.data?.oppHits ?? []
}

async function detail(id) {
  try {
    const res = await fetch(DETAIL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ opportunityId: Number(id) }),
    })
    if (!res.ok) return ''
    const json = await res.json()
    const syn = json?.data?.synopsis ?? {}
    const text = [syn.synopsisDesc, syn.applicantEligibilityDesc].filter(Boolean).join(' ')
    return stripHtml(text).slice(0, 1200)
  } catch {
    return ''
  }
}

export async function fetchGrantsGov() {
  try {
    const results = await Promise.all(KEYWORDS.map((k) => search(k).catch(() => [])))
    const byId = new Map()
    for (const hits of results) {
      for (const h of hits) if (!byId.has(h.id)) byId.set(h.id, h)
    }
    const hits = [...byId.values()].slice(0, 150)
    return mapLimit(hits, 12, async (h) => ({
      id: `grants-gov-${h.id}`,
      title: decodeEntities(h.title),
      funder: decodeEntities(h.agency) || 'U.S. federal agency',
      source: 'Grants.gov',
      amountLabel: '',
      deadlineLabel: fmtUS(h.closeDate),
      type: 'open_call',
      geo: 'US',
      description: await detail(h.id),
      url: `https://grants.gov/search-results-detail/${h.id}`,
    }))
  } catch (e) {
    console.warn(`  ! Grants.gov failed: ${e.message}`)
    return []
  }
}
