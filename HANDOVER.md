# Grants.DivAmok — Handover

> Context doc so a new chat / developer can continue seamlessly. Read this first, then skim the README.

---

## 1. What this is
**Grants.DivAmok** — a free, global grant finder. It aggregates open funding from public sources, normalizes it, and ranks it against a user profile with a transparent, **explainable** matching engine (fit score + matched words + plain-language reason + "what to verify"). Free-first, no API keys needed to run.

- **Repo:** https://github.com/DivAmok-Divine/divamok-grant-finder-app (branch `main`)
- **Audience:** startups-first, but the intake supports nonprofits & individuals too.
- **Status:** Fully working locally — frontend + API + live ingestion + auth + saved grants + responsive mobile. Deployed: **not yet** (runs on `./start.sh`).

## 2. Monorepo layout
```
divamok-grant-finder-app/
├── divamok-grant-finder-app-frontend/   # React + Vite + TS + Tailwind v4
│   ├── src/
│   │   ├── pages/        # Home, Intake (/find), Matches, Saved, Login, Register, Settings
│   │   ├── components/   # matches/ (MatchCard, GrantModal, Highlight), layout/ (Header, SavedMenu), home/ (HomeShowcase, HomeInsights)
│   │   ├── ui/           # Layout, Dropdown, SearchSelect, MultiSelect
│   │   ├── lib/          # match.ts (ENGINE), concepts.ts, countries.ts, sectors.ts, deadline.ts, score.ts, auth.tsx, saved.tsx, store.tsx, grantsData.ts, types.ts
│   │   └── data/         # grants.generated.json (snapshot, committed)
│   ├── ingest/           # grantsGov / euSedia / sbir / worldBank / nsf / collect / run (.mjs)  → `npm run ingest`
│   └── vite.config.ts    # host:true, proxy /api/auth + /api/saved → :3000, dev /api/grants middleware
├── divamok-grant-finder-app-api/        # Express + SQLite + JWT
│   ├── routes/ auth.js, saved.js
│   ├── middleware/ auth.js (JWT verify)
│   ├── database.js       # tables: users, saved_grants
│   └── .env.example      # JWT_SECRET, PORT (copy to .env)
├── start.sh / stop.sh    # run/stop both; Ctrl+C in start.sh runs stop.sh
├── push-to-github.sh     # prompts for a description, commits & pushes (uses PAT when asked)
├── assets/ logo.svg + logo.png
└── README.md / LICENSE (MIT) / .gitignore / HANDOVER.md (this)
```

## 3. Run it
Prereq: Node 18+.
```bash
cd divamok-grant-finder-app-frontend && npm install
cd ../divamok-grant-finder-app-api && npm install && cp .env.example .env   # set JWT_SECRET
cd .. && ./start.sh        # choose 1 (All). Ctrl+C stops both.
```
- Frontend http://localhost:5173 (or 5174) · API http://localhost:3000
- `host:true` is on → open the printed **Network** URL on a phone (same WiFi). API proxies through the host automatically.
- Refresh data: `cd divamok-grant-finder-app-frontend && npm run ingest` (~35s; pulls Grants.gov detail per grant).

## 4. Design system / brand (HARD RULES — keep these)
- **Palette:** EMERALD. canvas `#F5F8F6`, ink `#16211C`, brand `#059669` / press `#047857`, soft `#ECFDF5`, block `#EEF2F0`, line `#E2E8E4`, amber `#FFF6E6`/`#B7791F`. Tailwind theme tokens live in `src/index.css` (`bg-brand`, `text-ink`, etc.).
- **No gradients. Ever.** Flat solid color only.
- **`rounded-md` (~6–8px) edges** everywhere (cards `rounded-lg`). Tight corners, not pillowy.
- **Font:** Plus Jakarta Sans.
- **Brand mark / logo:** emerald rounded square with a small white rounded "dot" bottom-right (`assets/logo.svg`). Header wordmark is "Grants.DivAmok".
- Rejected looks (do NOT revive): "Stark Modernist" (white/black/cobalt — `prototype.html`) and "Clay & Teal" (terracotta/teal). `design-preview.html` is the approved-look mockup.
- Scrollbars are hidden app-wide (in `index.css`) but everything still scrolls.

## 5. The matching engine (`src/lib/match.ts`) — the core
- **Pure & deterministic** (no time/randomness): same profile + data → same ranking. (User verified this.)
- Query = sectors + pitch, expanded via a **synonym/concept map** (`concepts.ts`), then **stemmed**.
- Scored with **BM25F**: title ×3, funder ×1.5, description ×1; rare words weigh more (IDF), TF saturates, length-normalized.
- **Relevance threshold:** when the user has intent (sectors/pitch), grants with **zero** matched tokens are dropped (fixes the old "always 150").
- **Geo:** eligible region boosts; ineligible flagged ("geo blocker"), not hidden. `Global` (World Bank) counts as eligible everywhere. Country→region in `countries.ts` (EU member set).
- Outputs `matchedTerms` (the real words that hit) → shown as "Matched" chips + **highlighted in titles** (`Highlight.tsx`).
- Deadlines: `deadline.ts` parses the label into a live "Closes in N days" chip (display-time, kept OUT of the matcher to preserve determinism).

## 6. Data sources (all free / no-auth unless noted)
Grants.gov (Search2 + fetchOpportunity for descriptions) · EU Funding & Tenders (`grantsTenders.json`) · SBIR/STTR (WAF-flaky, often 429) · World Bank Projects (global/dev) · NSF Awards (US research). Open *calls* are applyable; World Bank/NSF are *awards* → tagged "Past award" / "Funder intel". Adapters in `ingest/*.mjs`, combined by `collect.mjs`, written to `src/data/grants.generated.json`. Full source notes: `GRANT-RESEARCH.md`.

## 7. Auth + Saved grants (the API)
- Express + SQLite (`database.sqlite`, gitignored) + JWT (24h) + bcrypt. Routes under `/api/auth` (register/login/password/account) and `/api/saved` (GET/POST/DELETE, JWT-protected, scoped to username).
- Frontend: `auth.tsx` (login/register, **1-hour idle timeout** that slides on activity), `saved.tsx` (`SavedProvider` → MatchCard Save button writes through to API; "My Saved Grants" dropdown in header + `/saved` page).
- On login, App pulls fresh grants (`loadGrants()` → `/api/grants`, snapshot fallback offline). The "Updating grants…" pill shows on the Matches page next to the back button.

## 8. Mobile (responsive, desktop preserved)
All mobile rules use `sm:`/`md:` prefixes so **desktop ≥640px is unchanged**. Fixed: match-card stacks action buttons below on phones; SavedMenu dropdown width-bound to viewport; header opacity 85→95 to stop bleed-through; card/modal padding tighter on phones. Intake form already responsive.

## 9. Known issues / gotchas
- ⚠️ **`deadline.ts` line ~35** still reads `${days} ddays` (typo, should be `days`). One-char fix, not yet applied (user was editing that file).
- `prototype.html` & `design-preview.html` (early mockups) are committed — user may want them removed for a cleaner repo.
- Build shows a harmless "chunk > 500 kB" warning (world-countries + bundled grants). Cosmetic.
- Login refresh takes ~35s (per-grant Grants.gov detail calls) — runs in background. A daily cron + hosting would remove the wait.
- A GitHub PAT was shared in plaintext during setup → **should be revoked** (github.com/settings/tokens). The repo was pushed with it transiently; it is NOT stored in git config (verified clean).

## 10. Roadmap / what's next (in priority order)
1. **L2 "AI brain" matching** — embeddings (semantic) + LLM intent understanding + eligibility extraction + re-rank. Needs a Claude API key (cost). Free alt discussed: on-device embeddings via `@xenova/transformers`.
2. **Deploy + daily auto-ingest** — host frontend (e.g. Vercel) + API; GitHub Actions cron to refresh data so login is instant. (Free tiers; user is cost-sensitive — confirmed Supabase/Vercel/GitHub free tiers are $0.)
3. Sharpen relevance: expand the synonym map to cover the ~120 sectors; per-opportunity eligibility extraction so Stage/Funding/Team actually score.
4. Funder prospecting from IRS 990s / historical awards.

## 11. Working style the user expects
- **Discuss & agree before building** anything foundational; wait for an explicit "go". Don't scaffold/restructure without sign-off.
- **Don't touch what already works** — when adding (e.g. mobile), use responsive prefixes so desktop is byte-for-byte unchanged. Additive, not destructive.
- Be direct, less menu-heavy; give a recommendation and proceed.
- After edits, run the frontend build to verify: `npm --prefix divamok-grant-finder-app-frontend run build`.

## 12. To continue in a new chat
Open the project, read this file + `README.md`, then say what you want to build. The repo is live at the URL in §1; push with `./push-to-github.sh` (it prompts for a message; use a fresh PAT when git asks).
