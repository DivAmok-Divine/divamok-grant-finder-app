import { useEffect, useRef, useState } from 'react'

/** Custom dropdown (no native <select>): click to open, click an option to pick.
 *  Matches the emerald / rounded-md design; for short option lists. */
export default function Dropdown({
  value,
  onChange,
  options,
  placeholder = 'Select…',
}: {
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-md border-[1.5px] border-line bg-canvas px-4 py-3 text-left text-[15.5px] text-ink outline-none focus:border-brand"
      >
        <span className={value ? '' : 'text-[#A9B4AE]'}>{value || placeholder}</span>
        <svg
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="M1 1l5 5 5-5" stroke="#6B7A72" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      </button>

      {open ? (
        <div className="absolute bottom-full z-20 mb-1 w-full overflow-hidden rounded-md border border-line bg-surface shadow-md">
          <ul className="max-h-60 overflow-auto py-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {options.map((o) => (
              <li key={o}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(o)
                    setOpen(false)
                  }}
                  className={`block w-full px-4 py-2.5 text-left text-[14.5px] hover:bg-soft ${
                    o === value ? 'font-bold text-brand-press' : 'text-ink'
                  }`}
                >
                  {o}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
