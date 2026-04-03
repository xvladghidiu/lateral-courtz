export interface Review {
  id: string;
  courtId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CreateReviewInput {
  rating: number;
  comment: string;
}
