import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSession, fetchAllSessions, fetchCourtSessions, createSession, joinSession } from "../api/sessions.js";
import { useAuth } from "../context/AuthContext.js";

export function useSession(id: string) {
  return useQuery({
    queryKey: ["sessions", id],
    queryFn: () => fetchSession(id),
    enabled: !!id,
  });
}

export function useAllSessions(status?: string) {
  return useQuery({
    queryKey: ["sessions", "all", status],
    queryFn: () => fetchAllSessions(status),
  });
}

export function useCourtSessions(courtId: string, date?: string) {
  return useQuery({ queryKey: ["sessions", courtId, date], queryFn: () => fetchCourtSessions(courtId, date), enabled: !!courtId });
}

export function useCreateSession() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof createSession>[0]) => createSession(input, token!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sessions"] }),
  });
}

export function useJoinSession() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => joinSession(sessionId, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}
