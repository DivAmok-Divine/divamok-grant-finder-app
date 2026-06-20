import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSaved } from '../../lib/saved'

/** Header dropdown: a bookmark + "My Saved Grants" that opens a quick list. */
export default function SavedMenu() {
  const { items } = useSaved()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const preview = items.slice(0, 6)

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-ink/80 transition-colors hover:bg-block hover:text-ink ${
          open ? 'bg-block text-ink' : ''
        }`}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-4-7 4V5z" />
        </svg>
        <span className="hidden sm:inline">My Saved Grants</span>
        {items.length ? (
          <span className="rounded-md bg-soft px-1.5 py-0.5 text-[11px] font-bold text-brand-press">{items.length}</span>
        ) : null}
        <svg
          className={`h-4 w-4 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-[min(20rem,calc(100vw-5rem))] origin-top-right rounded-md border border-line bg-canvas p-1.5 shadow-xl shadow-black/5 ring-1 ring-black/5">
          <div className="px-3 py-2 text-xs font-medium text-muted">Saved grants ({items.length})</div>
          <div className="my-1 h-px w-full bg-line" />

          {preview.length === 0 ? (
            <div className="px-3 py-4 text-sm text-muted">
              Nothing saved yet — hit <b className="text-ink">Save</b> on a match.
            </div>
          ) : (
            <ul className="max-h-72 overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {preview.map((m) => (
                <li key={m.grant.id}>
                  <a
                    href={m.grant.url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-3 py-2 hover:bg-block"
                  >
                    <div className="truncate text-sm font-semibold text-ink">{m.grant.title}</div>
                    <div className="truncate text-xs text-muted">{m.grant.funder}</div>
                  </a>
                </li>
              ))}
            </ul>
          )}

          <div className="my-1 h-px w-full bg-line" />
          <Link
            to="/saved"
            onClick={() => setOpen(false)}
            className="block rounded-md px-3 py-2 text-sm font-bold text-brand-press hover:bg-block"
          >
            View all saved →
          </Link>
        </div>
      )}
    </div>
  )
}
