import { describe, it, expect, beforeEach } from "vitest";
import { AuthService } from "../auth.js";
import { InMemoryUserRepository } from "../../repositories/user.js";
import type { User } from "@shared/types/user.js";

describe("AuthService", () => {
  let authService: AuthService;
  let userRepo: InMemoryUserRepository;

  beforeEach(() => {
    userRepo = new InMemoryUserRepository([]);
    authService = new AuthService(userRepo, "test-secret");
  });

  it("registers a new user and returns token + public user", async () => {
    const result = await authService.register({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    expect(result.token).toBeDefined();
    expect(result.user.name).toBe("Test User");
    expect(result.user.email).toBe("test@example.com");
    expect((result.user as unknown as User).passwordHash).toBeUndefined();
  });

  it("rejects duplicate email", async () => {
    await authService.register({
      name: "First",
      email: "dup@example.com",
      password: "pass1",
    });

    await expect(
      authService.register({
        name: "Second",
        email: "dup@example.com",
        password: "pass2",
      }),
    ).rejects.toThrow("Email already registered");
  });

  it("logs in with correct credentials", async () => {
    await authService.register({
      name: "Login Test",
      email: "login@example.com",
      password: "correct-password",
    });

    const result = await authService.login({
      email: "login@example.com",
      password: "correct-password",
    });

    expect(result.token).toBeDefined();
    expect(result.user.email).toBe("login@example.com");
  });

  it("rejects wrong password", async () => {
    await authService.register({
      name: "Wrong Pass",
      email: "wrong@example.com",
      password: "correct",
    });

    await expect(
      authService.login({ email: "wrong@example.com", password: "incorrect" }),
    ).rejects.toThrow("Invalid credentials");
  });

  it("verifies a valid token", async () => {
    const { token } = await authService.register({
      name: "Verify",
      email: "verify@example.com",
      password: "pass",
    });

    const userId = authService.verifyToken(token);
    expect(userId).toBeDefined();
  });

  it("rejects an invalid token", () => {
    expect(() => authService.verifyToken("garbage")).toThrow();
  });
});
