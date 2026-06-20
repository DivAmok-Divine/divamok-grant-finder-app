import { useState } from 'react'
import type { Match } from '../../lib/types'
import { scoreStyle } from '../../lib/score'
import { deadlineChip } from '../../lib/deadline'
import { useSaved } from '../../lib/saved'
import Highlight from './Highlight'
import GrantModal from './GrantModal'

export default function MatchCard({ match }: { match: Match }) {
  const [open, setOpen] = useState(false)
  const { grant, score, why, verify, matchedTerms } = match
  const { isSaved, toggle } = useSaved()
  const saved = isSaved(grant.id)
  const due = deadlineChip(grant.deadlineLabel)

  return (
    <>
      <div className="mb-4 grid grid-cols-[auto_1fr] items-start gap-x-3 gap-y-3 rounded-lg border border-line bg-surface p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:grid-cols-[auto_1fr_auto] sm:gap-x-5 sm:gap-y-0 sm:p-6">
        <div className={`flex h-[60px] w-[60px] flex-col items-center justify-center rounded-md ${scoreStyle(score)}`}>
          <span className="text-xl font-extrabold leading-none">{score}</span>
          <span className="mt-0.5 text-[9px] font-bold tracking-wider opacity-80">% FIT</span>
        </div>

        <div className="min-w-0">
          {grant.url ? (
            <a
              href={grant.url}
              target="_blank"
              rel="noreferrer"
              className="text-lg font-extrabold tracking-tight hover:text-brand"
            >
              <Highlight text={grant.title} terms={matchedTerms} />
            </a>
          ) : (
            <span className="text-lg font-extrabold tracking-tight">
              <Highlight text={grant.title} terms={matchedTerms} />
            </span>
          )}
          <div className="mt-0.5 text-sm font-medium text-muted">{grant.funder}</div>

          <div className="mt-3 flex flex-wrap gap-2">
            {grant.amountLabel ? (
              <span className="rounded-md bg-block px-2.5 py-1 text-[13px] font-bold text-ink">{grant.amountLabel}</span>
            ) : null}
            {due ? (
              <span className={`rounded-md px-2.5 py-1 text-[13px] font-bold ${due.cls}`}>{due.text}</span>
            ) : grant.deadlineLabel ? (
              <span className="rounded-md bg-block px-2.5 py-1 text-[13px] font-bold text-muted">{grant.deadlineLabel}</span>
            ) : null}
            {grant.geo ? (
              <span className="rounded-md bg-block px-2.5 py-1 text-[13px] font-bold text-muted">{grant.geo}</span>
            ) : null}
            {grant.type === 'open_call' ? (
              <span className="rounded-md bg-soft px-2.5 py-1 text-[13px] font-bold text-brand-press">Open call</span>
            ) : (
              <span className="rounded-md bg-block px-2.5 py-1 text-[13px] font-bold text-muted">Past award</span>
            )}
          </div>

          {matchedTerms.length ? (
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="text-[12px] font-semibold text-muted">Matched</span>
              {matchedTerms.map((t) => (
                <span key={t} className="rounded-md bg-soft px-2 py-0.5 text-[12px] font-semibold text-brand-press">
                  {t}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-3.5 flex gap-2 text-[14.5px] leading-snug">
            <span className="font-extrabold text-brand">✓</span>
            <span>
              <b className="font-bold">{why.lead}</b> {why.rest}
            </span>
          </div>

          <div className="mt-3 flex gap-2 rounded-md bg-[#F1F4F2] px-3.5 py-3 text-[13.5px] leading-snug text-[#5F6E66]">
            <span className="text-muted">⚑</span>
            <span>{verify}</span>
          </div>
        </div>

        <div className="col-span-2 flex items-stretch gap-2 self-start sm:col-span-1">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Grant details"
            title="Read summary"
            className="inline-flex items-center justify-center rounded-md border-[1.5px] border-line bg-surface px-3 text-muted hover:border-brand hover:text-brand-press"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="9" />
              <line x1="12" y1="11" x2="12" y2="16" />
              <line x1="12" y1="7.5" x2="12" y2="7.5" />
            </svg>
          </button>
          <button
            onClick={() => toggle(match)}
            className={`whitespace-nowrap rounded-md border-[1.5px] px-4 py-2.5 text-[13.5px] font-bold ${
              saved
                ? 'border-[#F1C9C2] bg-[#FCE9E6] text-[#C0392B] hover:bg-[#F7D8D2]'
                : 'border-line bg-surface text-ink hover:border-brand'
            }`}
          >
            {saved ? 'Remove' : 'Save'}
          </button>
        </div>
      </div>

      {open ? <GrantModal match={match} onClose={() => setOpen(false)} /> : null}
    </>
  )
}
