import type { FastifyInstance } from "fastify";
import type { CourtService } from "../services/court.js";
import type { CourtType, SurfaceType } from "@shared/types/court.js";
import { courtQuerySchema } from "../schemas/court.js";

interface CourtQuery {
  query?: string;
  type?: CourtType;
  surface?: SurfaceType;
  north?: number;
  south?: number;
  east?: number;
  west?: number;
}

export async function courtRoutes(
  app: FastifyInstance,
  deps: { courtService: CourtService },
): Promise<void> {
  app.get<{ Querystring: CourtQuery }>(
    "/api/courts",
    { schema: courtQuerySchema },
    async (request) => {
      const { query, type, surface, north, south, east, west } = request.query;
      const bounds =
        north != null && south != null && east != null && west != null
          ? { north, south, east, west }
          : undefined;

      const courts = deps.courtService.search({ query, type, surface, bounds });
      return { data: courts };
    },
  );

  app.get<{ Params: { id: string } }>(
    "/api/courts/:id",
    async (request, reply) => {
      try {
        const court = deps.courtService.getById(request.params.id);
        return { data: court };
      } catch {
        return reply.status(404).send({ error: "Court not found" });
      }
    },
  );
}
