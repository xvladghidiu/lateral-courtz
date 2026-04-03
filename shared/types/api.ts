export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  error: string;
  statusCode: number;
}

export interface AuthResponse {
  token: string;
  user: import("./user.js").PublicUser;
}
