import { useEffect } from 'react'
import type { Match } from '../../lib/types'
import { scoreStyle } from '../../lib/score'
import { deadlineChip } from '../../lib/deadline'
import Highlight from './Highlight'

/** Break a (possibly run-on) description into readable paragraphs. */
function toParagraphs(text: string): string[] {
  const blocks = text.split(/\n+/).map((b) => b.trim()).filter(Boolean)
  const out: string[] = []
  for (const block of blocks) {
    if (block.length <= 480) {
      out.push(block)
      continue
    }
    const sentences = block.split(/(?<=[.!?])\s+/)
    for (let i = 0; i < sentences.length; i += 3) {
      out.push(sentences.slice(i, i + 3).join(' '))
    }
  }
  return out
}

/** Popup modal with the full, detailed grant summary. Close on ×, backdrop, or Esc. */
export default function GrantModal({ match, onClose }: { match: Match; onClose: () => void }) {
  const { grant, score, why, verify, matchedTerms } = match
  const due = deadlineChip(grant.deadlineLabel)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-lg border border-line bg-surface p-5 shadow-md [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xl font-extrabold leading-tight tracking-tight">
              <Highlight text={grant.title} terms={matchedTerms} />
            </div>
            <div className="mt-1 text-sm font-medium text-muted">{grant.funder}</div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 flex-none items-center justify-center rounded-md text-muted hover:bg-block hover:text-ink"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className={`rounded-md px-2.5 py-1 text-[13px] font-bold ${scoreStyle(score)}`}>{score}% fit</span>
          {grant.amountLabel ? (
            <span className="rounded-md bg-block px-2.5 py-1 text-[13px] font-bold text-ink">{grant.amountLabel}</span>
          ) : null}
          {due ? (
            <span className={`rounded-md px-2.5 py-1 text-[13px] font-bold ${due.cls}`}>{due.text}</span>
          ) : grant.deadlineLabel ? (
            <span className="rounded-md bg-amberbg px-2.5 py-1 text-[13px] font-bold text-ambertx">{grant.deadlineLabel}</span>
          ) : null}
          {grant.geo ? (
            <span className="rounded-md bg-block px-2.5 py-1 text-[13px] font-bold text-muted">{grant.geo}</span>
          ) : null}
          <span className="rounded-md bg-block px-2.5 py-1 text-[13px] font-bold text-muted">{grant.source}</span>
          <span
            className={`rounded-md px-2.5 py-1 text-[13px] font-bold ${
              grant.type === 'open_call' ? 'bg-soft text-brand-press' : 'bg-block text-muted'
            }`}
          >
            {grant.type === 'open_call' ? 'Open call' : 'Past award'}
          </span>
        </div>

        {matchedTerms.length ? (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[12px] font-semibold text-muted">Matched</span>
            {matchedTerms.map((t) => (
              <span key={t} className="rounded-md bg-soft px-2 py-0.5 text-[12px] font-semibold text-brand-press">
                {t}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-5 rounded-md bg-soft p-4">
          <div className="text-[12px] font-extrabold uppercase tracking-wider text-brand-press">Why it fits</div>
          <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink">
            <b className="font-bold">{why.lead}</b> {why.rest}
          </p>
        </div>

        <div className="mt-3 rounded-md bg-[#F1F4F2] p-4">
          <div className="text-[12px] font-extrabold uppercase tracking-wider text-muted">What to verify</div>
          <p className="mt-1.5 text-[14px] leading-relaxed text-[#5F6E66]">{verify}</p>
        </div>

        <div className="mt-5">
          <div className="text-[12px] font-extrabold uppercase tracking-wider text-muted">Summary</div>
          {grant.description ? (
            <div className="mt-2 space-y-3">
              {toParagraphs(grant.description).map((p, i) => (
                <p key={i} className="text-[14.5px] leading-7 text-ink">
                  {p}
                </p>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-[14px] leading-relaxed text-muted">
              This source doesn't expose a full description — open the official page for complete details, eligibility
              and deadlines.
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {grant.url ? (
            <a
              href={grant.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-md bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-press"
            >
              Open official page →
            </a>
          ) : null}
          <button
            onClick={onClose}
            className="rounded-md border-[1.5px] border-line px-5 py-2.5 text-sm font-bold text-ink hover:border-brand"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
