import { useQuery } from "@tanstack/react-query";
import { fetchCourts, fetchCourt } from "../api/courts.js";

export function useCourts(params: Parameters<typeof fetchCourts>[0] = {}) {
  return useQuery({ queryKey: ["courts", params], queryFn: () => fetchCourts(params) });
}

export function useCourt(id: string) {
  return useQuery({ queryKey: ["courts", id], queryFn: () => fetchCourt(id), enabled: !!id });
}
