import type { FastifyInstance } from "fastify";
import type { BookingService } from "../services/booking.js";

interface BookingRoutesDeps {
  bookingService: BookingService;
  authenticate: (req: any, reply: any) => Promise<void>;
}

export async function bookingRoutes(
  app: FastifyInstance,
  deps: BookingRoutesDeps,
): Promise<void> {
  app.get(
    "/api/users/me/bookings",
    { preHandler: deps.authenticate },
    async (request) => {
      const userId = (request as any).userId as string;
      const bookings = deps.bookingService.listByUser(userId);
      return { data: bookings };
    },
  );

  app.get(
    "/api/users/me/sessions",
    { preHandler: deps.authenticate },
    async (request) => {
      const userId = (request as any).userId as string;
      const sessions = deps.bookingService.listSessionsByCreator(userId);
      return { data: sessions };
    },
  );
}
