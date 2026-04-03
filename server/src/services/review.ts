import { v4 as uuid } from "uuid";
import type { Review, CreateReviewInput } from "@shared/types/review.js";
import type { IReviewRepository, ICourtRepository } from "../repositories/types.js";

export class ReviewService {
  constructor(
    private reviewRepo: IReviewRepository,
    private courtRepo: ICourtRepository,
  ) {}

  addReview(courtId: string, userId: string, input: CreateReviewInput): Review {
    const court = this.courtRepo.findById(courtId);
    if (!court) throw new Error("Court not found");
    if (input.rating < 1 || input.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    const review = this.reviewRepo.create({
      id: uuid(),
      courtId,
      userId,
      rating: input.rating,
      comment: input.comment,
      createdAt: new Date().toISOString(),
    });

    this.recalculateCourtRating(courtId);
    return review;
  }

  listByCourt(courtId: string): Review[] {
    return this.reviewRepo.findByCourt(courtId);
  }

  private recalculateCourtRating(courtId: string): void {
    const reviews = this.reviewRepo.findByCourt(courtId);
    if (reviews.length === 0) return;

    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = Math.round((sum / reviews.length) * 10) / 10;
    this.courtRepo.updateRating(courtId, avg, reviews.length);
  }
}
