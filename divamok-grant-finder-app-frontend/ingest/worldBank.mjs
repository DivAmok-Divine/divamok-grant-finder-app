// World Bank Projects — free, no auth. Global development finance (strong Africa
// coverage). These are funded operations, not open calls applicants apply to —
// tagged type 'award' (funder intelligence) and geo 'Global'.
const ENDPOINT = 'https://search.worldbank.org/api/v2/projects?format=json&rows=80'

export async function fetchWorldBank() {
  try {
    const res = await fetch(ENDPOINT, { headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const projects = json?.projects ?? {}
    return Object.values(projects).map((p) => ({
      id: `wb-${p.id}`,
      title: p.project_name || 'World Bank project',
      funder: p.regionname ? `World Bank · ${p.regionname}` : 'World Bank',
      source: 'World Bank',
      amountLabel: p.totalamt && p.totalamt !== '0' ? `$${p.totalamt}` : '',
      deadlineLabel: '',
      type: 'award',
      geo: 'Global',
      url: p.url || `https://projects.worldbank.org/en/projects-operations/project-detail/${p.id}`,
    }))
  } catch (e) {
    console.warn(`  ! World Bank failed: ${e.message}`)
    return []
  }
}
