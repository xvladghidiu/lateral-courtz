import { apiClient } from "./client.js";
import type { Booking, Session } from "@shared/types/index.js";

export function fetchMyBookings(token: string) {
  return apiClient<Booking[]>("/users/me/bookings", { token });
}

export function fetchMySessions(token: string) {
  return apiClient<Session[]>("/users/me/sessions", { token });
}
