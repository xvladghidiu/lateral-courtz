import type { FastifyInstance } from "fastify";
import type { SessionService } from "../services/session.js";
import type { ISessionRepository } from "../repositories/types.js";
import type { CreateSessionInput } from "@shared/types/session.js";
import { createSessionSchema } from "../schemas/session.js";

interface SessionRoutesDeps {
  sessionService: SessionService;
  sessionRepo: ISessionRepository;
  authenticate: (req: any, reply: any) => Promise<void>;
}

export async function sessionRoutes(
  app: FastifyInstance,
  deps: SessionRoutesDeps,
): Promise<void> {
  app.get<{ Params: { id: string }; Querystring: { date?: string } }>(
    "/api/courts/:id/sessions",
    async (request) => {
      const { id } = request.params;
      const { date } = request.query;
      const sessions = date
        ? deps.sessionRepo.findByCourtAndDate(id, date)
        : deps.sessionRepo.findByCourtAndDate(id, new Date().toISOString().split("T")[0]!);
      return { data: sessions };
    },
  );

  app.post<{ Body: CreateSessionInput }>(
    "/api/sessions",
    { schema: createSessionSchema, preHandler: deps.authenticate },
    async (request, reply) => {
      try {
        const userId = (request as any).userId as string;
        const session = deps.sessionService.createSession(userId, request.body);
        return reply.status(201).send({ data: session });
      } catch (err: any) {
        return reply.status(400).send({ error: err.message });
      }
    },
  );

  app.post<{ Params: { id: string } }>(
    "/api/sessions/:id/join",
    { preHandler: deps.authenticate },
    async (request, reply) => {
      try {
        const userId = (request as any).userId as string;
        const result = deps.sessionService.joinSession(request.params.id, userId);
        return reply.send({ data: result });
      } catch (err: any) {
        return reply.status(400).send({ error: err.message });
      }
    },
  );
}
