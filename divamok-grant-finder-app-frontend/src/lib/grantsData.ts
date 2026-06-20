import type { Grant } from './types'
import bundled from '../data/grants.generated.json'

/** Snapshot shipped with the build — the fallback when no live endpoint exists. */
export const bundledGrants = bundled.grants as unknown as Grant[]

/**
 * Fetch the freshest grants. In local dev the Vite middleware serves /api/grants
 * by running ingestion live (no Supabase). If that endpoint isn't available
 * (e.g. a pure static deploy before the cron/serverless function is added),
 * we fall back to the bundled snapshot so the app always works.
 */
export async function loadGrants(): Promise<Grant[]> {
  try {
    const res = await fetch('/api/grants', { headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const grants = (data?.grants ?? data) as Grant[]
    return Array.isArray(grants) && grants.length ? grants : bundledGrants
  } catch {
    return bundledGrants
  }
}
