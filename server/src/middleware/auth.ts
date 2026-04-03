import type { FastifyRequest, FastifyReply } from "fastify";
import type { AuthService } from "../services/auth.js";

export function buildAuthMiddleware(authService: AuthService) {
  return async function authenticate(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const header = request.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return reply.status(401).send({ error: "Missing authorization token" });
    }

    const token = header.slice(7);
    try {
      const userId = authService.verifyToken(token);
      (request as FastifyRequest & { userId: string }).userId = userId;
    } catch {
      return reply.status(401).send({ error: "Invalid or expired token" });
    }
  };
}
