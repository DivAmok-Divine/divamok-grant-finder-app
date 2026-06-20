import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Header from './components/layout/Header'
import Intake from './pages/Intake'
import Matches from './pages/Matches'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Settings from './pages/Settings'
import Saved from './pages/Saved'
import { useAuth } from './lib/auth'
import { useStore } from './lib/store'
import { loadGrants } from './lib/grantsData'

export default function App() {
  const { user } = useAuth()
  const { setGrants, setRefreshing } = useStore()

  // Each time a session begins, pull the freshest grants (live in dev,
  // snapshot fallback otherwise). This is the "refresh on login" behaviour.
  useEffect(() => {
    if (!user) return
    let cancelled = false
    setRefreshing(true)
    loadGrants()
      .then((g) => {
        if (!cancelled) setGrants(g)
      })
      .finally(() => {
        if (!cancelled) setRefreshing(false)
      })
    return () => {
      cancelled = true
    }
  }, [user, setGrants])

  // if (!user) return <Login />

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <div className="min-h-full">
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/find" element={<Intake />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/saved" element={<Saved />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </div>
  )
}
