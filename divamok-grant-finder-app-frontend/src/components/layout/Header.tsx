import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import Layout from '../../ui/Layout'
import SavedMenu from './SavedMenu'

export default function Header() {
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-canvas/95 backdrop-blur">
      <Layout className="flex h-[74px] items-center justify-between">
        <Link to="/" className="flex items-center gap-3 text-xl font-extrabold tracking-tight text-ink">
          <span className="relative inline-block h-[30px] w-[30px] rounded-md bg-brand">
            <span className="absolute bottom-1.5 right-1.5 h-2 w-2 rounded-[2px] bg-white" />
          </span>
          Grants.DivAmok
        </Link>
        <nav className="flex items-center gap-4">
          <SavedMenu />

          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-block ${
                  isMenuOpen ? 'bg-block' : ''
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand text-white">
                  {user.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline">{user}</span>
                <svg className={`h-4 w-4 text-muted transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-1 w-56 origin-top-right rounded-md border border-line bg-canvas p-1.5 shadow-xl shadow-black/5 ring-1 ring-black/5">
                  <div className="mb-1 flex flex-col px-3 py-2">
                    <span className="text-xs font-medium text-muted">Signed in as</span>
                    <span className="truncate text-sm font-bold text-ink">{user}</span>
                  </div>
                  
                  <div className="my-1 h-px w-full bg-line" />
                  
                  <Link
                    to="/settings"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-block hover:text-brand"
                  >
                    <svg className="h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Account Settings
                  </Link>
                  
                  <div className="my-1 h-px w-full bg-line" />
                  
                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      logout()
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[#D13415] transition-colors hover:bg-[#D13415]/10"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-black">
              Log in
            </Link>
          )}
        </nav>
      </Layout>
    </header>
  )
}
