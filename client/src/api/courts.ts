import { apiClient } from "./client.js";
import type { Court } from "@shared/types/index.js";

interface CourtSearchParams {
  query?: string;
  type?: string;
  surface?: string;
  bounds?: { north: number; south: number; east: number; west: number };
}

export function fetchCourts(params: CourtSearchParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.query) searchParams.set("query", params.query);
  if (params.type) searchParams.set("type", params.type);
  if (params.surface) searchParams.set("surface", params.surface);
  if (params.bounds) {
    searchParams.set("north", String(params.bounds.north));
    searchParams.set("south", String(params.bounds.south));
    searchParams.set("east", String(params.bounds.east));
    searchParams.set("west", String(params.bounds.west));
  }
  const qs = searchParams.toString();
  return apiClient<Court[]>(`/courts${qs ? `?${qs}` : ""}`);
}

export function fetchCourt(id: string) {
  return apiClient<Court>(`/courts/${id}`);
}
