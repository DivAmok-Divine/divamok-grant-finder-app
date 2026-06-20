import { Fragment } from 'react'

/** Highlights the matched terms inside a piece of text (the "show your work"). */
export default function Highlight({ text, terms }: { text: string; terms: string[] }) {
  const cleaned = terms.map((t) => t.trim()).filter((t) => t.length > 2)
  if (cleaned.length === 0) return <>{text}</>

  const escaped = cleaned.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const re = new RegExp(`(${escaped.join('|')})`, 'ig')
  const lower = new Set(cleaned.map((t) => t.toLowerCase()))
  const parts = text.split(re)

  return (
    <>
      {parts.map((p, i) =>
        lower.has(p.toLowerCase()) ? (
          <mark key={i} className="rounded bg-soft px-0.5 font-semibold text-brand-press">
            {p}
          </mark>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  )
}
