import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { Grant, Match, Profile } from './types'
import { bundledGrants } from './grantsData'

interface Store {
  /** the grant dataset matched against — starts as the bundled snapshot,
   *  replaced with a fresh live pull on login */
  grants: Grant[]
  setGrants: (grants: Grant[]) => void
  /** true while the live grant refresh is running */
  refreshing: boolean
  setRefreshing: (v: boolean) => void
  profile: Profile | null
  results: Match[]
  setRun: (profile: Profile, results: Match[]) => void
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [grants, setGrants] = useState<Grant[]>(bundledGrants)
  const [refreshing, setRefreshing] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [results, setResults] = useState<Match[]>([])
  return (
    <Ctx.Provider
      value={{
        grants,
        setGrants,
        refreshing,
        setRefreshing,
        profile,
        results,
        setRun: (p, r) => {
          setProfile(p)
          setResults(r)
        },
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

export function useStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
