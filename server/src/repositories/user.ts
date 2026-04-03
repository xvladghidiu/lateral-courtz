import type { User } from "@shared/types/user.js";
import type { IUserRepository } from "./types.js";

export class InMemoryUserRepository implements IUserRepository {
  private users: User[];

  constructor(seedData: User[]) {
    this.users = structuredClone(seedData);
  }

  findById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  findByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email === email);
  }

  create(user: User): User {
    this.users.push(structuredClone(user));
    return user;
  }
}
