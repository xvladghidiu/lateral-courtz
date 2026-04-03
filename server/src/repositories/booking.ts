import type { Booking } from "@shared/types/booking.js";
import type { IBookingRepository } from "./types.js";

export class InMemoryBookingRepository implements IBookingRepository {
  private bookings: Booking[];

  constructor(seedData: Booking[] = []) {
    this.bookings = structuredClone(seedData);
  }

  findByUser(userId: string): Booking[] {
    return this.bookings.filter((b) => b.userId === userId);
  }

  findBySession(sessionId: string): Booking[] {
    return this.bookings.filter((b) => b.sessionId === sessionId);
  }

  create(booking: Booking): Booking {
    this.bookings.push(structuredClone(booking));
    return booking;
  }

  update(booking: Booking): Booking {
    const index = this.bookings.findIndex((b) => b.id === booking.id);
    if (index === -1) throw new Error(`Booking ${booking.id} not found`);
    this.bookings[index] = structuredClone(booking);
    return booking;
  }
}
