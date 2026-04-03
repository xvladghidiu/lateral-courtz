import Fastify from "fastify";
import cors from "@fastify/cors";
import { config } from "./config.js";
import { InMemoryCourtRepository } from "./repositories/court.js";
import { InMemoryUserRepository } from "./repositories/user.js";
import { InMemorySessionRepository } from "./repositories/session.js";
import { InMemoryBookingRepository } from "./repositories/booking.js";
import { InMemoryReviewRepository } from "./repositories/review.js";
import { AuthService } from "./services/auth.js";
import { CourtService } from "./services/court.js";
import { SessionService } from "./services/session.js";
import { ReviewService } from "./services/review.js";
import { BookingService } from "./services/booking.js";
import { buildAuthMiddleware } from "./middleware/auth.js";
import { authRoutes } from "./routes/auth.js";
import { courtRoutes } from "./routes/courts.js";
import { sessionRoutes } from "./routes/sessions.js";
import { reviewRoutes } from "./routes/reviews.js";
import { bookingRoutes } from "./routes/bookings.js";

import courtsData from "./data/courts.json" with { type: "json" };
import usersData from "./data/users.json" with { type: "json" };
import sessionsData from "./data/sessions.json" with { type: "json" };
import reviewsData from "./data/reviews.json" with { type: "json" };

async function buildApp() {
  const app = Fastify({ logger: true });
  await app.register(cors, { origin: true });

  const courtRepo = new InMemoryCourtRepository(courtsData as any);
  const userRepo = new InMemoryUserRepository(usersData as any);
  const sessionRepo = new InMemorySessionRepository(sessionsData as any);
  const bookingRepo = new InMemoryBookingRepository();
  const reviewRepo = new InMemoryReviewRepository(reviewsData as any);

  const authService = new AuthService(userRepo, config.jwtSecret);
  const courtService = new CourtService(courtRepo);
  const sessionService = new SessionService(sessionRepo, courtRepo, bookingRepo, config.autoCancelOffsetHours);
  const reviewService = new ReviewService(reviewRepo, courtRepo);
  const bookingService = new BookingService(bookingRepo, sessionRepo);

  const authenticate = buildAuthMiddleware(authService);

  await authRoutes(app, { authService, userRepo, authenticate });
  await courtRoutes(app, { courtService });
  await sessionRoutes(app, { sessionService, sessionRepo, authenticate });
  await reviewRoutes(app, { reviewService, authenticate });
  await bookingRoutes(app, { bookingService, authenticate });

  return app;
}

async function start() {
  const app = await buildApp();
  await app.listen({ port: config.port, host: "0.0.0.0" });
}

start();

export { buildApp };
