export type SessionFormat = "5v5" | "3v3";
export type SessionMode = "open" | "private";
export type SessionStatus = "filling" | "confirmed" | "cancelled" | "completed";

export const MAX_PLAYERS: Record<SessionFormat, number> = {
  "5v5": 10,
  "3v3": 6,
};

export interface Session {
  id: string;
  courtId: string;
  createdBy: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  format: SessionFormat;
  mode: SessionMode;
  maxPlayers: number;
  players: string[];
  status: SessionStatus;
  autoConfirmDeadline: string;
}

export interface CreateSessionInput {
  courtId: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  format: SessionFormat;
  mode: SessionMode;
}
