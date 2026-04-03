import { useQuery } from "@tanstack/react-query";
import { fetchMyBookings, fetchMySessions } from "../api/bookings.js";
import { useAuth } from "../context/AuthContext.js";

export function useMyBookings() {
  const { token } = useAuth();
  return useQuery({ queryKey: ["bookings", "mine"], queryFn: () => fetchMyBookings(token!), enabled: !!token });
}

export function useMySessions() {
  const { token } = useAuth();
  return useQuery({ queryKey: ["sessions", "mine"], queryFn: () => fetchMySessions(token!), enabled: !!token });
}
