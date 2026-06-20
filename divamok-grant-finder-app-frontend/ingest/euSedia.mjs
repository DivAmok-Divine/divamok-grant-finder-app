import { decodeEntities, fmtEpoch } from './util.mjs'

// EU Funding & Tenders — free, no auth. Bulk reference file is cleaner to
// ingest than the SEDIA search API: fundingData.GrantTenderObj[].
const ENDPOINT =
  'https://ec.europa.eu/info/funding-tenders/opportunities/data/referenceData/grantsTenders.json'

const OPEN = new Set(['Open', 'Forthcoming'])

export async function fetchEuSedia() {
  try {
    const res = await fetch(ENDPOINT, { headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const objs = json?.fundingData?.GrantTenderObj ?? []
    return objs
      .filter((o) => OPEN.has(o?.status?.abbreviation))
      .map((o) => {
        const deadlines = Array.isArray(o.deadlineDatesLong) ? o.deadlineDatesLong.filter(Boolean) : []
        const deadline = deadlines.length ? Math.max(...deadlines) : null
        return {
          id: `eu-${o.identifier || o.ccm2Id}`,
          title: decodeEntities(o.title),
          funder: decodeEntities(o.frameworkProgramme?.description) || 'European Commission',
          source: 'EU SEDIA',
          amountLabel: '',
          deadlineLabel: deadline ? fmtEpoch(deadline) : 'Rolling',
          type: 'open_call',
          geo: 'EU',
          url: `https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/topic-details/${o.identifier}`,
        }
      })
  } catch (e) {
    console.warn(`  ! EU SEDIA failed: ${e.message}`)
    return []
  }
}
