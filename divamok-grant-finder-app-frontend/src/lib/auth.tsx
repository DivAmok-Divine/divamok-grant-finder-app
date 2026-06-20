import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

const KEY = 'divamok.session'
const SESSION_TTL_MS = 60 * 60 * 1000 // 1 hour idle timeout
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']

interface Session {
  username: string
  token: string
  expiresAt: number
}

interface Auth {
  user: string | null
  token: string | null
  timedOut: boolean
  login: (u: string, p: string) => Promise<boolean>
  register: (u: string, p: string) => Promise<boolean>
  changePassword: (o: string, n: string) => Promise<boolean>
  deleteAccount: () => Promise<boolean>
  logout: () => void
}

const Ctx = createContext<Auth | null>(null)

function initAuth(): { session: Session | null; timedOut: boolean } {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const s = JSON.parse(raw) as Session
      if (s && s.token && typeof s.expiresAt === 'number' && s.expiresAt > Date.now()) {
        return { session: s, timedOut: false }
      }
      localStorage.removeItem(KEY)
      return { session: null, timedOut: true }
    }
  } catch {
    localStorage.removeItem(KEY)
  }
  return { session: null, timedOut: false }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [boot] = useState(initAuth)
  const [session, setSession] = useState<Session | null>(boot.session)
  const [timedOut, setTimedOut] = useState<boolean>(boot.timedOut)
  const expiresRef = useRef<number>(session?.expiresAt ?? 0)
  const lastBump = useRef<number>(0)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const endSession = useCallback((byInactivity: boolean) => {
    localStorage.removeItem(KEY)
    if (timer.current) clearTimeout(timer.current)
    setSession(null)
    setTimedOut(byInactivity)
  }, [])

  const logout = useCallback(() => endSession(false), [endSession])

  const setAuthData = useCallback((username: string, token: string) => {
    const expiresAt = Date.now() + SESSION_TTL_MS
    expiresRef.current = expiresAt
    const newSession = { username, token, expiresAt }
    localStorage.setItem(KEY, JSON.stringify(newSession))
    setSession(newSession)
    setTimedOut(false)
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      if (!res.ok) return false
      const data = await res.json()
      setAuthData(data.username, data.token)
      return true
    } catch {
      return false
    }
  }, [setAuthData])

  const register = useCallback(async (username: string, password: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      if (!res.ok) return false
      const data = await res.json()
      setAuthData(data.username, data.token)
      return true
    } catch {
      return false
    }
  }, [setAuthData])

  const changePassword = useCallback(async (oldPassword: string, newPassword: string) => {
    if (!session) return false
    try {
      const res = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      })
      return res.ok
    } catch {
      return false
    }
  }, [session])

  const deleteAccount = useCallback(async () => {
    if (!session) return false
    try {
      const res = await fetch('/api/auth/account', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session.token}` }
      })
      if (res.ok) {
        logout()
        return true
      }
      return false
    } catch {
      return false
    }
  }, [session, logout])

  useEffect(() => {
    if (!session) return
    expiresRef.current = session.expiresAt

    const schedule = () => {
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => endSession(true), Math.max(0, expiresRef.current - Date.now()))
    }

    const bump = () => {
      const now = Date.now()
      if (now >= expiresRef.current) return endSession(true)
      if (now - lastBump.current < 5000) return
      lastBump.current = now
      expiresRef.current = now + SESSION_TTL_MS
      localStorage.setItem(KEY, JSON.stringify({ ...session, expiresAt: expiresRef.current }))
      schedule()
    }

    const onVisible = () => {
      if (document.visibilityState === 'visible' && Date.now() >= expiresRef.current) endSession(true)
    }

    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, bump, { passive: true }))
    document.addEventListener('visibilitychange', onVisible)
    schedule()

    return () => {
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, bump))
      document.removeEventListener('visibilitychange', onVisible)
      if (timer.current) clearTimeout(timer.current)
    }
  }, [session, endSession])

  return (
    <Ctx.Provider value={{ user: session?.username ?? null, token: session?.token ?? null, timedOut, login, logout, register, changePassword, deleteAccount }}>
      {children}
    </Ctx.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
