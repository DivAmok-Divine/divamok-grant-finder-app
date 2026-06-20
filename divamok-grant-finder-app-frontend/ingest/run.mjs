import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { collectGrants } from './collect.mjs'

// CLI ingest: pull live grants and write the snapshot the frontend falls back to.
const OUT = fileURLToPath(new URL('../src/data/grants.generated.json', import.meta.url))

console.log('Ingesting live grants…')
const data = await collectGrants()
for (const [name, n] of Object.entries(data.sources)) {
  console.log(`  ${name}: ${n}`)
}

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(
  OUT,
  JSON.stringify({ generatedAt: data.generatedAt, count: data.count, grants: data.grants }, null, 2),
)
console.log(`✓ Wrote ${data.count} grants → src/data/grants.generated.json`)
