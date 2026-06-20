import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import HomeInsights from '../components/home/HomeInsights'
import HomeShowcase from '../components/home/HomeShowcase'
import Layout from '../ui/Layout'

export default function Home() {
  const navigate = useNavigate()
  const { profile, results } = useStore()

  const hasResults = !!profile && results.length > 0

  function pickTopic(topic: string) {
    navigate('/find', { state: { topic } })
  }

  return (
    <Layout as="main" className="pt-8 pb-12">
      {hasResults ? (
        <div>
          <p className="text-lg text-muted">You have {results.length} matches ready.</p>
          <Link
            to="/matches"
            className="mt-4 inline-flex rounded-md bg-brand px-5 py-3 font-bold text-white hover:bg-brand-press"
          >
            View your matches →
          </Link>
        </div>
      ) : (
        <div>
          <p className="text-lg text-muted">No matches yet — start with your profile.</p>
          <Link
            to="/find"
            className="mt-4 inline-flex rounded-md bg-brand px-5 py-3 font-bold text-white hover:bg-brand-press"
          >
            Start your profile →
          </Link>
        </div>
      )}

      <HomeShowcase />
      <HomeInsights onPickTopic={pickTopic} />

      <footer className="mt-12 border-t border-line pt-6 text-[13px] leading-relaxed text-muted">
        Grants.DivAmok surfaces and explains matches from public funding data — always confirm eligibility,
        award amounts, and deadlines on the official opportunity page before you apply.
      </footer>
    </Layout>
  )
}
