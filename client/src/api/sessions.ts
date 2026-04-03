import { apiClient } from "./client.js";
import type { Session, CreateSessionInput, Booking } from "@shared/types/index.js";

export function fetchCourtSessions(courtId: string, date?: string) {
  const qs = date ? `?date=${date}` : "";
  return apiClient<Session[]>(`/courts/${courtId}/sessions${qs}`);
}

export function createSession(input: CreateSessionInput, token: string) {
  return apiClient<Session>("/sessions", { method: "POST", body: input, token });
}

export function joinSession(sessionId: string, token: string) {
  return apiClient<{ session: Session; booking: Booking }>(`/sessions/${sessionId}/join`, { method: "POST", token });
}
