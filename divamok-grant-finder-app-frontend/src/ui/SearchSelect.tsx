import { useEffect, useRef, useState } from 'react'

export interface SelectOption {
  value: string
  label: string
  /** optional leading glyph (e.g. an emoji flag) */
  flag?: string
}

/** A searchable dropdown where the field itself is the search input:
 *  click it and type to filter; the list appears below. No second search bar. */
export default function SearchSelect({
  value,
  onChange,
  options,
  placeholder = 'Select…',
}: {
  value: string
  onChange: (v: string) => void
  options: SelectOption[]
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const selected = options.find((o) => o.value === value)
  const q = query.trim().toLowerCase()
  const filtered = (q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options).slice(0, 60)

  function choose(o: SelectOption) {
    onChange(o.value)
    setQuery('')
    setOpen(false)
    inputRef.current?.blur()
  }

  // When open, the field shows what you're typing; when closed, the selection.
  const display = open ? query : selected ? `${selected.flag ? `${selected.flag} ` : ''}${selected.label}` : ''

  return (
    <div className="relative" ref={ref}>
      <div
        className="flex items-center rounded-md border-[1.5px] border-line bg-canvas focus-within:border-brand"
        onClick={() => inputRef.current?.focus()}
      >
        <input
          ref={inputRef}
          value={display}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          placeholder={selected ? `${selected.flag ? `${selected.flag} ` : ''}${selected.label}` : placeholder}
          className="w-full bg-transparent px-4 py-3 text-[15.5px] text-ink outline-none placeholder:text-[#A9B4AE]"
        />
        <svg
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          className={`mr-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="M1 1l5 5 5-5" stroke="#6B7A72" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      </div>

      {open ? (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-line bg-surface shadow-md">
          <ul className="max-h-60 overflow-auto py-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {filtered.length === 0 ? (
              <li className="px-4 py-2 text-[14px] text-muted">No match</li>
            ) : (
              filtered.map((o) => (
                <li key={o.value}>
                  <button
                    type="button"
                    onClick={() => choose(o)}
                    className={`flex w-full items-center gap-2 px-4 py-2 text-left text-[14.5px] hover:bg-soft ${
                      o.value === value ? 'font-bold text-brand-press' : 'text-ink'
                    }`}
                  >
                    {o.flag ? <span>{o.flag}</span> : null}
                    {o.label}
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
