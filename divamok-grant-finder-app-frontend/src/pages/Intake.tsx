import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { Profile, RecipientType } from '../lib/types'
import { matchGrants } from '../lib/match'
import { aiRerank } from '../lib/aiRank'
import { useStore } from '../lib/store'
import SearchSelect from '../ui/SearchSelect'
import Dropdown from '../ui/Dropdown'
import MultiSelect from '../ui/MultiSelect'
import { COUNTRIES } from '../lib/countries'
import { SECTORS } from '../lib/sectors'
import Layout from '../ui/Layout'

const AUD: { key: RecipientType; label: string; note: string }[] = [
  { key: 'startup', label: 'Startup', note: '' },
  {
    key: 'nonprofit',
    label: 'Nonprofit',
    note: 'In the full app this swaps to mission, programs & 501(c) status. Startup is wired up here.',
  },
  {
    key: 'individual',
    label: 'Individual',
    note: 'In the full app this swaps to discipline, portfolio & fellowship history. Startup is wired up here.',
  },
]
const STAGES = ['Idea', 'Pre-seed', 'Seed', 'Growth']
const COUNTRY_OPTIONS = COUNTRIES.map((c) => ({ value: c.name, label: c.name, flag: c.flag }))

const inputCls =
  'w-full rounded-md border-[1.5px] border-line bg-canvas px-4 py-3 text-[15.5px] text-ink outline-none placeholder:text-[#A9B4AE] focus:border-brand focus:bg-surface'

// The intake form is a draft that should survive navigating to /matches and
// back (and a refresh). We persist it to sessionStorage rather than local
// component state, which resets on unmount.
type Draft = {
  audience: RecipientType
  company: string
  country: string
  stage: string
  sectors: string[]
  pitch: string
  funding: string
  team: string
}
const DRAFT_KEY = 'divamok:intake-draft'
const DEFAULT_DRAFT: Draft = {
  audience: 'startup',
  company: '',
  country: '',
  stage: 'Idea',
  sectors: [],
  pitch: '',
  funding: '$100k – $500k',
  team: '2 – 10',
}
function loadDraft(): Draft {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    return raw ? { ...DEFAULT_DRAFT, ...JSON.parse(raw) } : DEFAULT_DRAFT
  } catch {
    return DEFAULT_DRAFT
  }
}

export default function Intake() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setRun, setResults, setAiState, grants } = useStore()

  const [draft] = useState(loadDraft) // read persisted draft once, on mount
  const [audience, setAudience] = useState<RecipientType>(draft.audience)
  const [company, setCompany] = useState(draft.company)
  const [country, setCountry] = useState(draft.country)
  const [stage, setStage] = useState(draft.stage)
  const [sectors, setSectors] = useState<string[]>(draft.sectors)
  const [pitch, setPitch] = useState(draft.pitch)
  const [funding, setFunding] = useState(draft.funding)
  const [team, setTeam] = useState(draft.team)
  const [matching, setMatching] = useState(false)

  const note = AUD.find((a) => a.key === audience)?.note ?? ''

  // a topic clicked on the home charts arrives here and pre-fills the pitch
  useEffect(() => {
    const t = (location.state as { topic?: string } | null)?.topic
    if (t) setPitch(t)
  }, [location.state])

  // persist every change so the form survives navigating away and back
  useEffect(() => {
    const d: Draft = { audience, company, country, stage, sectors, pitch, funding, team }
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(d))
    } catch {
      /* storage unavailable — non-fatal */
    }
  }, [audience, company, country, stage, sectors, pitch, funding, team])

  function run() {
    setMatching(true)
    const profile: Profile = {
      audience,
      company: company.trim() || 'your company',
      country,
      stage,
      sectors,
      pitch,
      funding,
      team,
    }
    // Show the lexical matches immediately, then let the AI re-rank refine them
    // in the background. The AI call is fire-and-forget: if it returns null
    // (no endpoint/key, timeout, error) the lexical order simply stays.
    const lexical = matchGrants(profile, grants)
    setRun(profile, lexical)
    setAiState('ranking')
    navigate('/matches')
    aiRerank(profile, lexical)
      .then((ranked) => {
        if (ranked) {
          setResults(ranked)
          setAiState('done')
        } else {
          setAiState('error')
        }
      })
      .catch(() => setAiState('error'))
  }

  return (
    <Layout as="main" className="pt-4 pb-12">
      <span className="inline-flex items-center gap-2 rounded-md bg-soft px-3 py-1.5 text-[13px] font-bold text-brand-press">
        <span className="h-[7px] w-[7px] rounded-[2px] bg-brand" /> Built for founders
      </span>
      <h1 className="mt-5 max-w-[16ch] text-[2.5rem] font-extrabold leading-[1.04] tracking-tight sm:text-[3.4rem]">
        Find the grants you're <span className="text-brand">actually eligible</span> for.
      </h1>
      <p className="mt-4 max-w-[48ch] text-lg font-medium text-muted">
        Tell us about your company once. We match you against live US &amp; EU funding — and show you
        exactly why each one fits.
      </p>

      <div className="mt-8 rounded-lg border border-line bg-surface p-8 shadow-sm">
        <div className="inline-flex gap-1 rounded-md bg-block p-1">
          {AUD.map((a) => (
            <button
              key={a.key}
              onClick={() => setAudience(a.key)}
              className={`rounded-md px-5 py-2 text-sm font-bold ${
                audience === a.key ? 'bg-surface text-ink shadow-sm' : 'text-muted'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
        <div className="mt-3 min-h-[18px] text-[13.5px] text-muted">{note}</div>

        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <Field label="Company name">
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Acme Robotics"
              className={inputCls}
            />
          </Field>
          <Field label="Country of incorporation">
            <SearchSelect value={country} onChange={setCountry} options={COUNTRY_OPTIONS} placeholder="Select a country" />
          </Field>

          <Field label="Stage" full>
            <div className="flex flex-wrap gap-2">
              {STAGES.map((s) => (
                <Chip key={s} active={stage === s} onClick={() => setStage(s)}>
                  {s}
                </Chip>
              ))}
            </div>
          </Field>

          <Field label="Sector" full>
            <MultiSelect
              value={sectors}
              onChange={setSectors}
              options={SECTORS}
              placeholder="Search sectors — e.g. pharmaceuticals, clean energy, robotics…"
            />
          </Field>

          <Field label="What are you building?" full>
            <textarea
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              placeholder="A line or two — what you do and the R&D problem you're solving."
              className={`${inputCls} min-h-[74px] resize-y`}
            />
          </Field>

          <Field label="Funding needed">
            <Dropdown
              value={funding}
              onChange={setFunding}
              options={['Under $100k', '$100k – $500k', '$500k – $2M', '$2M+']}
            />
          </Field>
          <Field label="Team size">
            <Dropdown value={team} onChange={setTeam} options={['Just me', '2 – 10', '11 – 50', '50+']} />
          </Field>
        </div>

        <button
          onClick={run}
          disabled={matching}
          className="mt-7 inline-flex items-center gap-2.5 rounded-md bg-brand px-6 py-3.5 text-base font-bold text-white shadow-[0_5px_16px_rgba(5,150,105,0.26)] hover:bg-brand-press disabled:opacity-70"
        >
          <span>{matching ? 'Matching…' : 'Find my grants'}</span>
          {!matching && <span className="text-lg">→</span>}
        </button>
      </div>
    </Layout>
  )
}

function Field({ label, full, children }: { label: string; full?: boolean; children: ReactNode }) {
  return (
    <div className={`flex flex-col ${full ? 'sm:col-span-2' : ''}`}>
      <label className="mb-2 text-[13px] font-bold">{label}</label>
      {children}
    </div>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border-[1.5px] px-4 py-2 text-sm font-semibold ${
        active ? 'border-brand bg-brand text-white' : 'border-line bg-surface text-ink hover:border-brand'
      }`}
    >
      {children}
    </button>
  )
}

