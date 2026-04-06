import { describe, it, expect } from "vitest";
import { computeRatingDistribution } from "../ratingDistribution.js";

describe("computeRatingDistribution", () => {
  it("returns zero counts for empty array", () => {
    const result = computeRatingDistribution([]);
    expect(result).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  });

  it("counts ratings correctly", () => {
    const reviews = [
      { rating: 5 },
      { rating: 5 },
      { rating: 4 },
      { rating: 3 },
      { rating: 5 },
    ];
    const result = computeRatingDistribution(reviews);
    expect(result).toEqual({ 1: 0, 2: 0, 3: 1, 4: 1, 5: 3 });
  });

  it("computes percentage for each star", () => {
    const reviews = [{ rating: 5 }, { rating: 5 }, { rating: 3 }, { rating: 3 }];
    const result = computeRatingDistribution(reviews);
    expect(result[5]).toBe(2);
    expect(result[3]).toBe(2);
    expect(result[1]).toBe(0);
  });
});
