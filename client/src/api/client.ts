const BASE_URL = "/api";

interface FetchOptions {
  method?: string;
  body?: unknown;
  token?: string | null;
}

export async function apiClient<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { method = "GET", body, token } = options;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await response.json();
  if (!response.ok) throw new Error(json.error ?? "Request failed");
  return json.data as T;
}
