import { fetchGrantsGov } from './grantsGov.mjs'
import { fetchEuSedia } from './euSedia.mjs'
import { fetchSbir } from './sbir.mjs'
import { fetchWorldBank } from './worldBank.mjs'
import { fetchNsf } from './nsf.mjs'

const CAP = { 'Grants.gov': 180, 'EU SEDIA': 100, SBIR: 40, 'World Bank': 60, NSF: 60 }
const cap = (arr, n) => arr.slice(0, n)

const norm = (s = '') =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

// Cross-source dedupe: collapse the same opportunity by normalized title+funder,
// so a grant appearing in two feeds shows once (without merging distinct grants
// that happen to share a generic title across different funders).
function dedupe(grants) {
  const seen = new Set()
  const out = []
  for (const g of grants) {
    if (!g.title) continue
    const key = `${norm(g.title)}|${norm(g.funder)}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(g)
  }
  return out
}

/** Pull all sources, normalize, cap per source, dedupe. Shared by the CLI
 *  ingest (writes a file) and the dev /api/grants endpoint (serves live). */
export async function collectGrants() {
  const [gg, eu, sbir, wb, nsf] = await Promise.all([
    fetchGrantsGov(),
    fetchEuSedia(),
    fetchSbir(),
    fetchWorldBank(),
    fetchNsf(),
  ])
  const grants = dedupe([
    ...cap(gg, CAP['Grants.gov']),
    ...cap(eu, CAP['EU SEDIA']),
    ...cap(sbir, CAP.SBIR),
    ...cap(wb, CAP['World Bank']),
    ...cap(nsf, CAP.NSF),
  ])
  return {
    generatedAt: new Date().toISOString(),
    sources: {
      'Grants.gov': gg.length,
      'EU SEDIA': eu.length,
      SBIR: sbir.length,
      'World Bank': wb.length,
      NSF: nsf.length,
    },
    count: grants.length,
    grants,
  }
}
