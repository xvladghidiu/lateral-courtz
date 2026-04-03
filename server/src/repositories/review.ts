import type { Review } from "@shared/types/review.js";
import type { IReviewRepository } from "./types.js";

export class InMemoryReviewRepository implements IReviewRepository {
  private reviews: Review[];

  constructor(seedData: Review[]) {
    this.reviews = structuredClone(seedData);
  }

  findByCourt(courtId: string): Review[] {
    return this.reviews
      .filter((r) => r.courtId === courtId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  create(review: Review): Review {
    this.reviews.push(structuredClone(review));
    return review;
  }
}
