import worldCountries from 'world-countries'

export interface Country {
  name: string
  code: string
  /** emoji flag derived from the ISO-3166 alpha-2 code */
  flag: string
}

/** "US" -> 🇺🇸 (regional-indicator letters) */
function flagFromCode(code: string): string {
  return code.toUpperCase().replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
}

const PINNED = ['United States', 'United Kingdom']

const all: Country[] = worldCountries
  .map((c) => ({ name: c.name.common, code: c.cca2, flag: flagFromCode(c.cca2) }))
  .sort((a, b) => a.name.localeCompare(b.name))

// Pin the two primary audiences to the top, then everything else alphabetically.
export const COUNTRIES: Country[] = [
  ...PINNED.map((n) => all.find((c) => c.name === n)).filter((c): c is Country => Boolean(c)),
  ...all.filter((c) => !PINNED.includes(c.name)),
]

// EU member states — used by the matcher to resolve a profile's funding region.
export const EU_COUNTRIES = new Set<string>([
  'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czechia', 'Denmark',
  'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Ireland',
  'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Netherlands', 'Poland',
  'Portugal', 'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden',
])
