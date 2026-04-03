import type { FastifyInstance } from "fastify";
import type { ReviewService } from "../services/review.js";
import type { CreateReviewInput } from "@shared/types/review.js";
import { createReviewSchema } from "../schemas/review.js";

interface ReviewRoutesDeps {
  reviewService: ReviewService;
  authenticate: (req: any, reply: any) => Promise<void>;
}

export async function reviewRoutes(
  app: FastifyInstance,
  deps: ReviewRoutesDeps,
): Promise<void> {
  app.get<{ Params: { id: string } }>(
    "/api/courts/:id/reviews",
    async (request) => {
      const reviews = deps.reviewService.listByCourt(request.params.id);
      return { data: reviews };
    },
  );

  app.post<{ Params: { id: string }; Body: CreateReviewInput }>(
    "/api/courts/:id/reviews",
    { schema: createReviewSchema, preHandler: deps.authenticate },
    async (request, reply) => {
      try {
        const userId = (request as any).userId as string;
        const review = deps.reviewService.addReview(request.params.id, userId, request.body);
        return reply.status(201).send({ data: review });
      } catch (err: any) {
        return reply.status(400).send({ error: err.message });
      }
    },
  );
}
