import { apiClient } from "./client.js";
import type { AuthResponse, PublicUser } from "@shared/types/index.js";

export function registerUser(name: string, email: string, password: string) {
  return apiClient<AuthResponse>("/auth/register", { method: "POST", body: { name, email, password } });
}

export function loginUser(email: string, password: string) {
  return apiClient<AuthResponse>("/auth/login", { method: "POST", body: { email, password } });
}

export function fetchCurrentUser(token: string) {
  return apiClient<PublicUser>("/auth/me", { token });
}
