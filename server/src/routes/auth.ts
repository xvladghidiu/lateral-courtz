import type { FastifyInstance } from "fastify";
import type { AuthService } from "../services/auth.js";
import type { CreateUserInput, LoginInput } from "@shared/types/user.js";
import { registerSchema, loginSchema } from "../schemas/auth.js";
import type { IUserRepository } from "../repositories/types.js";

interface AuthRoutesDeps {
  authService: AuthService;
  userRepo: IUserRepository;
  authenticate: (req: any, reply: any) => Promise<void>;
}

export async function authRoutes(
  app: FastifyInstance,
  deps: AuthRoutesDeps,
): Promise<void> {
  app.post<{ Body: CreateUserInput }>(
    "/api/auth/register",
    { schema: registerSchema },
    async (request, reply) => {
      try {
        const result = await deps.authService.register(request.body);
        return reply.status(201).send({ data: result });
      } catch (err: any) {
        return reply.status(400).send({ error: err.message });
      }
    },
  );

  app.post<{ Body: LoginInput }>(
    "/api/auth/login",
    { schema: loginSchema },
    async (request, reply) => {
      try {
        const result = await deps.authService.login(request.body);
        return reply.send({ data: result });
      } catch (err: any) {
        return reply.status(401).send({ error: err.message });
      }
    },
  );

  app.get(
    "/api/auth/me",
    { preHandler: deps.authenticate },
    async (request, reply) => {
      const userId = (request as any).userId as string;
      const user = deps.userRepo.findById(userId);
      if (!user) return reply.status(404).send({ error: "User not found" });

      const { passwordHash, ...publicUser } = user;
      return reply.send({ data: publicUser });
    },
  );
}
