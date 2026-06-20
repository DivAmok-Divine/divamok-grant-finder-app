import { Link, useNavigate } from 'react-router-dom'
import { useSaved } from '../lib/saved'
import MatchCard from '../components/matches/MatchCard'
import Layout from '../ui/Layout'

export default function Saved() {
  const { items, loading } = useSaved()
  const navigate = useNavigate()

  return (
    <Layout as="main" className="pt-8 pb-12">
      <button
        onClick={() => navigate(-1)}
        className="mb-5 inline-flex items-center gap-2 rounded-md bg-soft px-4 py-2 text-sm font-bold text-brand-press"
      >
        ← Back
      </button>
      <h1 className="text-3xl font-extrabold tracking-tight">Saved grants</h1>
      <p className="mt-1.5 text-[14.5px] text-muted">
        {items.length} saved to your account — synced wherever you sign in.
      </p>

      {loading && items.length === 0 ? (
        <p className="mt-8 text-muted">Loading your saved grants…</p>
      ) : items.length === 0 ? (
        <div className="mt-8 rounded-lg border border-line bg-surface p-8 text-muted">
          Nothing saved yet — hit <b className="text-ink">Save</b> on any match and it'll show up here.
          <div className="mt-4">
            <Link
              to="/find"
              className="inline-flex rounded-md bg-brand px-5 py-3 font-bold text-white hover:bg-brand-press"
            >
              Find grants →
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8">
          {items.map((m) => (
            <MatchCard key={m.grant.id} match={m} />
          ))}
        </div>
      )}
    </Layout>
  )
}
