import { apiClient } from "./client.js";
import type { Review, CreateReviewInput } from "@shared/types/index.js";

export function fetchReviews(courtId: string) {
  return apiClient<Review[]>(`/courts/${courtId}/reviews`);
}

export function postReview(courtId: string, input: CreateReviewInput, token: string) {
  return apiClient<Review>(`/courts/${courtId}/reviews`, { method: "POST", body: input, token });
}
