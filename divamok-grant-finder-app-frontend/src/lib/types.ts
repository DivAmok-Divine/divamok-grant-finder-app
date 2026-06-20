export type RecipientType = 'startup' | 'nonprofit' | 'individual'

export interface Profile {
  audience: RecipientType
  company: string
  country: string
  stage: string
  sectors: string[]
  pitch: string
  funding: string
  team: string
}

export type GrantType = 'open_call' | 'award'

/** Where the grant is awardable — drives the geo hard-filter / soft-rank. */
export type Geo = 'US' | 'EU' | 'UK' | string

export interface Grant {
  id: string
  title: string
  funder: string
  source: string
  /** may be empty when the source's list endpoint doesn't expose an amount */
  amountLabel: string
  deadlineLabel: string
  type: GrantType
  geo?: Geo
  /** description / eligibility text for relevance matching (when the source exposes it) */
  description?: string
  url?: string
}

export type MatchTier = 'high' | 'mid' | 'low'

export interface Match {
  grant: Grant
  /** 0–100 eligibility/fit score */
  score: number
  tier: MatchTier
  /** ineligible by region — soft-ranked & flagged, never hidden */
  geoBlocked: boolean
  /** the actual words that drove the match — for "matched on" chips + highlighting */
  matchedTerms: string[]
  /** explanation shown on the card; `lead` is emphasised */
  why: { lead: string; rest: string }
  /** the eligibility caveat to check before applying */
  verify: string
}
