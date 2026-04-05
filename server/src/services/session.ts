import { v4 as uuid } from "uuid";
import { MAX_PLAYERS } from "@shared/types/session.js";
import type { Session, CreateSessionInput } from "@shared/types/session.js";
import type { Booking } from "@shared/types/booking.js";
import type {
  ISessionRepository,
  ICourtRepository,
  IBookingRepository,
} from "../repositories/types.js";

export class SessionService {
  constructor(
    private sessionRepo: ISessionRepository,
    private courtRepo: ICourtRepository,
    private bookingRepo: IBookingRepository,
    private autoCancelOffsetHours: number,
  ) {}

  createSession(userId: string, input: CreateSessionInput): Session {
    const court = this.courtRepo.findById(input.courtId);
    if (!court) throw new Error("Court not found");

    const maxPlayers = MAX_PLAYERS[input.format];
    const deadline = this.calculateDeadline(input.date, input.startTime);

    const session: Session = {
      id: uuid(),
      courtId: input.courtId,
      createdBy: userId,
      date: input.date,
      startTime: input.startTime,
      durationMinutes: input.durationMinutes,
      format: input.format,
      mode: input.mode,
      maxPlayers,
      players: [userId],
      status: "filling",
      autoConfirmDeadline: deadline,
    };

    this.sessionRepo.create(session);
    this.createBookingForPlayer(session, userId, court.pricePerPlayerPerHour);
    return session;
  }

  joinSession(
    sessionId: string,
    userId: string,
  ): { session: Session; booking: Booking } {
    const session = this.sessionRepo.findById(sessionId);
    if (!session) throw new Error("Session not found");
    if (session.players.includes(userId)) throw new Error("Already in this session");
    if (session.players.length >= session.maxPlayers) throw new Error("Session is full");
    if (session.status !== "filling") throw new Error("Session is not open");

    const court = this.courtRepo.findById(session.courtId);
    if (!court) throw new Error("Court not found");

    session.players.push(userId);

    if (session.players.length >= session.maxPlayers) {
      session.status = "confirmed";
    }

    this.sessionRepo.update(session);

    const booking = this.createBookingForPlayer(
      session,
      userId,
      court.pricePerPlayerPerHour,
    );

    return { session, booking };
  }

  runAutoCancel(now: Date): Session[] {
    const filling = this.sessionRepo.findByStatus("filling");
    const cancelled: Session[] = [];

    for (const session of filling) {
      const deadline = new Date(session.autoConfirmDeadline);
      if (now <= deadline) continue;

      session.status = "cancelled";
      this.sessionRepo.update(session);
      cancelled.push(session);
    }

    return cancelled;
  }

  private calculateDeadline(date: string, startTime: string): string {
    const start = new Date(`${date}T${startTime}:00Z`);
    start.setHours(start.getHours() - this.autoCancelOffsetHours);
    return start.toISOString();
  }

  private createBookingForPlayer(
    session: Session,
    userId: string,
    pricePerHour: number,
  ): Booking {
    return this.bookingRepo.create({
      id: uuid(),
      sessionId: session.id,
      userId,
      amountPaid: pricePerHour * (session.durationMinutes / 60),
      status: "confirmed",
      createdAt: new Date().toISOString(),
    });
  }
}
