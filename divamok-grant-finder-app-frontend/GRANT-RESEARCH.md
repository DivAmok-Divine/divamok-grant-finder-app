# Divamok Grant Finder — Build Research Report

> Scope: a free-first, global grant-finder serving nonprofits/NGOs, startups/small businesses, and individuals across US, UK/EU, Africa, and beyond.
> Generated from a 5-phase deep-research pass (110 agents, 28 sources fetched, 135 claims extracted, 25 adversarially verified) **plus** engineering synthesis.
> **Confidence legend:** ✅ VERIFIED = official primary docs, several live-tested 2026‑06‑16. 🧠 ANALYSIS = engineering knowledge, not web-verified this pass — confirm time-sensitive details (pricing, limits) before relying.

---

## 0. The one strategic insight that shapes the whole product

Free grant data splits into **three fundamentally different types**, and conflating them will break your UX:

| Type | What it is | What it's for | Sources |
|------|-----------|---------------|---------|
| **Open CALLS** | Forward-looking opportunities you can apply to *now* | "Find me grants I can apply for" | Grants.gov Search2, EU SEDIA / grantsTenders |
| **Historical AWARDS / funder intelligence** | Money already given out | "Who funds orgs/people like me?" (prospecting) | USAspending, SBIR awards, ProPublica 990s, World Bank projects, much of GrantNav |
| **Contracts (NOT grants)** | Procurement, not financial assistance | Adjacent revenue, label clearly | SAM.gov Opportunities |

A truly powerful finder uses **both** axes: open calls for "apply now," and the awards/990 data as a **prospecting engine** ("foundations that funded organizations like yours") — which is exactly where individuals and Africa-focused seekers are underserved today.

---

## 1. DATA SOURCES & APIs ✅ (the verified backbone)

### Tier 1 — Free, NO authentication (use these on day one)

| Source | Coverage | Type | Endpoint | Format | Redistribution |
|--------|----------|------|----------|--------|----------------|
| **Grants.gov Search2** ✅ | US federal grant **calls** | Open calls | `POST https://api.grants.gov/v1/api/search2` | JSON | US-gov public domain |
| **USAspending** ✅ | US federal grant **awards** | Awards | `https://api.usaspending.gov/api/v2/...` | JSON | **CC0 — fully redistributable** ⭐ |
| **EU Funding & Tenders (SEDIA)** ✅ | Horizon Europe + EU calls | Open calls | `POST https://api.tech.ec.europa.eu/search-api/prod/rest/search?apiKey=SEDIA` | JSON | Verify per-record |
| **EU bulk reference file** ✅ | All EU grants+tenders | Open calls | `GET .../opportunities/data/referenceData/grantsTenders.json` | JSON (~3.4MB+) | Verify per-record |
| **ProPublica Nonprofit Explorer** ✅ | IRS 990 / 990-EZ / **990-PF** (funders!) | Funder intel | `https://projects.propublica.org/nonprofits/api/v2` (GET) | JSON | Data Terms of Use apply |
| **360Giving GrantNav** ✅ | UK grants (~1.47M, 346 funders, 197k to individuals) | Mostly awards | `/api/grants.json`, `/api/grants.csv` | CSV/JSON, daily | ⚠️ per-record license + attribution |
| **World Bank Projects** ✅ | Intl development (~22,729 projects) | Funder/pipeline intel | `http://search.worldbank.org/api/v2/projects?format=json` | JSON | Public |

**Key implementation gems (live-verified 2026‑06‑16):**
- Grants.gov Search2 needs **no key**: `curl -X POST https://api.grants.gov/v1/api/search2 -H 'Content-Type: application/json' -d '{"keyword":"health"}'`. (Other Grants.gov grantor/S2S APIs *do* need `X-API-Key` — only search2 is key-free.)
- USAspending grant awards: `POST /api/v2/search/spending_by_award/` with assistance `award_type_codes` `["02","03","04","05"]` → recipient, amount, awarding agency. **CC0 = the only unambiguously redistributable source.**
- EU SEDIA: the literal string `apiKey=SEDIA` is a shared public gate (no registration; wrong/missing key → HTTP 400). Each result links to `data/topicDetails/<TOPIC_ID>.json` with title, **conditions/eligibility**, deadlines, budget. Filenames are lowercase/case-sensitive.
- ProPublica: `/search.json` (q, state[id], ntee[id], c_code[id]) for discovery; `/organizations/:ein.json` for the full record. **990-PF = private foundation filings = your foundation-prospecting goldmine.** No key. (PDF downloads are rate-limited; the JSON API is not.)

### Tier 2 — Free but requires a free key / has caveats

| Source | Coverage | Auth | Caveat |
|--------|----------|------|--------|
| **SAM.gov Get Opportunities** ✅ | US federal **contracts** (not grants) | Free key (Account Details page), `?api_key=` | Procurement, not grants — label clearly |
| **IATI Datastore v3** ✅ | Intl development aid activity | Free key, `Ocp-Apim-Subscription-Key` header | Free "Exploratory" tier: ~5 calls/min, ~100/week |
| **SBIR.gov** ✅ | US SBIR/STTR awards, solicitations, companies | None | `api.www.sbir.gov/public/api/awards` — but flaky (429/WAF), 10k-record cap, ~290MB full set |

### Tier 3 — Requested but NOT yet verified (next research pass)

NIH RePORTER · NSF Awards API · Federal Register · **Candid/Foundation Directory** (pricing & free tiers) · raw 990-PF XML parsing · **UKRI Gateway to Research** · CORDIS · **Charity Commission API** · **Find a Grant UK** · AfDB · UN agencies (incl. UNOCHA FTS) · d-portal (IATI front-end).

### Aggregation / dedup / freshness 🧠

- **Canonical schema** (see §4). Every record carries `source`, `source_id`, `first_seen`, `last_seen`, `url`.
- **Dedup** by fuzzy `(funder + normalized_title + deadline)` and by canonical URL; keep a `source_precedence` order (official call > aggregator).
- **Freshness**: mark a record `stale` when its deadline passes OR it's absent from N consecutive crawls. Open-calls sources crawl daily; awards/990 sources monthly.
- **Redistribution discipline**: only USAspending is blanket-free (CC0). GrantNav/360Giving requires per-record open-license + attribution handling (blanket reuse was **refuted** in research). ProPublica has a Data Terms of Use. Store the license per record.

---

## 2. AI MATCHING ENGINE 🧠 (engineering synthesis — not web-verified this pass)

**Goal:** map messy prose eligibility → a structured profile, then rank. Two stages:

### Stage A — Structured eligibility extraction (offline, at ingest)
Run each grant's prose through an LLM with a **structured-output schema** to populate facets:
`geo_eligibility[]`, `recipient_types[]` (nonprofit/startup/individual/researcher/municipality), `sectors[]` (map to NTEE), `award_min/max`, `deadline`, `status`, plus `eligibility_confidence` and an explicit `unknown` flag per facet.
- Cheap/fast model for bulk (e.g., Claude **Haiku 4.5** — strong structured output, very low cost), escalate ambiguous records to a stronger model.
- **Never silently guess**: an unextractable facet = `unknown`, which downstream is treated as *soft*, not a hard exclude (avoids filtering out grants the user is actually eligible for).

### Stage B — Retrieval & ranking (online, per query)
1. **Hard filters (gates):** geography, recipient type, open deadline. Eliminate the clearly-ineligible. Treat `unknown` facets as pass-through, not fail.
2. **Soft ranking — hybrid search:** **BM25 (keyword)** + **dense embeddings (semantic)**, fused with **Reciprocal Rank Fusion (RRF)**. Optional cross-encoder / LLM-rubric rerank on the top ~50.
3. **Explainability:** generate a short "why this fits / what to verify" note **grounded in the extracted facets** (cite the structured fields, don't free-hallucinate). This is a top differentiator — incumbents mostly don't explain matches.

**Free/open building blocks:**
- Embeddings: open models via `sentence-transformers` (BGE, E5, GTE, `nomic-embed`) — run locally, $0. Or a free-tier embedding API.
- Vector store: **pgvector inside Postgres** (one DB for everything, free tier) is the pragmatic winner; alternatives = Qdrant free cloud (~1GB), Chroma (local).
- Hybrid in one DB: Postgres `tsvector` FTS + `pgvector` + RRF in SQL → no separate search service needed at MVP.

---

## 3. COMPETITIVE LANDSCAPE 🧠 (knowledge-based; pricing ~2025 — VERIFY before quoting)

| Tool | Serves | ~Pricing | Data | Gap you exploit |
|------|--------|----------|------|-----------------|
| **Instrumentl** | Nonprofits | ~$179+/mo | Federal + foundation 990s + curated | Expensive; US-centric; no individuals |
| **Candid / Foundation Directory** | Nonprofits, researchers | ~$219/mo (free at partner libraries) | The 990/foundation authority | Paywalled; dated UX; US-centric |
| **GrantStation** | Nonprofits | ~$179/yr | Curated DB | Smaller DB; weak matching |
| **GrantWatch** | Broad | ~$18/wk–$199/yr | Aggregated listings | Noisy; thin eligibility data |
| **Submittable** | Grantmakers | Enterprise | Submission mgmt | Not a seeker-side finder |
| **OpenGrants** | US startups/nonprofits | Freemium + consultant marketplace | Federal + partners | US-focused; finder is secondary |
| **Grantable** | Writers | Freemium | — (AI **writing**, not finding) | Not a finder at all |

**White space → your wedge:** *free/cheap* + *truly global (Africa-inclusive)* + *serves individuals* (artists/students/researchers — almost everyone ignores them) + *funder-intelligence from 990s/awards* + *explainable AI matching*. Africa especially is underserved (DevelopmentAid is paid; the majors are US/UK-centric).

---

## 4. ARCHITECTURE & FREE STACK 🧠

```
                    ┌─────────────────────────────────────────┐
  Scheduled ETL  →  │  Source adapters (Grants.gov, EU SEDIA,  │
 (GH Actions cron) │  USAspending, ProPublica, GrantNav, WB…)  │
                    └───────────────────┬─────────────────────┘
                                        ▼
                    ┌─────────────────────────────────────────┐
   LLM extract  →   │  Normalize → canonical schema + facets   │
   (Haiku/open)     │  + embeddings  → Postgres (pgvector+FTS) │
                    └───────────────────┬─────────────────────┘
                                        ▼
   Profile + query → Hard filters → Hybrid (BM25+vector+RRF) → Rerank → Explain
                                        ▼
                    Next.js app: search · alerts · deadline tracker · prospecting
```

### Canonical grant schema (starter)
`id · source · source_id · url · title · funder · description · geo_eligibility[] · recipient_types[] · sectors[] · award_min · award_max · currency · deadline · status · type(open_call|award|contract) · license · first_seen · last_seen · embedding`

### Free-stack starter kit
| Layer | Pick | Free-tier note |
|-------|------|----------------|
| DB + vector + auth | **Supabase** (Postgres + pgvector + auth) or **Neon** | ~500MB / pauses on inactivity (Supabase); compute-hours/branching (Neon) |
| Search | Postgres FTS + pgvector (RRF); later Meilisearch/Typesense | self-host or generous free |
| Embeddings | `sentence-transformers` (BGE/E5/nomic) | $0 local |
| LLM extraction | Claude **Haiku 4.5** (cheap) or open Llama/Qwen | low cost / $0 self-host |
| Backend | FastAPI (Python) or Node | — |
| Scheduling/ETL | **GitHub Actions cron** | free minutes (public/limited private) |
| Scraping | httpx for APIs; Playwright/Scrapy for HTML; Firecrawl free tier | — |
| Frontend host | **Next.js on Vercel** | bandwidth-capped free tier |

### Phased roadmap (MVP → powerful)
- **Phase 0 (week 1):** Ingest Grants.gov Search2 + EU SEDIA → Postgres → keyword search + filters. *Already a usable US+EU open-calls finder.*
- **Phase 1 (weeks 2–4):** LLM eligibility extraction → facets; user profile + hard-filter matching; pgvector hybrid search; deadline tracker + saved searches + email alerts.
- **Phase 2 (months 2–3):** Funder-intelligence layer (USAspending + ProPublica 990-PF + GrantNav prospecting); add UK (Find a Grant, GrantNav) + intl (World Bank, IATI); explainable match reasoning; individual-focused sources.
- **Phase 3 (powerful):** Africa/global expansion, foundation prospecting, application tracking/CRM, AI grant-writing assist, cross-source dedup, freshness monitoring, monetization.

### Monetization 🧠
Freemium: free search + a few alerts; paid = unlimited alerts, deadline/application tracking, **funder prospecting**, AI writing assist, team seats, API access.

---

## 5. What's verified vs. open

**Verified (high-confidence, primary-sourced, several live-tested):** every Tier-1 and Tier-2 source in §1.
**Refuted:** "all 360Giving data is blanket-openly-licensed & redistributable" (1‑2) → redistribution needs per-record license handling.
**Unresearched / open:** the full AI-matching literature (§2), competitor specifics & pricing (§3), the free-stack benchmarks (§4), and the Tier-3 sources (NIH RePORTER, NSF, Candid pricing, UKRI, CORDIS, Charity Commission, Find a Grant UK, AfDB, UN, d-portal).
