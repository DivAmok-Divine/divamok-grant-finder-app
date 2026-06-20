// NSF Awards — free, no auth. US research awards (historical/funded), merged over
// several keyword queries. Tagged type 'award' (funder intelligence), geo 'US'.
const BASE = 'https://api.nsf.gov/services/v1/awards.json'
const FIELDS = 'id,title,fundsObligatedAmt,awardeeName,date,agency,abstractText'
const KEYWORDS = ['energy', 'climate', 'health', 'technology', 'manufacturing', 'education']

async function search(keyword) {
  const url = `${BASE}?keyword=${encodeURIComponent(keyword)}&printFields=${FIELDS}&rpp=25`
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = await res.json()
  return json?.response?.award ?? []
}

export async function fetchNsf() {
  try {
    const results = await Promise.all(KEYWORDS.map((k) => search(k).catch(() => [])))
    const byId = new Map()
    for (const arr of results) {
      for (const a of arr) if (a.id && !byId.has(a.id)) byId.set(a.id, a)
    }
    return [...byId.values()].map((a) => ({
      id: `nsf-${a.id}`,
      title: a.title || 'NSF award',
      funder: 'National Science Foundation',
      source: 'NSF',
      amountLabel: a.fundsObligatedAmt ? `$${Number(a.fundsObligatedAmt).toLocaleString('en-US')}` : '',
      deadlineLabel: '',
      type: 'award',
      geo: 'US',
      description: (a.abstractText || '').slice(0, 1200),
      url: `https://www.nsf.gov/awardsearch/showAward?AWD_ID=${a.id}`,
    }))
  } catch (e) {
    console.warn(`  ! NSF failed: ${e.message}`)
    return []
  }
}
