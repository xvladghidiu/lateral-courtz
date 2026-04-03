import type { Booking } from "@shared/types/booking.js";
import type { Session } from "@shared/types/session.js";
import type { IBookingRepository, ISessionRepository } from "../repositories/types.js";

export class BookingService {
  constructor(
    private bookingRepo: IBookingRepository,
    private sessionRepo: ISessionRepository,
  ) {}

  listByUser(userId: string): Booking[] {
    return this.bookingRepo.findByUser(userId);
  }

  listSessionsByCreator(userId: string): Session[] {
    return this.sessionRepo.findByCreator(userId);
  }

  listSessionsByPlayer(userId: string): Session[] {
    return this.sessionRepo.findByPlayer(userId);
  }
}
