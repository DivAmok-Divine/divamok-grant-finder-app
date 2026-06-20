// SBIR.gov solicitations — free, no auth, but WAF-protected and intermittently
// 403/429. Adapter fails gracefully so ingestion never breaks when it's down.
const ENDPOINT = 'https://api.www.sbir.gov/public/api/solicitations?open=1&rows=50'

export async function fetchSbir() {
  try {
    const res = await fetch(ENDPOINT, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; divamok-grant-ingestion/0.1)',
        Accept: 'application/json',
      },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const arr = await res.json()
    const list = Array.isArray(arr) ? arr : []
    return list.map((s) => ({
      id: `sbir-${s.solicitation_id ?? s.solicitation_number ?? s.solicitation_title}`,
      title: s.solicitation_title || 'SBIR/STTR solicitation',
      funder: s.agency || 'U.S. SBIR/STTR',
      source: 'SBIR',
      amountLabel: '',
      deadlineLabel: s.close_date ? `Closes ${s.close_date}` : 'See solicitation',
      type: 'open_call',
      geo: 'US',
      url: s.solicitation_agency_url || s.sbir_solicitation_link || 'https://www.sbir.gov/solicitations',
    }))
  } catch (e) {
    console.warn(`  ! SBIR failed (often WAF/403 — non-blocking): ${e.message}`)
    return []
  }
}
