// Fit-score color bands (flat tints, no gradients) — shared by the match card
// badge and the details modal so they always agree.
export function scoreStyle(score: number): string {
  if (score >= 85) return 'bg-[#E6F5EC] text-[#0F7A4F]' // strong — green
  if (score >= 70) return 'bg-[#FBF1D9] text-[#9A7B1F]' // good — amber
  if (score >= 55) return 'bg-[#FBE9DA] text-[#B45A24]' // fair — orange
  return 'bg-[#F7E3E3] text-[#B23B3B]' // low — rose
}
