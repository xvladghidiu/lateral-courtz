import { describe, it, expect, beforeEach } from "vitest";
import { SessionService } from "../session.js";
import { InMemorySessionRepository } from "../../repositories/session.js";
import { InMemoryCourtRepository } from "../../repositories/court.js";
import { InMemoryBookingRepository } from "../../repositories/booking.js";
import type { Court } from "@shared/types/court.js";

const court: Court = {
  id: "c1",
  name: "Test Court",
  address: "1 Test St",
  lat: 40.71,
  lng: -74.0,
  type: "indoor",
  surface: "hardwood",
  amenities: [],
  photos: [],
  pricePerPlayerPerHour: 10,
  rating: 4.0,
  reviewCount: 5,
};

describe("SessionService", () => {
  let service: SessionService;
  let sessionRepo: InMemorySessionRepository;
  let courtRepo: InMemoryCourtRepository;
  let bookingRepo: InMemoryBookingRepository;

  beforeEach(() => {
    sessionRepo = new InMemorySessionRepository([]);
    courtRepo = new InMemoryCourtRepository([court]);
    bookingRepo = new InMemoryBookingRepository();
    service = new SessionService(sessionRepo, courtRepo, bookingRepo, 2);
  });

  it("creates a session and auto-joins creator", () => {
    const session = service.createSession("user-1", {
      courtId: "c1",
      date: "2026-04-10",
      startTime: "19:00",
      durationMinutes: 120,
      format: "5v5",
      mode: "open",
    });

    expect(session.createdBy).toBe("user-1");
    expect(session.players).toContain("user-1");
    expect(session.maxPlayers).toBe(10);
    expect(session.status).toBe("filling");
  });

  it("sets maxPlayers to 6 for 3v3", () => {
    const session = service.createSession("user-1", {
      courtId: "c1",
      date: "2026-04-10",
      startTime: "19:00",
      durationMinutes: 60,
      format: "3v3",
      mode: "open",
    });

    expect(session.maxPlayers).toBe(6);
  });

  it("rejects creation for nonexistent court", () => {
    expect(() =>
      service.createSession("user-1", {
        courtId: "nonexistent",
        date: "2026-04-10",
        startTime: "19:00",
        durationMinutes: 60,
        format: "5v5",
        mode: "open",
      }),
    ).toThrow("Court not found");
  });

  it("joins a session and creates a booking", () => {
    const session = service.createSession("user-1", {
      courtId: "c1",
      date: "2026-04-10",
      startTime: "19:00",
      durationMinutes: 60,
      format: "3v3",
      mode: "open",
    });

    const { session: updated, booking } = service.joinSession(session.id, "user-2");

    expect(updated.players).toContain("user-2");
    expect(booking.userId).toBe("user-2");
    expect(booking.amountPaid).toBe(10);
  });

  it("rejects joining a full session", () => {
    const session = service.createSession("u1", {
      courtId: "c1",
      date: "2026-04-10",
      startTime: "19:00",
      durationMinutes: 60,
      format: "3v3",
      mode: "open",
    });

    service.joinSession(session.id, "u2");
    service.joinSession(session.id, "u3");
    service.joinSession(session.id, "u4");
    service.joinSession(session.id, "u5");
    service.joinSession(session.id, "u6");

    // Session is now 6/6 (u1 auto-joined + 5 joins)
    expect(() => service.joinSession(session.id, "u7")).toThrow("Session is full");
  });

  it("rejects duplicate join", () => {
    const session = service.createSession("u1", {
      courtId: "c1",
      date: "2026-04-10",
      startTime: "19:00",
      durationMinutes: 60,
      format: "5v5",
      mode: "open",
    });

    expect(() => service.joinSession(session.id, "u1")).toThrow("Already in this session");
  });

  it("confirms session when full", () => {
    const session = service.createSession("u1", {
      courtId: "c1",
      date: "2026-04-10",
      startTime: "19:00",
      durationMinutes: 60,
      format: "3v3",
      mode: "open",
    });

    service.joinSession(session.id, "u2");
    service.joinSession(session.id, "u3");
    service.joinSession(session.id, "u4");
    service.joinSession(session.id, "u5");
    const { session: full } = service.joinSession(session.id, "u6");

    expect(full.status).toBe("confirmed");
  });

  it("cancels unfilled sessions past deadline", () => {
    const session = service.createSession("u1", {
      courtId: "c1",
      date: "2026-04-01",
      startTime: "10:00",
      durationMinutes: 60,
      format: "5v5",
      mode: "open",
    });

    const cancelled = service.runAutoCancel(new Date("2026-04-01T09:00:00Z"));
    expect(cancelled).toHaveLength(1);
    expect(sessionRepo.findById(session.id)!.status).toBe("cancelled");
  });
});
