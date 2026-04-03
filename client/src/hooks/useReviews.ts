import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchReviews, postReview } from "../api/reviews.js";
import { useAuth } from "../context/AuthContext.js";
import type { CreateReviewInput } from "@shared/types/index.js";

export function useReviews(courtId: string) {
  return useQuery({ queryKey: ["reviews", courtId], queryFn: () => fetchReviews(courtId), enabled: !!courtId });
}

export function usePostReview(courtId: string) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateReviewInput) => postReview(courtId, input, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", courtId] });
      queryClient.invalidateQueries({ queryKey: ["courts"] });
    },
  });
}
