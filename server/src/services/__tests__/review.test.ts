import { describe, it, expect, beforeEach } from "vitest";
import { ReviewService } from "../review.js";
import { InMemoryReviewRepository } from "../../repositories/review.js";
import { InMemoryCourtRepository } from "../../repositories/court.js";
import type { Court } from "@shared/types/court.js";

const court: Court = {
  id: "c1", name: "Test", address: "1 St", lat: 0, lng: 0,
  type: "indoor", surface: "hardwood", amenities: [], photos: [],
  pricePerPlayerPerHour: 10, rating: 0, reviewCount: 0,
};

describe("ReviewService", () => {
  let service: ReviewService;
  let reviewRepo: InMemoryReviewRepository;
  let courtRepo: InMemoryCourtRepository;

  beforeEach(() => {
    reviewRepo = new InMemoryReviewRepository([]);
    courtRepo = new InMemoryCourtRepository([court]);
    service = new ReviewService(reviewRepo, courtRepo);
  });

  it("creates a review and updates court rating", () => {
    service.addReview("c1", "u1", { rating: 5, comment: "Great!" });
    service.addReview("c1", "u2", { rating: 3, comment: "OK" });

    const reviews = reviewRepo.findByCourt("c1");
    expect(reviews).toHaveLength(2);

    const updatedCourt = courtRepo.findById("c1")!;
    expect(updatedCourt.rating).toBe(4);
    expect(updatedCourt.reviewCount).toBe(2);
  });

  it("rejects review for nonexistent court", () => {
    expect(() =>
      service.addReview("nope", "u1", { rating: 5, comment: "Test" }),
    ).toThrow("Court not found");
  });

  it("rejects rating outside 1-5 range", () => {
    expect(() =>
      service.addReview("c1", "u1", { rating: 0, comment: "Bad" }),
    ).toThrow("Rating must be between 1 and 5");

    expect(() =>
      service.addReview("c1", "u1", { rating: 6, comment: "Too good" }),
    ).toThrow("Rating must be between 1 and 5");
  });
});
