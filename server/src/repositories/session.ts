import type { Session } from "@shared/types/session.js";
import type { ISessionRepository } from "./types.js";

export class InMemorySessionRepository implements ISessionRepository {
  private sessions: Session[];

  constructor(seedData: Session[]) {
    this.sessions = structuredClone(seedData);
  }

  findById(id: string): Session | undefined {
    return this.sessions.find((s) => s.id === id);
  }

  findByCourtAndDate(courtId: string, date: string): Session[] {
    return this.sessions.filter((s) => s.courtId === courtId && s.date === date);
  }

  findByStatus(status: string): Session[] {
    return this.sessions.filter((s) => s.status === status);
  }

  findByPlayer(userId: string): Session[] {
    return this.sessions.filter((s) => s.players.includes(userId));
  }

  findByCreator(userId: string): Session[] {
    return this.sessions.filter((s) => s.createdBy === userId);
  }

  create(session: Session): Session {
    this.sessions.push(structuredClone(session));
    return session;
  }

  update(session: Session): Session {
    const index = this.sessions.findIndex((s) => s.id === session.id);
    if (index === -1) throw new Error(`Session ${session.id} not found`);
    this.sessions[index] = structuredClone(session);
    return session;
  }
}
