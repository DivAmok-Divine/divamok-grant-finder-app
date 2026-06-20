// Shared helpers for the ingestion adapters (plain Node ESM — no build step).

export function decodeEntities(s = '') {
  return String(s)
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;|&rsquo;|&lsquo;/g, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** "09/29/2029" -> "Closes Sep 29, 2029" */
export function fmtUS(mdy) {
  if (!mdy) return ''
  const [m, d, y] = String(mdy).split('/').map(Number)
  if (!m || !d || !y) return ''
  return `Closes ${MONTHS[m - 1]} ${d}, ${y}`
}

/** epoch ms -> "Closes May 11, 2021" */
export function fmtEpoch(ms) {
  if (!ms) return ''
  const dt = new Date(ms)
  return `Closes ${MONTHS[dt.getUTCMonth()]} ${dt.getUTCDate()}, ${dt.getUTCFullYear()}`
}

/** Strip HTML -> plain text, preserving paragraph/line breaks for readability. */
export function stripHtml(s = '') {
  return String(s)
    .replace(/<\s*(br|\/p|\/li|\/h[1-6]|\/tr)\s*\/?>/gi, '\n') // block ends -> newline
    .replace(/<[^>]+>/g, ' ') // drop remaining tags
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;|&rsquo;|&lsquo;/g, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/[ \t\f\v]+/g, ' ') // collapse spaces but keep newlines
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** Run async fn over items with bounded concurrency; preserves order. */
export async function mapLimit(items, limit, fn) {
  const results = new Array(items.length)
  let i = 0
  async function worker() {
    while (i < items.length) {
      const idx = i++
      results[idx] = await fn(items[idx], idx)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return results
}
