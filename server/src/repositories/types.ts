import type { Court, CourtType, SurfaceType } from "@shared/types/court.js";
import type { Session } from "@shared/types/session.js";
import type { Booking } from "@shared/types/booking.js";
import type { User } from "@shared/types/user.js";
import type { Review } from "@shared/types/review.js";

export interface CourtSearchParams {
  query?: string;
  type?: CourtType;
  surface?: SurfaceType;
  bounds?: { north: number; south: number; east: number; west: number };
}

export interface ICourtRepository {
  findAll(params: CourtSearchParams): Court[];
  findById(id: string): Court | undefined;
  updateRating(id: string, rating: number, reviewCount: number): void;
}

export interface IUserRepository {
  findById(id: string): User | undefined;
  findByEmail(email: string): User | undefined;
  create(user: User): User;
}

export interface ISessionRepository {
  findById(id: string): Session | undefined;
  findByCourtAndDate(courtId: string, date: string): Session[];
  findByStatus(status: string): Session[];
  findByPlayer(userId: string): Session[];
  findByCreator(userId: string): Session[];
  create(session: Session): Session;
  update(session: Session): Session;
}

export interface IBookingRepository {
  findByUser(userId: string): Booking[];
  findBySession(sessionId: string): Booking[];
  create(booking: Booking): Booking;
  update(booking: Booking): Booking;
}

export interface IReviewRepository {
  findByCourt(courtId: string): Review[];
  create(review: Review): Review;
}
