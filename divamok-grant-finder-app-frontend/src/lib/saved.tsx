import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Match } from './types'
import { useAuth } from './auth'

interface SavedCtx {
  items: Match[]
  isSaved: (grantId: string) => boolean
  toggle: (match: Match) => void
  loading: boolean
}

const Ctx = createContext<SavedCtx | null>(null)

export function SavedProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  const [items, setItems] = useState<Match[]>([])
  const [loading, setLoading] = useState(false)

  // Load the user's saved grants whenever the session token changes.
  useEffect(() => {
    if (!token) {
      setItems([])
      return
    }
    let cancelled = false
    setLoading(true)
    fetch('/api/saved', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Match[]) => {
        if (!cancelled) setItems(Array.isArray(data) ? data : [])
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [token])

  const isSaved = useCallback((grantId: string) => items.some((m) => m.grant.id === grantId), [items])

  const toggle = useCallback(
    (match: Match) => {
      if (!token) return
      const id = match.grant.id
      const headers = { Authorization: `Bearer ${token}` }
      if (items.some((m) => m.grant.id === id)) {
        setItems((prev) => prev.filter((m) => m.grant.id !== id)) // optimistic
        fetch(`/api/saved/${encodeURIComponent(id)}`, { method: 'DELETE', headers }).catch(() => {})
      } else {
        setItems((prev) => [match, ...prev]) // optimistic
        fetch('/api/saved', {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ match }),
        }).catch(() => {})
      }
    },
    [token, items],
  )

  return <Ctx.Provider value={{ items, isSaved, toggle, loading }}>{children}</Ctx.Provider>
}

export function useSaved() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useSaved must be used within SavedProvider')
  return ctx
}
