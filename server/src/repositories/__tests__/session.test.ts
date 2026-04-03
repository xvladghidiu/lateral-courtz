import { describe, it, expect, beforeEach } from "vitest";
import { InMemorySessionRepository } from "../session.js";
import type { Session } from "@shared/types/session.js";

const seed: Session[] = [
  {
    id: "s1", courtId: "c1", createdBy: "u1",
    date: "2026-04-03", startTime: "19:00", durationMinutes: 120,
    format: "5v5", mode: "open", maxPlayers: 10,
    players: ["u1", "u2"], status: "filling",
    autoConfirmDeadline: "2026-04-03T17:00:00Z",
  },
  {
    id: "s2", courtId: "c1", createdBy: "u2",
    date: "2026-04-04", startTime: "18:00", durationMinutes: 60,
    format: "3v3", mode: "open", maxPlayers: 6,
    players: ["u2"], status: "filling",
    autoConfirmDeadline: "2026-04-04T16:00:00Z",
  },
];

describe("InMemorySessionRepository", () => {
  let repo: InMemorySessionRepository;

  beforeEach(() => {
    repo = new InMemorySessionRepository(seed);
  });

  it("finds by id", () => {
    expect(repo.findById("s1")?.format).toBe("5v5");
    expect(repo.findById("nope")).toBeUndefined();
  });

  it("finds by court and date", () => {
    const result = repo.findByCourtAndDate("c1", "2026-04-03");
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe("s1");
  });

  it("finds by player", () => {
    expect(repo.findByPlayer("u2")).toHaveLength(2);
  });

  it("finds by creator", () => {
    expect(repo.findByCreator("u1")).toHaveLength(1);
  });

  it("creates a session", () => {
    const newSession: Session = {
      id: "s3", courtId: "c2", createdBy: "u1",
      date: "2026-04-05", startTime: "20:00", durationMinutes: 90,
      format: "5v5", mode: "private", maxPlayers: 10,
      players: ["u1"], status: "filling",
      autoConfirmDeadline: "2026-04-05T18:00:00Z",
    };
    repo.create(newSession);
    expect(repo.findById("s3")).toBeDefined();
  });

  it("updates a session", () => {
    const session = repo.findById("s1")!;
    session.players.push("u3");
    repo.update(session);
    expect(repo.findById("s1")!.players).toContain("u3");
  });
});
