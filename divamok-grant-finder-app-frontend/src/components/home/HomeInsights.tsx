import { useStore } from '../../lib/store'
import type { Grant } from '../../lib/types'

const TOPICS: { label: string; terms: string[] }[] = [
  { label: 'Health & bio', terms: ['health', 'medic', 'pharm', 'clinical', 'patient', 'disease', 'biomed', 'therap'] },
  { label: 'Energy', terms: ['energy', 'solar', 'renewable', 'grid', 'battery', 'power'] },
  { label: 'Climate & environment', terms: ['climate', 'carbon', 'emission', 'environment', 'sustainab', 'conservation'] },
  { label: 'Education', terms: ['education', 'student', 'school', 'stem', 'learning', 'curriculum'] },
  { label: 'AI & software', terms: ['artificial intelligence', 'machine learning', 'software', 'data', 'algorithm', 'computing'] },
  { label: 'Agriculture & food', terms: ['agricultur', 'farm', 'crop', 'food', 'soil'] },
]

const text = (g: Grant) => `${g.title} ${g.funder} ${g.description ?? ''}`.toLowerCase()

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-md border border-line bg-surface p-5 shadow-sm">
      <div className="text-3xl font-extrabold tracking-tight text-ink">{value}</div>
      <div className="mt-1 text-[13px] font-semibold text-muted">{label}</div>
    </div>
  )
}

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[13.5px]">
        <span className="font-semibold text-ink">{label}</span>
        <span className="font-bold text-muted">{value}</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-md bg-block">
        <div className="h-full rounded-md bg-brand" style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  )
}

const STEPS = [
  { n: '1', title: 'Tell us about you', body: 'One short profile — who you are, where, and what you do.' },
  { n: '2', title: 'We scan live funding', body: 'Across Grants.gov, EU, NSF, World Bank & more — refreshed when you sign in.' },
  { n: '3', title: 'Get ranked matches', body: 'Eligibility-aware, color-scored, each with a reason and what to verify.' },
]

export default function HomeInsights({ onPickTopic }: { onPickTopic?: (topic: string) => void }) {
  const { grants } = useStore()

  const total = grants.length
  const open = grants.filter((g) => g.type === 'open_call').length
  const sources = new Set(grants.map((g) => g.source)).size
  const regions = new Set(grants.map((g) => g.geo || '—')).size

  const sourceCounts: Record<string, number> = {}
  for (const g of grants) sourceCounts[g.source] = (sourceCounts[g.source] ?? 0) + 1
  const bySource = Object.entries(sourceCounts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
  const srcMax = Math.max(1, ...bySource.map((d) => d.value))

  const byTopic = TOPICS.map((t) => ({
    label: t.label,
    value: grants.filter((g) => t.terms.some((term) => text(g).includes(term))).length,
  })).sort((a, b) => b.value - a.value)
  const topMax = Math.max(1, ...byTopic.map((d) => d.value))

  return (
    <div className="mt-16 flex flex-col gap-12">
      {/* live coverage */}
      <section>
        <h2 className="text-xl font-extrabold tracking-tight">Live coverage</h2>
        <p className="mt-1 text-[14.5px] text-muted">
          Pulled fresh when you sign in — {total} grants across {sources} funders and {regions} regions.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat value={total} label="Live grants" />
          <Stat value={open} label="Open calls" />
          <Stat value={sources} label="Data sources" />
          <Stat value={regions} label="Regions" />
        </div>
      </section>

      {/* charts */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-line bg-surface p-6 shadow-sm">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted">Grants by source</h3>
          <div className="mt-4 flex flex-col gap-3">
            {bySource.map((d) => (
              <Bar key={d.label} label={d.label} value={d.value} max={srcMax} />
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-line bg-surface p-6 shadow-sm">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted">Browse by topic</h3>
          <p className="mt-1 text-[13px] text-muted">Tap a topic to search it instantly.</p>
          <div className="mt-4 flex flex-col gap-3">
            {byTopic.map((d) => (
              <button
                key={d.label}
                type="button"
                onClick={() => onPickTopic?.(d.label)}
                className="group text-left"
              >
                <div className="mb-1 flex items-center justify-between text-[13.5px]">
                  <span className="font-semibold text-ink group-hover:text-brand-press">{d.label}</span>
                  <span className="font-bold text-muted">{d.value}</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-md bg-block">
                  <div className="h-full rounded-md bg-brand opacity-80 group-hover:opacity-100" style={{ width: `${(d.value / topMax) * 100}%` }} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* how it works */}
      <section>
        <h2 className="text-xl font-extrabold tracking-tight">How it works</h2>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="relative overflow-hidden rounded-lg border border-line bg-surface p-6 shadow-sm">
              <span className="pointer-events-none absolute -right-2 -top-6 select-none text-[110px] font-extrabold leading-none text-brand opacity-[0.07]">
                {s.n}
              </span>
              <div className="relative z-10">
                <div className="text-base font-extrabold tracking-tight">{s.title}</div>
                <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
