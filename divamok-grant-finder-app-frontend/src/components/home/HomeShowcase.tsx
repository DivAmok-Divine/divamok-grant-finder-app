import { Link } from 'react-router-dom'

// Crafted, flat SVG artwork (no gradients) so the homepage has real imagery
// without external photo assets. Swap for photography later if desired.

function HeroArt() {
  return (
    <svg viewBox="0 0 400 300" className="h-auto w-full" role="img" aria-label="Finding a matching grant">
      <rect x="40" y="40" width="220" height="220" rx="16" fill="#ECFDF5" />
      {/* document */}
      <rect x="78" y="72" width="150" height="170" rx="10" fill="#FFFFFF" stroke="#D8EFE4" strokeWidth="2" />
      <rect x="98" y="98" width="92" height="10" rx="5" fill="#059669" />
      <rect x="98" y="120" width="110" height="7" rx="3.5" fill="#CBD5D0" />
      <rect x="98" y="135" width="84" height="7" rx="3.5" fill="#CBD5D0" />
      <rect x="98" y="150" width="100" height="7" rx="3.5" fill="#CBD5D0" />
      {/* bar chart */}
      <rect x="98" y="186" width="16" height="34" rx="3" fill="#A7E0C6" />
      <rect x="122" y="172" width="16" height="48" rx="3" fill="#5FC79B" />
      <rect x="146" y="158" width="16" height="62" rx="3" fill="#059669" />
      {/* magnifier */}
      <circle cx="250" cy="200" r="46" fill="#FFFFFF" stroke="#059669" strokeWidth="8" />
      <line x1="286" y1="236" x2="320" y2="270" stroke="#059669" strokeWidth="12" strokeLinecap="round" />
      <path d="M232 200l13 13 24-26" fill="none" stroke="#059669" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      {/* coins */}
      <circle cx="320" cy="96" r="26" fill="#FBF1D9" stroke="#E8A23A" strokeWidth="3" />
      <text x="320" y="104" textAnchor="middle" fontSize="24" fontWeight="800" fill="#B7791F">$</text>
    </svg>
  )
}

const VALUES: { title: string; body: string; icon: JSX.Element }[] = [
  {
    title: 'Live, free data',
    body: 'Pulled fresh from Grants.gov, the EU, NSF & World Bank every time you sign in — no paywall.',
    icon: (
      <path d="M12 3a9 9 0 1 0 9 9h-2a7 7 0 1 1-7-7V3z M12 3v4l3-2-3-2z" fill="#059669" />
    ),
  },
  {
    title: 'Eligibility-aware',
    body: 'Filters by country, recipient type and open deadlines — then ranks what you can actually win.',
    icon: (
      <path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5l8-3z M8.5 11.5l2.5 2.5 4.5-5"
        fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    title: 'Every match explained',
    body: 'A plain-language reason for each grant plus exactly what to verify before you apply.',
    icon: (
      <path d="M4 5h16v11H8l-4 4V5z M8 9h8 M8 12h5" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    title: 'Global reach',
    body: 'US, UK, EU and global development funding — with worldwide coverage growing.',
    icon: (
      <g fill="none" stroke="#059669" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18 M12 3c3 3 3 15 0 18 M12 3c-3 3-3 15 0 18" strokeLinecap="round" />
      </g>
    ),
  },
]

const AUDIENCES: { title: string; body: string; art: JSX.Element }[] = [
  {
    title: 'Startups & small business',
    body: 'R&D and innovation grants — SBIR/STTR, EU calls and more.',
    art: (
      <path d="M32 10c8 4 12 12 12 22 0 4-2 8-4 10l-8 4-8-4c-2-2-4-6-4-10 0-10 4-18 12-22z M32 26a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M24 44l-4 8 8-3 M40 44l4 8-8-3"
        fill="#ECFDF5" stroke="#059669" strokeWidth="2.5" strokeLinejoin="round" />
    ),
  },
  {
    title: 'Nonprofits & NGOs',
    body: 'Project, operating and capacity grants for mission-driven work.',
    art: (
      <path d="M32 48C20 40 14 33 14 25a9 9 0 0 1 18-3 9 9 0 0 1 18 3c0 8-6 15-18 23z"
        fill="#ECFDF5" stroke="#059669" strokeWidth="2.5" strokeLinejoin="round" />
    ),
  },
  {
    title: 'Individuals',
    body: 'Fellowships, research and scholarships for people, not just orgs.',
    art: (
      <g fill="#ECFDF5" stroke="#059669" strokeWidth="2.5">
        <circle cx="32" cy="22" r="9" />
        <path d="M16 50c0-9 7-15 16-15s16 6 16 15" fill="#ECFDF5" strokeLinecap="round" />
      </g>
    ),
  },
]

export default function HomeShowcase() {
  return (
    <div className="mt-12 flex flex-col gap-12">
      {/* hero band */}
      <section className="grid grid-cols-1 items-center gap-6 rounded-lg border border-line bg-surface p-8 shadow-sm md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Funding, <span className="text-brand">matched to you</span>.
          </h2>
          <p className="mt-3 max-w-[46ch] text-[15px] leading-relaxed text-muted">
            Tell Grants.DivAmok about your work once. We scan thousands of live opportunities, rank the ones
            you're eligible for, and explain why each fits — so you stop scrolling portals and start
            applying.
          </p>
          <Link
            to="/find"
            className="mt-6 inline-flex items-center gap-2.5 rounded-md bg-brand px-6 py-3.5 text-base font-bold text-white shadow-[0_5px_16px_rgba(5,150,105,0.26)] hover:bg-brand-press"
          >
            Find my grants <span className="text-lg">→</span>
          </Link>
        </div>
        <div className="mx-auto w-full max-w-sm">
          <HeroArt />
        </div>
      </section>

      {/* value props */}
      <section>
        <h2 className="text-xl font-extrabold tracking-tight">Why Grants.DivAmok</h2>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v) => (
            <div key={v.title} className="relative flex min-h-[200px] flex-col overflow-hidden rounded-lg border border-line bg-surface p-6 shadow-sm">
              <div className="absolute right-1 -top-3 opacity-10 pointer-events-none">
                <svg viewBox="0 0 24 24" className="h-24 w-24">
                  {v.icon}
                </svg>
              </div>
              <div className="relative z-10 mt-auto">
                <div className="text-base font-extrabold tracking-tight">{v.title}</div>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">{v.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* audiences */}
      <section>
        <h2 className="text-xl font-extrabold tracking-tight">Who it's for</h2>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {AUDIENCES.map((a) => (
            <Link
              key={a.title}
              to="/find"
              className="group relative overflow-hidden rounded-lg border border-line bg-surface p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="pointer-events-none absolute -right-5 -top-5 opacity-10">
                <svg viewBox="0 0 64 64" className="h-32 w-32">
                  {a.art}
                </svg>
              </div>
              <div className="relative z-10">
                <div className="text-base font-extrabold tracking-tight">{a.title}</div>
                <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{a.body}</p>
                <span className="mt-3 inline-block text-sm font-bold text-brand-press group-hover:underline">
                  Explore →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
