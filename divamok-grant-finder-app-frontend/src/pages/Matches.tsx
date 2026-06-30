import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import MatchCard from '../components/matches/MatchCard'
import type { Match } from '../lib/types'
import Layout from '../ui/Layout'

type Filter = 'All' | 'Open calls' | 'High fit' | 'No geo blockers'
const FILTERS: Filter[] = ['All', 'Open calls', 'High fit', 'No geo blockers']
const PAGE_SIZE = 12

function passesFilter(m: Match, f: Filter): boolean {
  switch (f) {
    case 'Open calls':
      return m.grant.type === 'open_call'
    case 'High fit':
      return m.tier === 'high'
    case 'No geo blockers':
      return !m.geoBlocked
    default:
      return true
  }
}

export default function Matches() {
  const { profile, results, refreshing, aiState } = useStore()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<Filter>('All')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return results.filter(
      (m) =>
        passesFilter(m, filter) &&
        (!q || m.grant.title.toLowerCase().includes(q) || m.grant.funder.toLowerCase().includes(q)),
    )
  }, [results, filter, query])

  useEffect(() => {
    setPage(1)
  }, [filter, query])

  const hasResults = !!profile && results.length > 0

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, totalPages)
  const startIdx = (current - 1) * PAGE_SIZE
  const pageItems = filtered.slice(startIdx, startIdx + PAGE_SIZE)

  function go(p: number) {
    setPage(p)
    window.scrollTo({ top: 0 })
  }

  function pickTopic(topic: string) {
    navigate('/find', { state: { topic } })
  }

  if (!hasResults) {
    return <Navigate to="/home" replace />
  }

  return (
    <Layout as="main" className="pt-8 pb-12">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <div className="flex flex-col items-start gap-2">
            {refreshing ? (
              <span className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-4 py-2 text-[13px] font-semibold text-ink shadow-sm">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-block border-t-brand" />
                Updating grants…
              </span>
            ) : null}
            <Link
              to="/find"
              className="inline-flex items-center gap-2 rounded-md bg-soft px-4 py-2 text-sm font-bold text-brand-press"
            >
              ← Edit profile
            </Link>
            {aiState === 'ranking' ? (
              <span className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-4 py-2 text-[13px] font-semibold text-brand-press shadow-sm">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-block border-t-brand" />
                Refining matches with AI…
              </span>
            ) : aiState === 'done' ? (
              <span className="inline-flex items-center gap-2 rounded-md border border-line bg-soft px-4 py-2 text-[13px] font-bold text-brand-press shadow-sm">
                <span aria-hidden>✦</span> AI-ranked by relevance
              </span>
            ) : null}
          </div>

          <div className="mb-1 mt-5">
            <h2 className="text-3xl font-extrabold tracking-tight">
              {results.length} matches for {profile?.company}
            </h2>
            <div className="mt-1.5 text-[14.5px] text-muted">
              Eligibility-ranked · hard filters applied, then matched on meaning
            </div>
          </div>
        </div>

        {profile ? (
          <div className="hidden w-[400px] shrink-0 rounded-lg border border-line bg-surface p-4 shadow-sm md:block lg:w-[540px]">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-extrabold text-muted">Your profile</span>
              <Link to="/find" className="text-[12px] font-bold text-brand-press hover:underline">
                Edit
              </Link>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
              <Facet label="Company" value={profile.company} />
              <Facet label="Country" value={profile.country || '—'} />
              <Facet label="Stage" value={profile.stage} />
              <Facet label="Funding" value={profile.funding} />
              <Facet label="Team size" value={profile.team} />
            </div>
            {profile.sectors.length ? (
              <div className="mt-3 border-t border-line pt-3">
                <div className="text-[13px] font-extrabold text-muted">Sectors</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {profile.sectors.map((s) => (
                    <span key={s} className="rounded-md bg-soft px-2 py-0.5 text-[12px] font-semibold text-brand-press">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search these matches…"
        className="mt-5 w-full rounded-md border-[1.5px] border-line bg-surface px-4 py-3 text-[15px] text-ink outline-none placeholder:text-[#A9B4AE] focus:border-brand"
      />

      <div className="my-5 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-md border-[1.5px] px-3.5 py-2 text-[13.5px] font-semibold ${
              filter === f ? 'border-ink bg-ink text-white' : 'border-line bg-surface text-ink hover:border-brand'
            }`}
          >
            {f}
          </button>
        ))}
        <span className="ml-1 text-[13.5px] text-muted">{filtered.length} shown</span>
        {totalPages > 1 ? (
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => go(current - 1)}
              disabled={current <= 1}
              aria-label="Previous page"
              className="rounded-md border-[1.5px] border-line bg-surface px-2.5 py-1.5 text-sm font-semibold text-ink hover:border-brand disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line"
            >
              ←
            </button>
            <span className="text-[13px] font-semibold text-muted">
              {current}/{totalPages}
            </span>
            <button
              onClick={() => go(current + 1)}
              disabled={current >= totalPages}
              aria-label="Next page"
              className="rounded-md border-[1.5px] border-line bg-surface px-2.5 py-1.5 text-sm font-semibold text-ink hover:border-brand disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line"
            >
              →
            </button>
          </div>
        ) : null}
      </div>

      <div>
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-line bg-surface p-8 text-muted">
            Nothing under this filter — try “All”.
          </div>
        ) : (
          pageItems.map((m) => <MatchCard key={m.grant.id} match={m} />)
        )}
      </div>

      {totalPages > 1 ? (
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => go(current - 1)}
            disabled={current <= 1}
            className="rounded-md border-[1.5px] border-line bg-surface px-4 py-2 text-sm font-semibold text-ink hover:border-brand disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line"
          >
            ← Prev
          </button>
          <span className="text-[13.5px] text-muted">
            {startIdx + 1}–{Math.min(startIdx + PAGE_SIZE, filtered.length)} of {filtered.length} · page{' '}
            {current}/{totalPages}
          </span>
          <button
            onClick={() => go(current + 1)}
            disabled={current >= totalPages}
            className="rounded-md border-[1.5px] border-line bg-surface px-4 py-2 text-sm font-semibold text-ink hover:border-brand disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line"
          >
            Next →
          </button>
        </div>
      ) : null}

      <div className="mt-12 border-t border-line" />

      <footer className="mt-12 border-t border-line pt-6 text-[13px] leading-relaxed text-muted">
        Grants.DivAmok surfaces and explains matches from public funding data — always confirm eligibility,
        award amounts, and deadlines on the official opportunity page before you apply.
      </footer>
    </Layout>
  )
}

function Facet({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[13px] font-medium text-muted">{label}</div>
      <div className="truncate text-[15px] font-bold text-ink">{value}</div>
    </div>
  )
}
