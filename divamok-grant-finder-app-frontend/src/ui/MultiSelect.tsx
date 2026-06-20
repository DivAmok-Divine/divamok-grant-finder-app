import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'

/** Type-to-search multi-select: filter as you type, click to add, chips to remove. */
export default function MultiSelect({
  value,
  onChange,
  options,
  placeholder = 'Search…',
  max,
}: {
  value: string[]
  onChange: (v: string[]) => void
  options: string[]
  placeholder?: string
  max?: number
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const q = query.trim().toLowerCase()
  const selected = new Set(value)
  const filtered = options.filter((o) => !selected.has(o) && (!q || o.toLowerCase().includes(q))).slice(0, 50)
  const atMax = max !== undefined && value.length >= max

  function add(o: string) {
    if (atMax) return
    onChange([...value, o])
    setQuery('')
    inputRef.current?.focus()
  }
  function remove(o: string) {
    onChange(value.filter((v) => v !== o))
  }
  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !query && value.length) remove(value[value.length - 1])
    if (e.key === 'Enter' && filtered.length) {
      e.preventDefault()
      add(filtered[0])
    }
  }

  return (
    <div className="relative" ref={ref}>
      <div
        className="flex flex-wrap items-center gap-1.5 rounded-md border-[1.5px] border-line bg-canvas px-2 py-2 focus-within:border-brand"
        onClick={() => {
          setOpen(true)
          inputRef.current?.focus()
        }}
      >
        {value.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 rounded-md bg-brand px-2 py-1 text-[13px] font-semibold text-white">
            {v}
            <button
              type="button"
              aria-label={`Remove ${v}`}
              onClick={(e) => {
                e.stopPropagation()
                remove(v)
              }}
              className="text-base leading-none text-white/80 hover:text-white"
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={atMax ? 'Max reached' : value.length ? 'Add more…' : placeholder}
          disabled={atMax}
          className="min-w-[140px] flex-1 bg-transparent px-1 py-1 text-[15px] text-ink outline-none placeholder:text-[#A9B4AE]"
        />
      </div>

      {open && !atMax ? (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-line bg-surface shadow-md">
          <ul className="max-h-60 overflow-auto py-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {filtered.length === 0 ? (
              <li className="px-4 py-2 text-[14px] text-muted">{q ? 'No match' : 'Start typing to search…'}</li>
            ) : (
              filtered.map((o) => (
                <li key={o}>
                  <button
                    type="button"
                    onClick={() => add(o)}
                    className="block w-full px-4 py-2 text-left text-[14.5px] text-ink hover:bg-soft"
                  >
                    {o}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
