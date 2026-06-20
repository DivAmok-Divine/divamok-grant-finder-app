// Concept clusters: any user term in a cluster expands to all related terms, so
// "pharmacy" also matches pharmaceutical / clinical / medication / health, etc.
// Synonym-aware relevance (Layer 1 — no AI). Multi-word terms are matched as
// substrings against the grant text.
export const CONCEPT_CLUSTERS: string[][] = [
  ['health', 'healthcare', 'medical', 'medicine', 'clinical', 'hospital', 'patient', 'disease', 'therapeutic', 'biomedical', 'pharma', 'pharmacy', 'pharmaceutical', 'drug', 'medication', 'vaccine', 'mental health', 'nursing', 'public health', 'cancer', 'diagnostic'],
  ['energy', 'renewable', 'solar', 'wind', 'clean energy', 'power', 'grid', 'battery', 'storage', 'electricity', 'hydrogen', 'geothermal', 'nuclear'],
  ['climate', 'carbon', 'emissions', 'sustainability', 'environment', 'environmental', 'greenhouse', 'decarbonization', 'resilience', 'conservation'],
  ['artificial intelligence', 'machine learning', 'software', 'data', 'algorithm', 'computing', 'digital', 'automation', 'robotics', 'cloud'],
  ['agriculture', 'agtech', 'farming', 'crop', 'food', 'soil', 'livestock', 'fishery', 'nutrition'],
  ['education', 'learning', 'school', 'training', 'stem', 'curriculum', 'teacher', 'student', 'literacy', 'workforce'],
  ['manufacturing', 'production', 'industrial', 'fabrication', 'supply chain', 'materials'],
  ['water', 'sanitation', 'hydrology', 'wastewater', 'drinking water', 'irrigation'],
  ['housing', 'shelter', 'homeless', 'affordable housing', 'community development', 'urban'],
  ['cybersecurity', 'cyber', 'security', 'privacy', 'encryption', 'network'],
  ['transportation', 'mobility', 'transit', 'vehicle', 'aviation', 'rail', 'logistics'],
  ['biotech', 'biology', 'genomics', 'life sciences', 'protein', 'cell'],
  ['space', 'aerospace', 'satellite', 'astronomy'],
  ['arts', 'culture', 'humanities', 'museum', 'music', 'creative', 'film'],
  ['economic', 'small business', 'entrepreneur', 'startup', 'innovation', 'commercialization', 'jobs', 'trade'],
]

const STOP = new Set([
  'the', 'and', 'for', 'with', 'your', 'that', 'this', 'from', 'are', 'our', 'you',
  'what', 'will', 'into', 'than', 'other', 'all', 'who', 'how', 'why', 'about',
])

/** Expand free text (sectors + pitch) into a set of relevant terms via the
 *  concept clusters, plus the raw meaningful words the user typed. */
export function expandConcepts(text: string): Set<string> {
  const lower = text.toLowerCase()
  const raw = lower.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((t) => t.length > 2 && !STOP.has(t))
  const terms = new Set<string>(raw)
  for (const cluster of CONCEPT_CLUSTERS) {
    if (cluster.some((term) => lower.includes(term))) {
      cluster.forEach((t) => terms.add(t))
    }
  }
  return terms
}
