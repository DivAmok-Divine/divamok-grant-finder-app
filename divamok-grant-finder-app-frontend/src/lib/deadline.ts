// Deadline intelligence — parses a grant's display label into a live countdown.
// Computed at render time (uses today's date), so it stays OUT of the matcher
// to keep matching deterministic.

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
}

/** Days from today until the deadline in `label` (e.g. "Closes Sep 29, 2029"). */
export function daysUntil(label?: string): number | null {
  if (!label) return null
  let d: Date | null = null
  const named = label.match(/([A-Za-z]{3,})\s+(\d{1,2}),\s*(\d{4})/)
  if (named) {
    const mon = MONTHS[named[1].slice(0, 3).toLowerCase()]
    if (mon === undefined) return null
    d = new Date(Date.UTC(Number(named[3]), mon, Number(named[2])))
  } else {
    const numeric = label.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
    if (numeric) d = new Date(Date.UTC(Number(numeric[3]), Number(numeric[1]) - 1, Number(numeric[2])))
  }
  if (!d || isNaN(d.getTime())) return null
  const now = new Date()
  const todayUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.ceil((d.getTime() - todayUTC) / 86_400_000)
}

/** A countdown chip {text, color classes} with urgency, or null if undatable. */
export function deadlineChip(label?: string): { text: string; cls: string } | null {
  const days = daysUntil(label)
  if (days === null) return null
  if (days < 0) return { text: 'Closed', cls: 'bg-block text-muted' }
  if (days === 0) return { text: 'Closes today', cls: 'bg-[#FCE6E6] text-[#B23B3B]' }
  if (days <= 14) return { text: `Closes in ${days} days`, cls: 'bg-[#FCE6E6] text-[#B23B3B]' }
  if (days <= 45) return { text: `Closes in ${days} days`, cls: 'bg-amberbg text-ambertx' }
  return { text: `Closes in ${days} days`, cls: 'bg-block text-muted' }
}
