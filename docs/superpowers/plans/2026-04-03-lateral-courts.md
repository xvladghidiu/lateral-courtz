# Lateral Courts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a basketball court booking web app where users discover courts, join pickup games or book full courts, and manage sessions — with a feed-based discovery UI inspired by premium dark-mode design.

**Architecture:** Monorepo with three packages: `shared/` (TypeScript types), `server/` (Fastify REST API with in-memory data store behind repository abstractions), `client/` (Vite + React SPA with TanStack Query). Services layer owns business logic; route handlers are thin. Repository interfaces enable future DB swap without touching business logic.

**Tech Stack:** Vite, React 18, TypeScript (strict), React Router v7, TanStack Query, Leaflet, Fastify, Pino, JWT/bcrypt, Vitest, GitHub Actions

---

## File Map

### Shared Types
```
shared/types/court.ts        — Court interface + CourtType, SurfaceType unions
shared/types/session.ts      — Session interface + SessionFormat, SessionMode, SessionStatus unions
shared/types/booking.ts      — Booking interface + BookingStatus union
shared/types/user.ts         — User, PublicUser, CreateUserInput, LoginInput interfaces
shared/types/review.ts       — Review, CreateReviewInput interfaces
shared/types/api.ts          — API response wrappers (ApiResponse, PaginatedResponse)
shared/types/index.ts        — Re-exports all types
```

### Server
```
server/src/server.ts                    — Fastify app bootstrap + plugin registration
server/src/config.ts                    — Environment config (port, JWT secret, auto-cancel offset)
server/src/repositories/types.ts        — Repository interfaces (ICourtRepo, ISessionRepo, etc.)
server/src/repositories/court.ts        — InMemoryCourtRepository
server/src/repositories/session.ts      — InMemorySessionRepository
server/src/repositories/booking.ts      — InMemoryBookingRepository
server/src/repositories/user.ts         — InMemoryUserRepository
server/src/repositories/review.ts       — InMemoryReviewRepository
server/src/services/auth.ts             — AuthService (register, login, verify)
server/src/services/court.ts            — CourtService (search, getById, updateRating)
server/src/services/session.ts          — SessionService (create, join, autoCancel, conflict check)
server/src/services/booking.ts          — BookingService (create, listByUser)
server/src/services/review.ts           — ReviewService (create, listByCourt)
server/src/routes/auth.ts               — POST /register, POST /login, GET /me
server/src/routes/courts.ts             — GET /courts, GET /courts/:id
server/src/routes/reviews.ts            — GET /courts/:id/reviews, POST /courts/:id/reviews
server/src/routes/sessions.ts           — GET /courts/:id/sessions, POST /sessions, POST /sessions/:id/join
server/src/routes/bookings.ts           — GET /users/me/bookings, GET /users/me/sessions
server/src/schemas/auth.ts              — JSON Schemas for auth endpoints
server/src/schemas/court.ts             — JSON Schemas for court endpoints
server/src/schemas/session.ts           — JSON Schemas for session endpoints
server/src/schemas/review.ts            — JSON Schemas for review endpoints
server/src/middleware/auth.ts           — JWT verification preHandler
server/src/data/courts.json             — Seed data: 6 courts
server/src/data/users.json              — Seed data: 3 users
server/src/data/sessions.json           — Seed data: 5 sessions
server/src/data/reviews.json            — Seed data: 10 reviews
```

### Client
```
client/src/main.tsx                     — App entry point (QueryClient, Router)
client/src/App.tsx                      — Route definitions
client/src/styles/global.css            — CSS variables, grain overlay, ambient glows, base styles
client/src/styles/components.css        — Shared component styles (cards, pills, badges)
client/src/api/client.ts                — Typed fetch wrapper with auth header injection
client/src/api/courts.ts                — Court API functions
client/src/api/sessions.ts             — Session API functions
client/src/api/auth.ts                  — Auth API functions
client/src/api/reviews.ts              — Review API functions
client/src/api/bookings.ts             — Booking API functions
client/src/context/AuthContext.tsx       — Auth state, login/logout/register, token management
client/src/hooks/useCourts.ts           — TanStack Query hooks for courts
client/src/hooks/useSessions.ts         — TanStack Query hooks for sessions
client/src/hooks/useReviews.ts          — TanStack Query hooks for reviews
client/src/hooks/useBookings.ts         — TanStack Query hooks for bookings
client/src/components/Header.tsx        — Glass nav: brand dot, nav pills, avatar
client/src/components/Header.css
client/src/components/PlayerSlots.tsx    — Filled/empty slot visualization
client/src/components/PlayerSlots.css
client/src/components/LiveGameCard.tsx   — Open game card with slots + join CTA
client/src/components/LiveGameCard.css
client/src/components/CourtCard.tsx      — Court grid card with court-lines imagery
client/src/components/CourtCard.css
client/src/components/StatCard.tsx       — Bento stat card
client/src/components/StatCard.css
client/src/components/MapPin.tsx         — Leaflet custom marker (price + stem + dot)
client/src/components/FilterBar.tsx      — Chip-based filter row
client/src/components/FilterBar.css
client/src/components/Toast.tsx          — Error/success toast notification
client/src/components/Toast.css
client/src/components/Skeleton.tsx       — Skeleton shimmer components
client/src/components/Skeleton.css
client/src/components/ReviewCard.tsx     — Single review display
client/src/components/BottomTabs.tsx     — Mobile tab bar
client/src/components/BottomTabs.css
client/src/pages/Discover.tsx           — Home feed: hero map, stats, live games, court grid
client/src/pages/Discover.css
client/src/pages/FullMap.tsx            — Expanded map view
client/src/pages/FullMap.css
client/src/pages/CourtDetails.tsx       — Court info, sessions, reviews
client/src/pages/CourtDetails.css
client/src/pages/CreateSession.tsx      — Session creation form
client/src/pages/CreateSession.css
client/src/pages/SessionDetails.tsx     — Session info, player list, join CTA
client/src/pages/SessionDetails.css
client/src/pages/Checkout.tsx           — Mock payment form
client/src/pages/Checkout.css
client/src/pages/Login.tsx              — Login form
client/src/pages/Register.tsx           — Register form
client/src/pages/Auth.css               — Shared auth page styles
client/src/pages/Dashboard.tsx          — User bookings, created sessions
client/src/pages/Dashboard.css
```

### Config / CI
```
package.json                            — Root: workspaces, concurrently scripts
tsconfig.base.json                      — Shared strict TS config
client/package.json                     — Client deps
client/tsconfig.json                    — Extends base, JSX + DOM
client/vite.config.ts                   — Proxy /api to server, path aliases
server/package.json                     — Server deps
server/tsconfig.json                    — Extends base, Node
.github/workflows/ci.yml               — Lint + typecheck + test + build
.gitignore
.eslintrc.cjs
README.md
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.base.json`, `.gitignore`, `.eslintrc.cjs`
- Create: `shared/types/index.ts` (empty re-export placeholder)
- Create: `server/package.json`, `server/tsconfig.json`
- Create: `client/package.json`, `client/tsconfig.json`, `client/vite.config.ts`, `client/index.html`

- [ ] **Step 1: Initialize git repo**

```bash
cd /Users/vladghidiu/werk/Lateral_booking
git init
```

- [ ] **Step 2: Create root package.json**

```json
{
  "name": "lateral-courts",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "concurrently -n server,client -c blue,green \"npm run dev -w server\" \"npm run dev -w client\"",
    "build": "npm run build -w server && npm run build -w client",
    "test": "npm run test -w server && npm run test -w client",
    "lint": "eslint . --ext .ts,.tsx",
    "typecheck": "npm run typecheck -w server && npm run typecheck -w client"
  },
  "workspaces": [
    "shared",
    "server",
    "client"
  ],
  "devDependencies": {
    "concurrently": "^9.1.0",
    "eslint": "^9.0.0",
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 3: Create tsconfig.base.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

- [ ] **Step 4: Create shared/package.json and shared/types/index.ts**

`shared/package.json`:
```json
{
  "name": "@lateral-courts/shared",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "types/index.ts",
  "types": "types/index.ts"
}
```

`shared/types/index.ts`:
```typescript
// Type exports will be added as models are defined
export {};
```

- [ ] **Step 5: Create server/package.json and server/tsconfig.json**

`server/package.json`:
```json
{
  "name": "@lateral-courts/server",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@fastify/cors": "^10.0.0",
    "@lateral-courts/shared": "*",
    "bcrypt": "^5.1.1",
    "fastify": "^5.2.0",
    "jsonwebtoken": "^9.0.2",
    "uuid": "^11.1.0"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/jsonwebtoken": "^9.0.7",
    "@types/node": "^22.0.0",
    "@types/uuid": "^10.0.0",
    "tsx": "^4.19.0",
    "vitest": "^3.1.0"
  }
}
```

`server/tsconfig.json`:
```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "lib": ["ES2022"],
    "types": ["node"],
    "paths": {
      "@shared/*": ["../shared/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "../shared" }]
}
```

- [ ] **Step 6: Create client package.json, tsconfig, vite config, index.html**

`client/package.json`:
```json
{
  "name": "@lateral-courts/client",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@lateral-courts/shared": "*",
    "@tanstack/react-query": "^5.65.0",
    "leaflet": "^1.9.4",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-leaflet": "^5.0.0",
    "react-router-dom": "^7.1.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/react": "^16.1.0",
    "@types/leaflet": "^1.9.16",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "jsdom": "^26.0.0",
    "vitest": "^3.1.0"
  }
}
```

`client/tsconfig.json`:
```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "outDir": "dist",
    "noEmit": true,
    "paths": {
      "@shared/*": ["../shared/*"],
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "../shared" }]
}
```

`client/vite.config.ts`:
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "../shared"),
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
```

`client/index.html`:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Lateral Courts</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Create .gitignore and .eslintrc.cjs**

`.gitignore`:
```
node_modules/
dist/
.env
.env.local
*.log
.DS_Store
.superpowers/
```

`.eslintrc.cjs`:
```javascript
module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  extends: [
    "eslint:recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  rules: {
    "no-unused-vars": "off",
  },
};
```

- [ ] **Step 8: Install dependencies**

```bash
npm install
```

- [ ] **Step 9: Commit scaffolding**

```bash
git add -A
git commit -m "chore: scaffold monorepo with shared, server, and client packages"
```

---

## Task 2: Shared Types

**Files:**
- Create: `shared/types/court.ts`, `shared/types/session.ts`, `shared/types/booking.ts`, `shared/types/user.ts`, `shared/types/review.ts`, `shared/types/api.ts`
- Modify: `shared/types/index.ts`

- [ ] **Step 1: Create court types**

`shared/types/court.ts`:
```typescript
export type CourtType = "indoor" | "outdoor";
export type SurfaceType = "hardwood" | "asphalt" | "rubber";

export interface Court {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: CourtType;
  surface: SurfaceType;
  amenities: string[];
  photos: string[];
  pricePerPlayerPerHour: number;
  rating: number;
  reviewCount: number;
}
```

- [ ] **Step 2: Create session types**

`shared/types/session.ts`:
```typescript
export type SessionFormat = "5v5" | "3v3";
export type SessionMode = "open" | "private";
export type SessionStatus = "filling" | "confirmed" | "cancelled" | "completed";

export const MAX_PLAYERS: Record<SessionFormat, number> = {
  "5v5": 10,
  "3v3": 6,
};

export interface Session {
  id: string;
  courtId: string;
  createdBy: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  format: SessionFormat;
  mode: SessionMode;
  maxPlayers: number;
  players: string[];
  status: SessionStatus;
  autoConfirmDeadline: string;
}

export interface CreateSessionInput {
  courtId: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  format: SessionFormat;
  mode: SessionMode;
}
```

- [ ] **Step 3: Create booking types**

`shared/types/booking.ts`:
```typescript
export type BookingStatus = "confirmed" | "cancelled";

export interface Booking {
  id: string;
  sessionId: string;
  userId: string;
  amountPaid: number;
  status: BookingStatus;
  createdAt: string;
}
```

- [ ] **Step 4: Create user types**

`shared/types/user.ts`:
```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  createdAt: string;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
```

- [ ] **Step 5: Create review types**

`shared/types/review.ts`:
```typescript
export interface Review {
  id: string;
  courtId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CreateReviewInput {
  rating: number;
  comment: string;
}
```

- [ ] **Step 6: Create API response types**

`shared/types/api.ts`:
```typescript
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
```

- [ ] **Step 7: Update index.ts to re-export everything**

`shared/types/index.ts`:
```typescript
export * from "./court.js";
export * from "./session.js";
export * from "./booking.js";
export * from "./user.js";
export * from "./review.js";
export * from "./api.js";
```

- [ ] **Step 8: Commit**

```bash
git add shared/
git commit -m "feat: add shared TypeScript types for all domain models"
```

---

## Task 3: Server — Repository Interfaces & In-Memory Implementations

**Files:**
- Create: `server/src/repositories/types.ts`
- Create: `server/src/repositories/court.ts`
- Create: `server/src/repositories/user.ts`
- Create: `server/src/repositories/session.ts`
- Create: `server/src/repositories/booking.ts`
- Create: `server/src/repositories/review.ts`
- Create: `server/src/data/courts.json`, `server/src/data/users.json`, `server/src/data/sessions.json`, `server/src/data/reviews.json`
- Test: `server/src/repositories/__tests__/court.test.ts`, `session.test.ts`

- [ ] **Step 1: Create repository interfaces**

`server/src/repositories/types.ts`:
```typescript
import type { Court, CourtType, SurfaceType } from "@shared/types/court.js";
import type { Session } from "@shared/types/session.js";
import type { Booking } from "@shared/types/booking.js";
import type { User } from "@shared/types/user.js";
import type { Review } from "@shared/types/review.js";

export interface CourtSearchParams {
  query?: string;
  type?: CourtType;
  surface?: SurfaceType;
  bounds?: { north: number; south: number; east: number; west: number };
}

export interface ICourtRepository {
  findAll(params: CourtSearchParams): Court[];
  findById(id: string): Court | undefined;
  updateRating(id: string, rating: number, reviewCount: number): void;
}

export interface IUserRepository {
  findById(id: string): User | undefined;
  findByEmail(email: string): User | undefined;
  create(user: User): User;
}

export interface ISessionRepository {
  findById(id: string): Session | undefined;
  findByCourtAndDate(courtId: string, date: string): Session[];
  findByStatus(status: string): Session[];
  findByPlayer(userId: string): Session[];
  findByCreator(userId: string): Session[];
  create(session: Session): Session;
  update(session: Session): Session;
}

export interface IBookingRepository {
  findByUser(userId: string): Booking[];
  findBySession(sessionId: string): Booking[];
  create(booking: Booking): Booking;
  update(booking: Booking): Booking;
}

export interface IReviewRepository {
  findByCourt(courtId: string): Review[];
  create(review: Review): Review;
}
```

- [ ] **Step 2: Create seed data files**

`server/src/data/courts.json`:
```json
[
  {
    "id": "court-1",
    "name": "Downtown Sports Center",
    "address": "123 Main St",
    "lat": 40.7128,
    "lng": -74.006,
    "type": "indoor",
    "surface": "hardwood",
    "amenities": ["lights", "parking", "lockers", "water"],
    "photos": [],
    "pricePerPlayerPerHour": 8,
    "rating": 4.7,
    "reviewCount": 23
  },
  {
    "id": "court-2",
    "name": "Riverside Courts",
    "address": "45 River Rd",
    "lat": 40.7180,
    "lng": -73.998,
    "type": "outdoor",
    "surface": "asphalt",
    "amenities": ["lights", "water"],
    "photos": [],
    "pricePerPlayerPerHour": 6,
    "rating": 4.2,
    "reviewCount": 15
  },
  {
    "id": "court-3",
    "name": "Eastside Community Gym",
    "address": "789 Oak Ave",
    "lat": 40.7200,
    "lng": -73.985,
    "type": "indoor",
    "surface": "rubber",
    "amenities": ["lockers", "water", "showers"],
    "photos": [],
    "pricePerPlayerPerHour": 10,
    "rating": 4.9,
    "reviewCount": 41
  },
  {
    "id": "court-4",
    "name": "Park District Courts",
    "address": "22 Park Blvd",
    "lat": 40.7250,
    "lng": -74.015,
    "type": "outdoor",
    "surface": "asphalt",
    "amenities": [],
    "photos": [],
    "pricePerPlayerPerHour": 5,
    "rating": 3.8,
    "reviewCount": 8
  },
  {
    "id": "court-5",
    "name": "West Loop Athletic Club",
    "address": "500 W Madison St",
    "lat": 40.7100,
    "lng": -74.020,
    "type": "indoor",
    "surface": "hardwood",
    "amenities": ["lights", "parking", "lockers", "showers", "water"],
    "photos": [],
    "pricePerPlayerPerHour": 12,
    "rating": 4.5,
    "reviewCount": 30
  },
  {
    "id": "court-6",
    "name": "Lakeshore Rec Center",
    "address": "800 Lake Shore Dr",
    "lat": 40.7300,
    "lng": -73.990,
    "type": "indoor",
    "surface": "hardwood",
    "amenities": ["lights", "parking", "water"],
    "photos": [],
    "pricePerPlayerPerHour": 7,
    "rating": 4.3,
    "reviewCount": 18
  }
]
```

`server/src/data/users.json`:
```json
[
  {
    "id": "user-1",
    "name": "Alex Rivera",
    "email": "alex@example.com",
    "passwordHash": "$2b$10$placeholder",
    "createdAt": "2026-01-15T10:00:00Z"
  },
  {
    "id": "user-2",
    "name": "Jordan Chen",
    "email": "jordan@example.com",
    "passwordHash": "$2b$10$placeholder",
    "createdAt": "2026-02-01T14:00:00Z"
  },
  {
    "id": "user-3",
    "name": "Sam Parker",
    "email": "sam@example.com",
    "passwordHash": "$2b$10$placeholder",
    "createdAt": "2026-03-10T09:00:00Z"
  }
]
```

`server/src/data/sessions.json`:
```json
[
  {
    "id": "session-1",
    "courtId": "court-1",
    "createdBy": "user-1",
    "date": "2026-04-03",
    "startTime": "19:00",
    "durationMinutes": 120,
    "format": "5v5",
    "mode": "open",
    "maxPlayers": 10,
    "players": ["user-1", "user-2", "user-3"],
    "status": "filling",
    "autoConfirmDeadline": "2026-04-03T17:00:00Z"
  },
  {
    "id": "session-2",
    "courtId": "court-1",
    "createdBy": "user-2",
    "date": "2026-04-03",
    "startTime": "19:00",
    "durationMinutes": 60,
    "format": "3v3",
    "mode": "open",
    "maxPlayers": 6,
    "players": ["user-2", "user-1", "user-3"],
    "status": "filling",
    "autoConfirmDeadline": "2026-04-03T17:00:00Z"
  },
  {
    "id": "session-3",
    "courtId": "court-2",
    "createdBy": "user-3",
    "date": "2026-04-03",
    "startTime": "18:30",
    "durationMinutes": 90,
    "format": "5v5",
    "mode": "open",
    "maxPlayers": 10,
    "players": ["user-3"],
    "status": "filling",
    "autoConfirmDeadline": "2026-04-03T16:30:00Z"
  },
  {
    "id": "session-4",
    "courtId": "court-4",
    "createdBy": "user-1",
    "date": "2026-04-03",
    "startTime": "20:00",
    "durationMinutes": 120,
    "format": "5v5",
    "mode": "private",
    "maxPlayers": 10,
    "players": ["user-1", "user-2"],
    "status": "filling",
    "autoConfirmDeadline": "2026-04-03T18:00:00Z"
  },
  {
    "id": "session-5",
    "courtId": "court-5",
    "createdBy": "user-2",
    "date": "2026-04-04",
    "startTime": "17:00",
    "durationMinutes": 60,
    "format": "3v3",
    "mode": "open",
    "maxPlayers": 6,
    "players": ["user-2"],
    "status": "filling",
    "autoConfirmDeadline": "2026-04-04T15:00:00Z"
  }
]
```

`server/src/data/reviews.json`:
```json
[
  { "id": "rev-1", "courtId": "court-1", "userId": "user-1", "rating": 5, "comment": "Best indoor court in the area. Hardwood is in great condition.", "createdAt": "2026-03-01T10:00:00Z" },
  { "id": "rev-2", "courtId": "court-1", "userId": "user-2", "rating": 4, "comment": "Great facility, parking can be tight on weekends.", "createdAt": "2026-03-05T14:00:00Z" },
  { "id": "rev-3", "courtId": "court-2", "userId": "user-3", "rating": 4, "comment": "Nice outdoor courts. Gets hot in summer but the lights are great for evening games.", "createdAt": "2026-02-20T18:00:00Z" },
  { "id": "rev-4", "courtId": "court-2", "userId": "user-1", "rating": 4, "comment": "Good asphalt surface. Bring your own water.", "createdAt": "2026-03-12T09:00:00Z" },
  { "id": "rev-5", "courtId": "court-3", "userId": "user-2", "rating": 5, "comment": "Rubber court is easy on the knees. Locker rooms are clean.", "createdAt": "2026-03-15T11:00:00Z" },
  { "id": "rev-6", "courtId": "court-3", "userId": "user-3", "rating": 5, "comment": "Top-notch community gym. Staff is friendly.", "createdAt": "2026-03-18T16:00:00Z" },
  { "id": "rev-7", "courtId": "court-4", "userId": "user-1", "rating": 4, "comment": "Basic but works. Free parking nearby.", "createdAt": "2026-02-28T08:00:00Z" },
  { "id": "rev-8", "courtId": "court-4", "userId": "user-2", "rating": 3, "comment": "Surface is a bit rough. Could use maintenance.", "createdAt": "2026-03-20T19:00:00Z" },
  { "id": "rev-9", "courtId": "court-5", "userId": "user-3", "rating": 5, "comment": "Premium facility. Worth the price.", "createdAt": "2026-03-22T12:00:00Z" },
  { "id": "rev-10", "courtId": "court-6", "userId": "user-1", "rating": 4, "comment": "Good location, nice hardwood. Gets busy on weekday evenings.", "createdAt": "2026-03-25T17:00:00Z" }
]
```

- [ ] **Step 3: Write failing test for InMemoryCourtRepository**

`server/src/repositories/__tests__/court.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryCourtRepository } from "../court.js";
import type { Court } from "@shared/types/court.js";

const seedCourts: Court[] = [
  {
    id: "c1",
    name: "Indoor Arena",
    address: "100 Main St",
    lat: 40.71,
    lng: -74.0,
    type: "indoor",
    surface: "hardwood",
    amenities: ["lights"],
    photos: [],
    pricePerPlayerPerHour: 8,
    rating: 4.5,
    reviewCount: 10,
  },
  {
    id: "c2",
    name: "Outdoor Park",
    address: "200 Park Ave",
    lat: 40.72,
    lng: -73.99,
    type: "outdoor",
    surface: "asphalt",
    amenities: [],
    photos: [],
    pricePerPlayerPerHour: 5,
    rating: 3.8,
    reviewCount: 5,
  },
];

describe("InMemoryCourtRepository", () => {
  let repo: InMemoryCourtRepository;

  beforeEach(() => {
    repo = new InMemoryCourtRepository(seedCourts);
  });

  it("returns all courts with empty params", () => {
    const result = repo.findAll({});
    expect(result).toHaveLength(2);
  });

  it("filters by type", () => {
    const result = repo.findAll({ type: "indoor" });
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe("c1");
  });

  it("filters by query (name search)", () => {
    const result = repo.findAll({ query: "park" });
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe("c2");
  });

  it("filters by bounds", () => {
    const result = repo.findAll({
      bounds: { north: 40.715, south: 40.705, east: -73.99, west: -74.01 },
    });
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe("c1");
  });

  it("finds court by id", () => {
    expect(repo.findById("c1")?.name).toBe("Indoor Arena");
    expect(repo.findById("nonexistent")).toBeUndefined();
  });

  it("updates rating", () => {
    repo.updateRating("c1", 4.8, 12);
    const court = repo.findById("c1");
    expect(court?.rating).toBe(4.8);
    expect(court?.reviewCount).toBe(12);
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

```bash
cd server && npx vitest run src/repositories/__tests__/court.test.ts
```
Expected: FAIL — cannot find `../court.js`

- [ ] **Step 5: Implement InMemoryCourtRepository**

`server/src/repositories/court.ts`:
```typescript
import type { Court } from "@shared/types/court.js";
import type { CourtSearchParams, ICourtRepository } from "./types.js";

export class InMemoryCourtRepository implements ICourtRepository {
  private courts: Court[];

  constructor(seedData: Court[]) {
    this.courts = structuredClone(seedData);
  }

  findAll(params: CourtSearchParams): Court[] {
    let results = this.courts;

    if (params.query) {
      const q = params.query.toLowerCase();
      results = results.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q),
      );
    }

    if (params.type) {
      results = results.filter((c) => c.type === params.type);
    }

    if (params.surface) {
      results = results.filter((c) => c.surface === params.surface);
    }

    if (params.bounds) {
      const { north, south, east, west } = params.bounds;
      results = results.filter(
        (c) =>
          c.lat <= north && c.lat >= south && c.lng <= east && c.lng >= west,
      );
    }

    return results;
  }

  findById(id: string): Court | undefined {
    return this.courts.find((c) => c.id === id);
  }

  updateRating(id: string, rating: number, reviewCount: number): void {
    const court = this.courts.find((c) => c.id === id);
    if (!court) return;
    court.rating = rating;
    court.reviewCount = reviewCount;
  }
}
```

- [ ] **Step 6: Run test to verify it passes**

```bash
npx vitest run src/repositories/__tests__/court.test.ts
```
Expected: all 6 tests PASS

- [ ] **Step 7: Write failing test for InMemorySessionRepository**

`server/src/repositories/__tests__/session.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { InMemorySessionRepository } from "../session.js";
import type { Session } from "@shared/types/session.js";

const seed: Session[] = [
  {
    id: "s1",
    courtId: "c1",
    createdBy: "u1",
    date: "2026-04-03",
    startTime: "19:00",
    durationMinutes: 120,
    format: "5v5",
    mode: "open",
    maxPlayers: 10,
    players: ["u1", "u2"],
    status: "filling",
    autoConfirmDeadline: "2026-04-03T17:00:00Z",
  },
  {
    id: "s2",
    courtId: "c1",
    createdBy: "u2",
    date: "2026-04-04",
    startTime: "18:00",
    durationMinutes: 60,
    format: "3v3",
    mode: "open",
    maxPlayers: 6,
    players: ["u2"],
    status: "filling",
    autoConfirmDeadline: "2026-04-04T16:00:00Z",
  },
];

describe("InMemorySessionRepository", () => {
  let repo: InMemorySessionRepository;

  beforeEach(() => {
    repo = new InMemorySessionRepository(seed);
  });

  it("finds by id", () => {
    expect(repo.findById("s1")?.format).toBe("5v5");
    expect(repo.findById("nope")).toBeUndefined();
  });

  it("finds by court and date", () => {
    const result = repo.findByCourtAndDate("c1", "2026-04-03");
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe("s1");
  });

  it("finds by player", () => {
    const result = repo.findByPlayer("u2");
    expect(result).toHaveLength(2);
  });

  it("finds by creator", () => {
    const result = repo.findByCreator("u1");
    expect(result).toHaveLength(1);
  });

  it("creates a session", () => {
    const newSession: Session = {
      id: "s3",
      courtId: "c2",
      createdBy: "u1",
      date: "2026-04-05",
      startTime: "20:00",
      durationMinutes: 90,
      format: "5v5",
      mode: "private",
      maxPlayers: 10,
      players: ["u1"],
      status: "filling",
      autoConfirmDeadline: "2026-04-05T18:00:00Z",
    };
    repo.create(newSession);
    expect(repo.findById("s3")).toBeDefined();
  });

  it("updates a session", () => {
    const session = repo.findById("s1")!;
    session.players.push("u3");
    repo.update(session);
    expect(repo.findById("s1")!.players).toContain("u3");
  });
});
```

- [ ] **Step 8: Run test to verify it fails**

```bash
npx vitest run src/repositories/__tests__/session.test.ts
```
Expected: FAIL — cannot find `../session.js`

- [ ] **Step 9: Implement InMemorySessionRepository**

`server/src/repositories/session.ts`:
```typescript
import type { Session } from "@shared/types/session.js";
import type { ISessionRepository } from "./types.js";

export class InMemorySessionRepository implements ISessionRepository {
  private sessions: Session[];

  constructor(seedData: Session[]) {
    this.sessions = structuredClone(seedData);
  }

  findById(id: string): Session | undefined {
    return this.sessions.find((s) => s.id === id);
  }

  findByCourtAndDate(courtId: string, date: string): Session[] {
    return this.sessions.filter(
      (s) => s.courtId === courtId && s.date === date,
    );
  }

  findByStatus(status: string): Session[] {
    return this.sessions.filter((s) => s.status === status);
  }

  findByPlayer(userId: string): Session[] {
    return this.sessions.filter((s) => s.players.includes(userId));
  }

  findByCreator(userId: string): Session[] {
    return this.sessions.filter((s) => s.createdBy === userId);
  }

  create(session: Session): Session {
    this.sessions.push(structuredClone(session));
    return session;
  }

  update(session: Session): Session {
    const index = this.sessions.findIndex((s) => s.id === session.id);
    if (index === -1) throw new Error(`Session ${session.id} not found`);
    this.sessions[index] = structuredClone(session);
    return session;
  }
}
```

- [ ] **Step 10: Run tests to verify they pass**

```bash
npx vitest run src/repositories/__tests__/
```
Expected: all tests PASS

- [ ] **Step 11: Implement remaining repositories (user, booking, review)**

`server/src/repositories/user.ts`:
```typescript
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
```

`server/src/repositories/booking.ts`:
```typescript
import type { Booking } from "@shared/types/booking.js";
import type { IBookingRepository } from "./types.js";

export class InMemoryBookingRepository implements IBookingRepository {
  private bookings: Booking[];

  constructor(seedData: Booking[] = []) {
    this.bookings = structuredClone(seedData);
  }

  findByUser(userId: string): Booking[] {
    return this.bookings.filter((b) => b.userId === userId);
  }

  findBySession(sessionId: string): Booking[] {
    return this.bookings.filter((b) => b.sessionId === sessionId);
  }

  create(booking: Booking): Booking {
    this.bookings.push(structuredClone(booking));
    return booking;
  }

  update(booking: Booking): Booking {
    const index = this.bookings.findIndex((b) => b.id === booking.id);
    if (index === -1) throw new Error(`Booking ${booking.id} not found`);
    this.bookings[index] = structuredClone(booking);
    return booking;
  }
}
```

`server/src/repositories/review.ts`:
```typescript
import type { Review } from "@shared/types/review.js";
import type { IReviewRepository } from "./types.js";

export class InMemoryReviewRepository implements IReviewRepository {
  private reviews: Review[];

  constructor(seedData: Review[]) {
    this.reviews = structuredClone(seedData);
  }

  findByCourt(courtId: string): Review[] {
    return this.reviews
      .filter((r) => r.courtId === courtId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }

  create(review: Review): Review {
    this.reviews.push(structuredClone(review));
    return review;
  }
}
```

- [ ] **Step 12: Run all repository tests**

```bash
npx vitest run src/repositories/__tests__/
```
Expected: all PASS

- [ ] **Step 13: Commit**

```bash
git add server/src/repositories/ server/src/data/
git commit -m "feat: add repository interfaces and in-memory implementations with seed data"
```

---

## Task 4: Server — Auth Service & Middleware

**Files:**
- Create: `server/src/config.ts`
- Create: `server/src/services/auth.ts`
- Create: `server/src/middleware/auth.ts`
- Test: `server/src/services/__tests__/auth.test.ts`

- [ ] **Step 1: Create config**

`server/src/config.ts`:
```typescript
export const config = {
  port: Number(process.env.PORT ?? 3001),
  jwtSecret: process.env.JWT_SECRET ?? "lateral-courts-dev-secret-change-me",
  autoCancelOffsetHours: Number(process.env.AUTO_CANCEL_OFFSET_HOURS ?? 2),
};
```

- [ ] **Step 2: Write failing test for AuthService**

`server/src/services/__tests__/auth.test.ts`:
```typescript
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
```

- [ ] **Step 3: Run test to verify it fails**

```bash
npx vitest run src/services/__tests__/auth.test.ts
```
Expected: FAIL — cannot find `../auth.js`

- [ ] **Step 4: Implement AuthService**

`server/src/services/auth.ts`:
```typescript
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
```

- [ ] **Step 5: Run test to verify it passes**

```bash
npx vitest run src/services/__tests__/auth.test.ts
```
Expected: all 6 tests PASS

- [ ] **Step 6: Implement auth middleware**

`server/src/middleware/auth.ts`:
```typescript
import type { FastifyRequest, FastifyReply } from "fastify";
import type { AuthService } from "../services/auth.js";

export function buildAuthMiddleware(authService: AuthService) {
  return async function authenticate(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const header = request.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return reply.status(401).send({ error: "Missing authorization token" });
    }

    const token = header.slice(7);
    try {
      const userId = authService.verifyToken(token);
      (request as FastifyRequest & { userId: string }).userId = userId;
    } catch {
      return reply.status(401).send({ error: "Invalid or expired token" });
    }
  };
}
```

- [ ] **Step 7: Commit**

```bash
git add server/src/config.ts server/src/services/ server/src/middleware/
git commit -m "feat: add auth service with JWT, bcrypt, and auth middleware"
```

---

## Task 5: Server — Session Service (Core Business Logic)

**Files:**
- Create: `server/src/services/session.ts`
- Test: `server/src/services/__tests__/session.test.ts`

- [ ] **Step 1: Write failing tests for SessionService**

`server/src/services/__tests__/session.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { SessionService } from "../session.js";
import { InMemorySessionRepository } from "../../repositories/session.js";
import { InMemoryCourtRepository } from "../../repositories/court.js";
import { InMemoryBookingRepository } from "../../repositories/booking.js";
import type { Court } from "@shared/types/court.js";
import type { Session } from "@shared/types/session.js";

const court: Court = {
  id: "c1",
  name: "Test Court",
  address: "1 Test St",
  lat: 40.71,
  lng: -74.0,
  type: "indoor",
  surface: "hardwood",
  amenities: [],
  photos: [],
  pricePerPlayerPerHour: 10,
  rating: 4.0,
  reviewCount: 5,
};

describe("SessionService", () => {
  let service: SessionService;
  let sessionRepo: InMemorySessionRepository;
  let courtRepo: InMemoryCourtRepository;
  let bookingRepo: InMemoryBookingRepository;

  beforeEach(() => {
    sessionRepo = new InMemorySessionRepository([]);
    courtRepo = new InMemoryCourtRepository([court]);
    bookingRepo = new InMemoryBookingRepository();
    service = new SessionService(sessionRepo, courtRepo, bookingRepo, 2);
  });

  it("creates a session and auto-joins creator", () => {
    const session = service.createSession("user-1", {
      courtId: "c1",
      date: "2026-04-10",
      startTime: "19:00",
      durationMinutes: 120,
      format: "5v5",
      mode: "open",
    });

    expect(session.createdBy).toBe("user-1");
    expect(session.players).toContain("user-1");
    expect(session.maxPlayers).toBe(10);
    expect(session.status).toBe("filling");
  });

  it("sets maxPlayers to 6 for 3v3", () => {
    const session = service.createSession("user-1", {
      courtId: "c1",
      date: "2026-04-10",
      startTime: "19:00",
      durationMinutes: 60,
      format: "3v3",
      mode: "open",
    });

    expect(session.maxPlayers).toBe(6);
  });

  it("rejects creation for nonexistent court", () => {
    expect(() =>
      service.createSession("user-1", {
        courtId: "nonexistent",
        date: "2026-04-10",
        startTime: "19:00",
        durationMinutes: 60,
        format: "5v5",
        mode: "open",
      }),
    ).toThrow("Court not found");
  });

  it("joins a session and creates a booking", () => {
    const session = service.createSession("user-1", {
      courtId: "c1",
      date: "2026-04-10",
      startTime: "19:00",
      durationMinutes: 60,
      format: "3v3",
      mode: "open",
    });

    const { session: updated, booking } = service.joinSession(
      session.id,
      "user-2",
    );

    expect(updated.players).toContain("user-2");
    expect(booking.userId).toBe("user-2");
    expect(booking.amountPaid).toBe(10); // $10/hr * 1hr
  });

  it("rejects joining a full session", () => {
    const session = service.createSession("u1", {
      courtId: "c1",
      date: "2026-04-10",
      startTime: "19:00",
      durationMinutes: 60,
      format: "3v3",
      mode: "open",
    });

    service.joinSession(session.id, "u2");
    service.joinSession(session.id, "u3");
    service.joinSession(session.id, "u4");
    service.joinSession(session.id, "u5");

    // Session is now 6/6 (u1 auto-joined + 5 joins)
    expect(() => service.joinSession(session.id, "u7")).toThrow("Session is full");
  });

  it("rejects duplicate join", () => {
    const session = service.createSession("u1", {
      courtId: "c1",
      date: "2026-04-10",
      startTime: "19:00",
      durationMinutes: 60,
      format: "5v5",
      mode: "open",
    });

    expect(() => service.joinSession(session.id, "u1")).toThrow(
      "Already in this session",
    );
  });

  it("confirms session when full", () => {
    const session = service.createSession("u1", {
      courtId: "c1",
      date: "2026-04-10",
      startTime: "19:00",
      durationMinutes: 60,
      format: "3v3",
      mode: "open",
    });

    service.joinSession(session.id, "u2");
    service.joinSession(session.id, "u3");
    service.joinSession(session.id, "u4");
    const { session: full } = service.joinSession(session.id, "u5");

    expect(full.status).toBe("confirmed");
  });

  it("cancels unfilled sessions past deadline", () => {
    const session = service.createSession("u1", {
      courtId: "c1",
      date: "2026-04-01",
      startTime: "10:00",
      durationMinutes: 60,
      format: "5v5",
      mode: "open",
    });

    // Deadline is 2hrs before start = 2026-04-01T08:00:00
    // Pretend current time is after deadline
    const cancelled = service.runAutoCancel(new Date("2026-04-01T09:00:00Z"));
    expect(cancelled).toHaveLength(1);
    expect(sessionRepo.findById(session.id)!.status).toBe("cancelled");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/services/__tests__/session.test.ts
```
Expected: FAIL

- [ ] **Step 3: Implement SessionService**

`server/src/services/session.ts`:
```typescript
import { v4 as uuid } from "uuid";
import { MAX_PLAYERS } from "@shared/types/session.js";
import type { Session, CreateSessionInput } from "@shared/types/session.js";
import type { Booking } from "@shared/types/booking.js";
import type {
  ISessionRepository,
  ICourtRepository,
  IBookingRepository,
} from "../repositories/types.js";

export class SessionService {
  constructor(
    private sessionRepo: ISessionRepository,
    private courtRepo: ICourtRepository,
    private bookingRepo: IBookingRepository,
    private autoCancelOffsetHours: number,
  ) {}

  createSession(userId: string, input: CreateSessionInput): Session {
    const court = this.courtRepo.findById(input.courtId);
    if (!court) throw new Error("Court not found");

    const maxPlayers = MAX_PLAYERS[input.format];
    const deadline = this.calculateDeadline(input.date, input.startTime);

    const session: Session = {
      id: uuid(),
      courtId: input.courtId,
      createdBy: userId,
      date: input.date,
      startTime: input.startTime,
      durationMinutes: input.durationMinutes,
      format: input.format,
      mode: input.mode,
      maxPlayers,
      players: [userId],
      status: "filling",
      autoConfirmDeadline: deadline,
    };

    this.sessionRepo.create(session);
    this.createBookingForPlayer(session, userId, court.pricePerPlayerPerHour);
    return session;
  }

  joinSession(
    sessionId: string,
    userId: string,
  ): { session: Session; booking: Booking } {
    const session = this.sessionRepo.findById(sessionId);
    if (!session) throw new Error("Session not found");
    if (session.status !== "filling") throw new Error("Session is not open");
    if (session.players.includes(userId)) throw new Error("Already in this session");
    if (session.players.length >= session.maxPlayers) throw new Error("Session is full");

    const court = this.courtRepo.findById(session.courtId);
    if (!court) throw new Error("Court not found");

    session.players.push(userId);

    if (session.players.length >= session.maxPlayers) {
      session.status = "confirmed";
    }

    this.sessionRepo.update(session);

    const booking = this.createBookingForPlayer(
      session,
      userId,
      court.pricePerPlayerPerHour,
    );

    return { session, booking };
  }

  runAutoCancel(now: Date): Session[] {
    const filling = this.sessionRepo.findByStatus("filling");
    const cancelled: Session[] = [];

    for (const session of filling) {
      const deadline = new Date(session.autoConfirmDeadline);
      if (now <= deadline) continue;

      session.status = "cancelled";
      this.sessionRepo.update(session);
      cancelled.push(session);
    }

    return cancelled;
  }

  private calculateDeadline(date: string, startTime: string): string {
    const start = new Date(`${date}T${startTime}:00Z`);
    start.setHours(start.getHours() - this.autoCancelOffsetHours);
    return start.toISOString();
  }

  private createBookingForPlayer(
    session: Session,
    userId: string,
    pricePerHour: number,
  ): Booking {
    const hours = session.durationMinutes / 60;
    const booking: Booking = {
      id: uuid(),
      sessionId: session.id,
      userId,
      amountPaid: pricePerHour * hours,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };

    return this.bookingRepo.create(booking);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/services/__tests__/session.test.ts
```
Expected: all 8 tests PASS

- [ ] **Step 5: Commit**

```bash
git add server/src/services/session.ts server/src/services/__tests__/session.test.ts
git commit -m "feat: add session service with create, join, auto-cancel, and conflict detection"
```

---

## Task 6: Server — Review & Court Services

**Files:**
- Create: `server/src/services/review.ts`, `server/src/services/court.ts`, `server/src/services/booking.ts`
- Test: `server/src/services/__tests__/review.test.ts`

- [ ] **Step 1: Write failing test for ReviewService**

`server/src/services/__tests__/review.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { ReviewService } from "../review.js";
import { InMemoryReviewRepository } from "../../repositories/review.js";
import { InMemoryCourtRepository } from "../../repositories/court.js";
import type { Court } from "@shared/types/court.js";

const court: Court = {
  id: "c1",
  name: "Test",
  address: "1 St",
  lat: 0,
  lng: 0,
  type: "indoor",
  surface: "hardwood",
  amenities: [],
  photos: [],
  pricePerPlayerPerHour: 10,
  rating: 0,
  reviewCount: 0,
};

describe("ReviewService", () => {
  let service: ReviewService;
  let reviewRepo: InMemoryReviewRepository;
  let courtRepo: InMemoryCourtRepository;

  beforeEach(() => {
    reviewRepo = new InMemoryReviewRepository([]);
    courtRepo = new InMemoryCourtRepository([court]);
    service = new ReviewService(reviewRepo, courtRepo);
  });

  it("creates a review and updates court rating", () => {
    service.addReview("c1", "u1", { rating: 5, comment: "Great!" });
    service.addReview("c1", "u2", { rating: 3, comment: "OK" });

    const reviews = reviewRepo.findByCourt("c1");
    expect(reviews).toHaveLength(2);

    const updatedCourt = courtRepo.findById("c1")!;
    expect(updatedCourt.rating).toBe(4);
    expect(updatedCourt.reviewCount).toBe(2);
  });

  it("rejects review for nonexistent court", () => {
    expect(() =>
      service.addReview("nope", "u1", { rating: 5, comment: "Test" }),
    ).toThrow("Court not found");
  });

  it("rejects rating outside 1-5 range", () => {
    expect(() =>
      service.addReview("c1", "u1", { rating: 0, comment: "Bad" }),
    ).toThrow("Rating must be between 1 and 5");

    expect(() =>
      service.addReview("c1", "u1", { rating: 6, comment: "Too good" }),
    ).toThrow("Rating must be between 1 and 5");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/services/__tests__/review.test.ts
```
Expected: FAIL

- [ ] **Step 3: Implement ReviewService**

`server/src/services/review.ts`:
```typescript
import { v4 as uuid } from "uuid";
import type { Review, CreateReviewInput } from "@shared/types/review.js";
import type { IReviewRepository, ICourtRepository } from "../repositories/types.js";

export class ReviewService {
  constructor(
    private reviewRepo: IReviewRepository,
    private courtRepo: ICourtRepository,
  ) {}

  addReview(courtId: string, userId: string, input: CreateReviewInput): Review {
    const court = this.courtRepo.findById(courtId);
    if (!court) throw new Error("Court not found");
    if (input.rating < 1 || input.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    const review = this.reviewRepo.create({
      id: uuid(),
      courtId,
      userId,
      rating: input.rating,
      comment: input.comment,
      createdAt: new Date().toISOString(),
    });

    this.recalculateCourtRating(courtId);
    return review;
  }

  listByCourt(courtId: string): Review[] {
    return this.reviewRepo.findByCourt(courtId);
  }

  private recalculateCourtRating(courtId: string): void {
    const reviews = this.reviewRepo.findByCourt(courtId);
    if (reviews.length === 0) return;

    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = Math.round((sum / reviews.length) * 10) / 10;
    this.courtRepo.updateRating(courtId, avg, reviews.length);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/services/__tests__/review.test.ts
```
Expected: all 3 tests PASS

- [ ] **Step 5: Implement CourtService and BookingService**

`server/src/services/court.ts`:
```typescript
import type { Court } from "@shared/types/court.js";
import type { CourtSearchParams, ICourtRepository } from "../repositories/types.js";

export class CourtService {
  constructor(private courtRepo: ICourtRepository) {}

  search(params: CourtSearchParams): Court[] {
    return this.courtRepo.findAll(params);
  }

  getById(id: string): Court {
    const court = this.courtRepo.findById(id);
    if (!court) throw new Error("Court not found");
    return court;
  }
}
```

`server/src/services/booking.ts`:
```typescript
import type { Booking } from "@shared/types/booking.js";
import type { Session } from "@shared/types/session.js";
import type { IBookingRepository, ISessionRepository } from "../repositories/types.js";

export class BookingService {
  constructor(
    private bookingRepo: IBookingRepository,
    private sessionRepo: ISessionRepository,
  ) {}

  listByUser(userId: string): Booking[] {
    return this.bookingRepo.findByUser(userId);
  }

  listSessionsByCreator(userId: string): Session[] {
    return this.sessionRepo.findByCreator(userId);
  }

  listSessionsByPlayer(userId: string): Session[] {
    return this.sessionRepo.findByPlayer(userId);
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add server/src/services/
git commit -m "feat: add review, court, and booking services"
```

---

## Task 7: Server — Fastify Routes & App Bootstrap

**Files:**
- Create: `server/src/schemas/auth.ts`, `server/src/schemas/court.ts`, `server/src/schemas/session.ts`, `server/src/schemas/review.ts`
- Create: `server/src/routes/auth.ts`, `server/src/routes/courts.ts`, `server/src/routes/sessions.ts`, `server/src/routes/reviews.ts`, `server/src/routes/bookings.ts`
- Create: `server/src/server.ts`

- [ ] **Step 1: Create JSON schemas for request/response validation**

`server/src/schemas/auth.ts`:
```typescript
export const registerSchema = {
  body: {
    type: "object",
    required: ["name", "email", "password"],
    properties: {
      name: { type: "string", minLength: 1 },
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 6 },
    },
  },
};

export const loginSchema = {
  body: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email" },
      password: { type: "string" },
    },
  },
};
```

`server/src/schemas/session.ts`:
```typescript
export const createSessionSchema = {
  body: {
    type: "object",
    required: ["courtId", "date", "startTime", "durationMinutes", "format", "mode"],
    properties: {
      courtId: { type: "string" },
      date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
      startTime: { type: "string", pattern: "^\\d{2}:\\d{2}$" },
      durationMinutes: { type: "number", enum: [30, 60, 90, 120] },
      format: { type: "string", enum: ["5v5", "3v3"] },
      mode: { type: "string", enum: ["open", "private"] },
    },
  },
};
```

`server/src/schemas/review.ts`:
```typescript
export const createReviewSchema = {
  body: {
    type: "object",
    required: ["rating", "comment"],
    properties: {
      rating: { type: "number", minimum: 1, maximum: 5 },
      comment: { type: "string", minLength: 1, maxLength: 1000 },
    },
  },
};
```

`server/src/schemas/court.ts`:
```typescript
export const courtQuerySchema = {
  querystring: {
    type: "object",
    properties: {
      query: { type: "string" },
      type: { type: "string", enum: ["indoor", "outdoor"] },
      surface: { type: "string", enum: ["hardwood", "asphalt", "rubber"] },
      north: { type: "number" },
      south: { type: "number" },
      east: { type: "number" },
      west: { type: "number" },
    },
  },
};
```

- [ ] **Step 2: Create route handlers**

`server/src/routes/auth.ts`:
```typescript
import type { FastifyInstance } from "fastify";
import type { AuthService } from "../services/auth.js";
import type { CreateUserInput, LoginInput } from "@shared/types/user.js";
import { registerSchema, loginSchema } from "../schemas/auth.js";
import type { IUserRepository } from "../repositories/types.js";

interface AuthRoutesDeps {
  authService: AuthService;
  userRepo: IUserRepository;
  authenticate: (req: any, reply: any) => Promise<void>;
}

export async function authRoutes(
  app: FastifyInstance,
  deps: AuthRoutesDeps,
): Promise<void> {
  app.post<{ Body: CreateUserInput }>(
    "/api/auth/register",
    { schema: registerSchema },
    async (request, reply) => {
      try {
        const result = await deps.authService.register(request.body);
        return reply.status(201).send({ data: result });
      } catch (err: any) {
        return reply.status(400).send({ error: err.message });
      }
    },
  );

  app.post<{ Body: LoginInput }>(
    "/api/auth/login",
    { schema: loginSchema },
    async (request, reply) => {
      try {
        const result = await deps.authService.login(request.body);
        return reply.send({ data: result });
      } catch (err: any) {
        return reply.status(401).send({ error: err.message });
      }
    },
  );

  app.get(
    "/api/auth/me",
    { preHandler: deps.authenticate },
    async (request, reply) => {
      const userId = (request as any).userId as string;
      const user = deps.userRepo.findById(userId);
      if (!user) return reply.status(404).send({ error: "User not found" });

      const { passwordHash, ...publicUser } = user;
      return reply.send({ data: publicUser });
    },
  );
}
```

`server/src/routes/courts.ts`:
```typescript
import type { FastifyInstance } from "fastify";
import type { CourtService } from "../services/court.js";
import type { CourtType, SurfaceType } from "@shared/types/court.js";
import { courtQuerySchema } from "../schemas/court.js";

interface CourtQuery {
  query?: string;
  type?: CourtType;
  surface?: SurfaceType;
  north?: number;
  south?: number;
  east?: number;
  west?: number;
}

export async function courtRoutes(
  app: FastifyInstance,
  deps: { courtService: CourtService },
): Promise<void> {
  app.get<{ Querystring: CourtQuery }>(
    "/api/courts",
    { schema: courtQuerySchema },
    async (request) => {
      const { query, type, surface, north, south, east, west } = request.query;
      const bounds =
        north != null && south != null && east != null && west != null
          ? { north, south, east, west }
          : undefined;

      const courts = deps.courtService.search({ query, type, surface, bounds });
      return { data: courts };
    },
  );

  app.get<{ Params: { id: string } }>(
    "/api/courts/:id",
    async (request, reply) => {
      try {
        const court = deps.courtService.getById(request.params.id);
        return { data: court };
      } catch {
        return reply.status(404).send({ error: "Court not found" });
      }
    },
  );
}
```

`server/src/routes/sessions.ts`:
```typescript
import type { FastifyInstance } from "fastify";
import type { SessionService } from "../services/session.js";
import type { ISessionRepository } from "../repositories/types.js";
import type { CreateSessionInput } from "@shared/types/session.js";
import { createSessionSchema } from "../schemas/session.js";

interface SessionRoutesDeps {
  sessionService: SessionService;
  sessionRepo: ISessionRepository;
  authenticate: (req: any, reply: any) => Promise<void>;
}

export async function sessionRoutes(
  app: FastifyInstance,
  deps: SessionRoutesDeps,
): Promise<void> {
  app.get<{ Params: { id: string }; Querystring: { date?: string } }>(
    "/api/courts/:id/sessions",
    async (request) => {
      const { id } = request.params;
      const { date } = request.query;
      const sessions = date
        ? deps.sessionRepo.findByCourtAndDate(id, date)
        : deps.sessionRepo.findByCourtAndDate(id, new Date().toISOString().split("T")[0]!);
      return { data: sessions };
    },
  );

  app.post<{ Body: CreateSessionInput }>(
    "/api/sessions",
    { schema: createSessionSchema, preHandler: deps.authenticate },
    async (request, reply) => {
      try {
        const userId = (request as any).userId as string;
        const session = deps.sessionService.createSession(userId, request.body);
        return reply.status(201).send({ data: session });
      } catch (err: any) {
        return reply.status(400).send({ error: err.message });
      }
    },
  );

  app.post<{ Params: { id: string } }>(
    "/api/sessions/:id/join",
    { preHandler: deps.authenticate },
    async (request, reply) => {
      try {
        const userId = (request as any).userId as string;
        const result = deps.sessionService.joinSession(
          request.params.id,
          userId,
        );
        return reply.send({ data: result });
      } catch (err: any) {
        return reply.status(400).send({ error: err.message });
      }
    },
  );
}
```

`server/src/routes/reviews.ts`:
```typescript
import type { FastifyInstance } from "fastify";
import type { ReviewService } from "../services/review.js";
import type { CreateReviewInput } from "@shared/types/review.js";
import { createReviewSchema } from "../schemas/review.js";

interface ReviewRoutesDeps {
  reviewService: ReviewService;
  authenticate: (req: any, reply: any) => Promise<void>;
}

export async function reviewRoutes(
  app: FastifyInstance,
  deps: ReviewRoutesDeps,
): Promise<void> {
  app.get<{ Params: { id: string } }>(
    "/api/courts/:id/reviews",
    async (request) => {
      const reviews = deps.reviewService.listByCourt(request.params.id);
      return { data: reviews };
    },
  );

  app.post<{ Params: { id: string }; Body: CreateReviewInput }>(
    "/api/courts/:id/reviews",
    { schema: createReviewSchema, preHandler: deps.authenticate },
    async (request, reply) => {
      try {
        const userId = (request as any).userId as string;
        const review = deps.reviewService.addReview(
          request.params.id,
          userId,
          request.body,
        );
        return reply.status(201).send({ data: review });
      } catch (err: any) {
        return reply.status(400).send({ error: err.message });
      }
    },
  );
}
```

`server/src/routes/bookings.ts`:
```typescript
import type { FastifyInstance } from "fastify";
import type { BookingService } from "../services/booking.js";

interface BookingRoutesDeps {
  bookingService: BookingService;
  authenticate: (req: any, reply: any) => Promise<void>;
}

export async function bookingRoutes(
  app: FastifyInstance,
  deps: BookingRoutesDeps,
): Promise<void> {
  app.get(
    "/api/users/me/bookings",
    { preHandler: deps.authenticate },
    async (request) => {
      const userId = (request as any).userId as string;
      const bookings = deps.bookingService.listByUser(userId);
      return { data: bookings };
    },
  );

  app.get(
    "/api/users/me/sessions",
    { preHandler: deps.authenticate },
    async (request) => {
      const userId = (request as any).userId as string;
      const sessions = deps.bookingService.listSessionsByCreator(userId);
      return { data: sessions };
    },
  );
}
```

- [ ] **Step 3: Create server.ts — Fastify bootstrap**

`server/src/server.ts`:
```typescript
import Fastify from "fastify";
import cors from "@fastify/cors";
import { config } from "./config.js";
import { InMemoryCourtRepository } from "./repositories/court.js";
import { InMemoryUserRepository } from "./repositories/user.js";
import { InMemorySessionRepository } from "./repositories/session.js";
import { InMemoryBookingRepository } from "./repositories/booking.js";
import { InMemoryReviewRepository } from "./repositories/review.js";
import { AuthService } from "./services/auth.js";
import { CourtService } from "./services/court.js";
import { SessionService } from "./services/session.js";
import { ReviewService } from "./services/review.js";
import { BookingService } from "./services/booking.js";
import { buildAuthMiddleware } from "./middleware/auth.js";
import { authRoutes } from "./routes/auth.js";
import { courtRoutes } from "./routes/courts.js";
import { sessionRoutes } from "./routes/sessions.js";
import { reviewRoutes } from "./routes/reviews.js";
import { bookingRoutes } from "./routes/bookings.js";

import courtsData from "./data/courts.json" with { type: "json" };
import usersData from "./data/users.json" with { type: "json" };
import sessionsData from "./data/sessions.json" with { type: "json" };
import reviewsData from "./data/reviews.json" with { type: "json" };

async function buildApp() {
  const app = Fastify({ logger: true });
  await app.register(cors, { origin: true });

  // Repositories
  const courtRepo = new InMemoryCourtRepository(courtsData as any);
  const userRepo = new InMemoryUserRepository(usersData as any);
  const sessionRepo = new InMemorySessionRepository(sessionsData as any);
  const bookingRepo = new InMemoryBookingRepository();
  const reviewRepo = new InMemoryReviewRepository(reviewsData as any);

  // Services
  const authService = new AuthService(userRepo, config.jwtSecret);
  const courtService = new CourtService(courtRepo);
  const sessionService = new SessionService(
    sessionRepo,
    courtRepo,
    bookingRepo,
    config.autoCancelOffsetHours,
  );
  const reviewService = new ReviewService(reviewRepo, courtRepo);
  const bookingService = new BookingService(bookingRepo, sessionRepo);

  // Middleware
  const authenticate = buildAuthMiddleware(authService);

  // Routes
  await authRoutes(app, { authService, userRepo, authenticate });
  await courtRoutes(app, { courtService });
  await sessionRoutes(app, { sessionService, sessionRepo, authenticate });
  await reviewRoutes(app, { reviewService, authenticate });
  await bookingRoutes(app, { bookingService, authenticate });

  return app;
}

async function start() {
  const app = await buildApp();
  await app.listen({ port: config.port, host: "0.0.0.0" });
}

start();

export { buildApp };
```

- [ ] **Step 4: Verify server starts**

```bash
cd server && npx tsx src/server.ts
```
Expected: Fastify listening on port 3001. Kill with Ctrl+C.

- [ ] **Step 5: Run all server tests**

```bash
npx vitest run
```
Expected: all tests PASS

- [ ] **Step 6: Commit**

```bash
git add server/src/schemas/ server/src/routes/ server/src/server.ts
git commit -m "feat: add Fastify routes, JSON schemas, and server bootstrap"
```

---

## Task 8: Client — Foundation (Entry, Router, API Client, Auth Context)

**Files:**
- Create: `client/src/main.tsx`, `client/src/App.tsx`
- Create: `client/src/styles/global.css`
- Create: `client/src/api/client.ts`, `client/src/api/auth.ts`
- Create: `client/src/context/AuthContext.tsx`

- [ ] **Step 1: Create global CSS with design system**

`client/src/styles/global.css`:
```css
:root {
  --bg: #050505;
  --surface: #0c0c0e;
  --surface-2: #111114;
  --surface-3: #161619;
  --border: rgba(255, 255, 255, 0.05);
  --border-hover: rgba(255, 255, 255, 0.1);
  --text: #f0f0f0;
  --text-2: #8a8a96;
  --text-3: #404048;
  --red: #e63328;
  --red-soft: rgba(230, 51, 40, 0.12);
  --orange: #e8720d;
  --orange-soft: rgba(232, 114, 13, 0.12);
  --amber: #d4a012;
  --green: #1db954;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-pill: 100px;
}

*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: "Inter", -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  font-feature-settings: "cv01", "cv02", "cv03", "cv04";
  overflow-x: hidden;
}

/* Grain overlay */
body::after {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  opacity: 0.015;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 128px;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  font-family: inherit;
  cursor: pointer;
  border: none;
  background: none;
  color: inherit;
}

input {
  font-family: inherit;
  color: inherit;
  background: none;
  border: none;
  outline: none;
}
```

- [ ] **Step 2: Create API client**

`client/src/api/client.ts`:
```typescript
const BASE_URL = "/api";

interface FetchOptions {
  method?: string;
  body?: unknown;
  token?: string | null;
}

export async function apiClient<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { method = "GET", body, token } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error ?? "Request failed");
  }

  return json.data as T;
}
```

`client/src/api/auth.ts`:
```typescript
import { apiClient } from "./client.js";
import type { AuthResponse, PublicUser } from "@shared/types/index.js";

export function registerUser(name: string, email: string, password: string) {
  return apiClient<AuthResponse>("/auth/register", {
    method: "POST",
    body: { name, email, password },
  });
}

export function loginUser(email: string, password: string) {
  return apiClient<AuthResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function fetchCurrentUser(token: string) {
  return apiClient<PublicUser>("/auth/me", { token });
}
```

- [ ] **Step 3: Create AuthContext**

`client/src/context/AuthContext.tsx`:
```typescript
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { PublicUser } from "@shared/types/index.js";
import { fetchCurrentUser, loginUser, registerUser } from "../api/auth.js";

interface AuthState {
  user: PublicUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

const TOKEN_KEY = "lateral_courts_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem(TOKEN_KEY),
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    fetchCurrentUser(token)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginUser(email, password);
    localStorage.setItem(TOKEN_KEY, result.token);
    setToken(result.token);
    setUser(result.user);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const result = await registerUser(name, email, password);
      localStorage.setItem(TOKEN_KEY, result.token);
      setToken(result.token);
      setUser(result.user);
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
```

- [ ] **Step 4: Create App.tsx with route definitions**

`client/src/App.tsx`:
```typescript
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext.js";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function Placeholder({ name }: { name: string }) {
  return (
    <div style={{ padding: 40, color: "var(--text-2)" }}>
      {name} — coming soon
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Placeholder name="Discover" />} />
            <Route path="/map" element={<Placeholder name="Full Map" />} />
            <Route path="/courts/:id" element={<Placeholder name="Court Details" />} />
            <Route path="/sessions/new" element={<Placeholder name="Create Session" />} />
            <Route path="/sessions/:id" element={<Placeholder name="Session Details" />} />
            <Route path="/checkout/:sessionId" element={<Placeholder name="Checkout" />} />
            <Route path="/login" element={<Placeholder name="Login" />} />
            <Route path="/register" element={<Placeholder name="Register" />} />
            <Route path="/dashboard" element={<Placeholder name="Dashboard" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

- [ ] **Step 5: Create main.tsx entry point**

`client/src/main.tsx`:
```typescript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.js";
import "./styles/global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 6: Verify client starts**

```bash
cd client && npx vite
```
Expected: Vite dev server running on localhost:5173. Kill with Ctrl+C.

- [ ] **Step 7: Commit**

```bash
git add client/src/
git commit -m "feat: add client foundation — routing, API client, auth context, global styles"
```

---

## Task 9: Client — API Hooks & Remaining API Functions

**Files:**
- Create: `client/src/api/courts.ts`, `client/src/api/sessions.ts`, `client/src/api/reviews.ts`, `client/src/api/bookings.ts`
- Create: `client/src/hooks/useCourts.ts`, `client/src/hooks/useSessions.ts`, `client/src/hooks/useReviews.ts`, `client/src/hooks/useBookings.ts`

- [ ] **Step 1: Create API functions**

`client/src/api/courts.ts`:
```typescript
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
```

`client/src/api/sessions.ts`:
```typescript
import { apiClient } from "./client.js";
import type { Session, CreateSessionInput, Booking } from "@shared/types/index.js";

export function fetchCourtSessions(courtId: string, date?: string) {
  const qs = date ? `?date=${date}` : "";
  return apiClient<Session[]>(`/courts/${courtId}/sessions${qs}`);
}

export function createSession(input: CreateSessionInput, token: string) {
  return apiClient<Session>("/sessions", {
    method: "POST",
    body: input,
    token,
  });
}

export function joinSession(sessionId: string, token: string) {
  return apiClient<{ session: Session; booking: Booking }>(
    `/sessions/${sessionId}/join`,
    { method: "POST", token },
  );
}
```

`client/src/api/reviews.ts`:
```typescript
import { apiClient } from "./client.js";
import type { Review, CreateReviewInput } from "@shared/types/index.js";

export function fetchReviews(courtId: string) {
  return apiClient<Review[]>(`/courts/${courtId}/reviews`);
}

export function postReview(
  courtId: string,
  input: CreateReviewInput,
  token: string,
) {
  return apiClient<Review>(`/courts/${courtId}/reviews`, {
    method: "POST",
    body: input,
    token,
  });
}
```

`client/src/api/bookings.ts`:
```typescript
import { apiClient } from "./client.js";
import type { Booking, Session } from "@shared/types/index.js";

export function fetchMyBookings(token: string) {
  return apiClient<Booking[]>("/users/me/bookings", { token });
}

export function fetchMySessions(token: string) {
  return apiClient<Session[]>("/users/me/sessions", { token });
}
```

- [ ] **Step 2: Create TanStack Query hooks**

`client/src/hooks/useCourts.ts`:
```typescript
import { useQuery } from "@tanstack/react-query";
import { fetchCourts, fetchCourt } from "../api/courts.js";

export function useCourts(params: Parameters<typeof fetchCourts>[0] = {}) {
  return useQuery({
    queryKey: ["courts", params],
    queryFn: () => fetchCourts(params),
  });
}

export function useCourt(id: string) {
  return useQuery({
    queryKey: ["courts", id],
    queryFn: () => fetchCourt(id),
    enabled: !!id,
  });
}
```

`client/src/hooks/useSessions.ts`:
```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCourtSessions, createSession, joinSession } from "../api/sessions.js";
import { useAuth } from "../context/AuthContext.js";

export function useCourtSessions(courtId: string, date?: string) {
  return useQuery({
    queryKey: ["sessions", courtId, date],
    queryFn: () => fetchCourtSessions(courtId, date),
    enabled: !!courtId,
  });
}

export function useCreateSession() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Parameters<typeof createSession>[0]) =>
      createSession(input, token!),
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
```

`client/src/hooks/useReviews.ts`:
```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchReviews, postReview } from "../api/reviews.js";
import { useAuth } from "../context/AuthContext.js";
import type { CreateReviewInput } from "@shared/types/index.js";

export function useReviews(courtId: string) {
  return useQuery({
    queryKey: ["reviews", courtId],
    queryFn: () => fetchReviews(courtId),
    enabled: !!courtId,
  });
}

export function usePostReview(courtId: string) {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateReviewInput) =>
      postReview(courtId, input, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", courtId] });
      queryClient.invalidateQueries({ queryKey: ["courts"] });
    },
  });
}
```

`client/src/hooks/useBookings.ts`:
```typescript
import { useQuery } from "@tanstack/react-query";
import { fetchMyBookings, fetchMySessions } from "../api/bookings.js";
import { useAuth } from "../context/AuthContext.js";

export function useMyBookings() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["bookings", "mine"],
    queryFn: () => fetchMyBookings(token!),
    enabled: !!token,
  });
}

export function useMySessions() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["sessions", "mine"],
    queryFn: () => fetchMySessions(token!),
    enabled: !!token,
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add client/src/api/ client/src/hooks/
git commit -m "feat: add API functions and TanStack Query hooks for all endpoints"
```

---

## Task 10: Client — Shared Components (Header, PlayerSlots, LiveGameCard, CourtCard, StatCard)

**Files:**
- Create: All component files listed in the file map under `client/src/components/`

This is a large task. Each component should be built with its CSS module, following the design direction from the spec (dark glass aesthetic, grain, ambient glow, player slot visualization, pulsing indicators).

- [ ] **Step 1: Build Header component** — Glass nav with brand dot, nav pills, avatar. Use `backdrop-filter: blur(40px)`, sticky positioning.

- [ ] **Step 2: Build PlayerSlots component** — Takes `filled: number` and `total: number`. Renders individual slot blocks. Red for early fill, orange when > 70% full. Pulsing dot indicator.

- [ ] **Step 3: Build LiveGameCard component** — Uses PlayerSlots. Shows format (5v5/3v3), court name, meta, time, price, "Join game" / "Last spot" CTA. Card hover with translateY lift.

- [ ] **Step 4: Build CourtCard component** — Grid card with simulated court-line imagery (CSS pseudo-elements), indoor/outdoor badge, rating, name, meta, amenity tags, price.

- [ ] **Step 5: Build StatCard component** — Bento stat card. Value + label + icon. Top-edge gradient highlight.

- [ ] **Step 6: Build FilterBar component** — Chip-based filter row. Active chip styling. Separator dots. Count display.

- [ ] **Step 7: Build Skeleton, Toast, ReviewCard, BottomTabs components** — Skeleton shimmer for loading states. Toast for error/success notifications. ReviewCard for review display. BottomTabs for mobile navigation.

- [ ] **Step 8: Verify all components render** — Create a temporary test route that renders each component with mock data.

- [ ] **Step 9: Commit**

```bash
git add client/src/components/
git commit -m "feat: add shared UI components — header, player slots, cards, filters, skeletons, toast"
```

---

## Task 11: Client — Discover Page (Home Feed)

**Files:**
- Create: `client/src/pages/Discover.tsx`, `client/src/pages/Discover.css`
- Modify: `client/src/App.tsx` — replace Placeholder with Discover

- [ ] **Step 1: Build Discover page** — Hero map section (Leaflet, compact height, faded bottom edge, floating search bar, map pins). Stats row (4 StatCards). "Open games" horizontal scroll (LiveGameCards). "Courts near you" 3-column grid (CourtCards). All data from useCourts/useSessions hooks. Loading skeleton states.

- [ ] **Step 2: Wire up route** — Replace `<Placeholder name="Discover" />` with `<Discover />` in App.tsx.

- [ ] **Step 3: Verify full flow** — Run both server and client (`npm run dev` from root). Browse discover page, see courts from seed data on map and in grid.

- [ ] **Step 4: Commit**

```bash
git add client/src/pages/Discover.tsx client/src/pages/Discover.css client/src/App.tsx
git commit -m "feat: add Discover page with hero map, live games, and court grid"
```

---

## Task 12: Client — Auth Pages (Login, Register)

**Files:**
- Create: `client/src/pages/Login.tsx`, `client/src/pages/Register.tsx`, `client/src/pages/Auth.css`
- Modify: `client/src/App.tsx`

- [ ] **Step 1: Build Login page** — Email + password form. Dark aesthetic matching design system. Error state via toast. Redirects to `/` on success (or to the page the user came from via location state).

- [ ] **Step 2: Build Register page** — Name + email + password form. Same styling. Link to login. Redirects on success.

- [ ] **Step 3: Wire up routes in App.tsx**

- [ ] **Step 4: Verify auth flow** — Register a new user, log in, see user avatar in header. Log out.

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/Login.tsx client/src/pages/Register.tsx client/src/pages/Auth.css client/src/App.tsx
git commit -m "feat: add login and register pages with auth flow"
```

---

## Task 13: Client — Court Details Page

**Files:**
- Create: `client/src/pages/CourtDetails.tsx`, `client/src/pages/CourtDetails.css`
- Modify: `client/src/App.tsx`

- [ ] **Step 1: Build CourtDetails page** — Court header (name, address, type, surface, rating, amenities). Date picker for sessions. Two CTAs: "Create a Game" and "Book Full Court" (link to /sessions/new?courtId=X&mode=open or private). List of existing open sessions (with PlayerSlots). Reviews section (ReviewCards + add review form if authenticated).

- [ ] **Step 2: Wire up route and link from CourtCard**

- [ ] **Step 3: Verify** — Click a court from Discover → see details, sessions, reviews.

- [ ] **Step 4: Commit**

```bash
git add client/src/pages/CourtDetails.tsx client/src/pages/CourtDetails.css client/src/App.tsx
git commit -m "feat: add court details page with sessions and reviews"
```

---

## Task 14: Client — Create Session & Session Details

**Files:**
- Create: `client/src/pages/CreateSession.tsx`, `client/src/pages/CreateSession.css`
- Create: `client/src/pages/SessionDetails.tsx`, `client/src/pages/SessionDetails.css`
- Modify: `client/src/App.tsx`

- [ ] **Step 1: Build CreateSession page** — Form: date picker, time picker, duration selector (30min increments), format toggle (5v5/3v3), mode toggle (open/private). Price calculation display. Submit calls useCreateSession hook. Redirects to session details on success.

- [ ] **Step 2: Build SessionDetails page** — Session info, court name, time, format, mode. PlayerSlots visualization. "Join Game" button (for open sessions, unauthenticated redirects to login). Auto-cancel deadline countdown. Share link. Creator view shows fill status.

- [ ] **Step 3: Wire up routes**

- [ ] **Step 4: Verify** — Create a session from court details → see session details → join as another user.

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/CreateSession.tsx client/src/pages/CreateSession.css client/src/pages/SessionDetails.tsx client/src/pages/SessionDetails.css client/src/App.tsx
git commit -m "feat: add create session and session details pages"
```

---

## Task 15: Client — Checkout Page

**Files:**
- Create: `client/src/pages/Checkout.tsx`, `client/src/pages/Checkout.css`
- Modify: `client/src/App.tsx`

- [ ] **Step 1: Build Checkout page** — Session summary (court, time, format, price). Mock payment form (card number, expiry, CVV — no validation, just visual). "Confirm & Pay" button calls useJoinSession. Success state shows confirmation with booking details. Error state shows toast.

- [ ] **Step 2: Wire up route and link from SessionDetails "Join" button**

- [ ] **Step 3: Verify end-to-end** — Browse → Court → Session → Checkout → Confirmed booking.

- [ ] **Step 4: Commit**

```bash
git add client/src/pages/Checkout.tsx client/src/pages/Checkout.css client/src/App.tsx
git commit -m "feat: add checkout page with mock payment flow"
```

---

## Task 16: Client — Dashboard & Full Map

**Files:**
- Create: `client/src/pages/Dashboard.tsx`, `client/src/pages/Dashboard.css`
- Create: `client/src/pages/FullMap.tsx`, `client/src/pages/FullMap.css`
- Modify: `client/src/App.tsx`

- [ ] **Step 1: Build Dashboard page** — Two sections: "My Bookings" (upcoming sessions the user joined) and "My Sessions" (sessions the user created, with fill status via PlayerSlots). Empty state if no data.

- [ ] **Step 2: Build FullMap page** — Full-viewport Leaflet map. Court pins with price labels. Clicking a pin shows a popup with court name, rating, open games count, "View court" link. Back button to return to Discover.

- [ ] **Step 3: Wire up routes**

- [ ] **Step 4: Verify** — Dashboard shows bookings after joining a game. Full map shows all courts.

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/Dashboard.tsx client/src/pages/Dashboard.css client/src/pages/FullMap.tsx client/src/pages/FullMap.css client/src/App.tsx
git commit -m "feat: add dashboard and full map pages"
```

---

## Task 17: Client — Responsive Layout & Mobile Polish

**Files:**
- Modify: Various component CSS files to add responsive breakpoints
- Modify: `client/src/App.tsx` — add BottomTabs for mobile

- [ ] **Step 1: Add mobile breakpoints to all page CSS** — Single-column court grid on mobile. Stacked stats. Horizontal scroll preserved for live games. Compact header.

- [ ] **Step 2: Wire up BottomTabs** — Show on mobile only (CSS media query). Tabs: Discover, Games, Bookings, Profile. Active indicator dot.

- [ ] **Step 3: Add List/Map toggle on mobile Discover** — Segmented control above courts section. Toggles between court list and compact map.

- [ ] **Step 4: Verify on mobile viewport** — Use browser dev tools to test 390px width. All pages usable with thumb navigation.

- [ ] **Step 5: Commit**

```bash
git add client/src/
git commit -m "feat: add responsive layout and mobile bottom tab navigation"
```

---

## Task 18: CI Pipeline & README

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `README.md`

- [ ] **Step 1: Create GitHub Actions CI config**

`.github/workflows/ci.yml`:
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test
      - run: npm run build
```

- [ ] **Step 2: Create README.md**

```markdown
# Lateral Courts

Basketball court booking app. Find courts, join pickup games, or book the full court.

## Quick Start

```bash
npm install
npm run dev
```

Client runs on http://localhost:5173, server on http://localhost:3001.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start client + server in parallel |
| `npm run build` | Production build |
| `npm run test` | Run all tests |
| `npm run lint` | Lint all files |
| `npm run typecheck` | Type-check all packages |

## Architecture

Monorepo with three packages:

- **shared/** — TypeScript types shared between client and server
- **server/** — Fastify REST API with in-memory data store
- **client/** — Vite + React SPA with TanStack Query

## Tech Stack

React, TypeScript, Vite, Fastify, TanStack Query, Leaflet, Vitest
```

- [ ] **Step 3: Verify CI config locally**

```bash
npm run lint && npm run typecheck && npm run test && npm run build
```
Expected: all pass

- [ ] **Step 4: Commit**

```bash
git add .github/ README.md
git commit -m "chore: add GitHub Actions CI pipeline and README"
```

---

## Summary

| Task | Description | Key Files |
|------|-------------|-----------|
| 1 | Project scaffolding | package.json, tsconfigs, vite config |
| 2 | Shared types | shared/types/*.ts |
| 3 | Repository interfaces + in-memory implementations | server/src/repositories/ |
| 4 | Auth service + middleware | server/src/services/auth.ts, middleware/auth.ts |
| 5 | Session service (core logic) | server/src/services/session.ts |
| 6 | Review, court, booking services | server/src/services/*.ts |
| 7 | Fastify routes + server bootstrap | server/src/routes/, server.ts |
| 8 | Client foundation (router, API, auth) | client/src/main.tsx, App.tsx, api/, context/ |
| 9 | API hooks | client/src/hooks/*.ts |
| 10 | Shared UI components | client/src/components/*.tsx |
| 11 | Discover page (home feed) | client/src/pages/Discover.tsx |
| 12 | Auth pages | client/src/pages/Login.tsx, Register.tsx |
| 13 | Court details page | client/src/pages/CourtDetails.tsx |
| 14 | Create session + session details | client/src/pages/CreateSession.tsx, SessionDetails.tsx |
| 15 | Checkout page | client/src/pages/Checkout.tsx |
| 16 | Dashboard + full map | client/src/pages/Dashboard.tsx, FullMap.tsx |
| 17 | Responsive + mobile polish | Various CSS files |
| 18 | CI pipeline + README | .github/workflows/ci.yml, README.md |
