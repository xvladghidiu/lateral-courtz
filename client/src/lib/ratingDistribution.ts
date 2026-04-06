export type RatingDistribution = Record<1 | 2 | 3 | 4 | 5, number>;

export function computeRatingDistribution(
  reviews: { rating: number }[],
): RatingDistribution {
  const dist: RatingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of reviews) {
    const star = r.rating as 1 | 2 | 3 | 4 | 5;
    if (star >= 1 && star <= 5) dist[star]++;
  }
  return dist;
}
