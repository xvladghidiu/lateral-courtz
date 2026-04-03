import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import type { CreateUserInput, LoginInput, PublicUser } from "@shared/types/user.js";
import type { AuthResponse } from "@shared/types/api.js";
import type { IUserRepository } from "../repositories/types.js";

export class AuthService {
  constructor(
    private userRepo: IUserRepository,
    private jwtSecret: string,
  ) {}

  async register(input: CreateUserInput): Promise<AuthResponse> {
    const existing = this.userRepo.findByEmail(input.email);
    if (existing) throw new Error("Email already registered");

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = this.userRepo.create({
      id: uuid(),
      name: input.name,
      email: input.email,
      passwordHash,
      createdAt: new Date().toISOString(),
    });

    const token = this.signToken(user.id);
    return { token, user: this.toPublicUser(user) };
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const user = this.userRepo.findByEmail(input.email);
    if (!user) throw new Error("Invalid credentials");

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) throw new Error("Invalid credentials");

    const token = this.signToken(user.id);
    return { token, user: this.toPublicUser(user) };
  }

  verifyToken(token: string): string {
    const payload = jwt.verify(token, this.jwtSecret) as { sub: string };
    return payload.sub;
  }

  private signToken(userId: string): string {
    return jwt.sign({ sub: userId }, this.jwtSecret, { expiresIn: "7d" });
  }

  private toPublicUser(user: { id: string; name: string; email: string; avatar?: string; createdAt: string }): PublicUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };
  }
}
