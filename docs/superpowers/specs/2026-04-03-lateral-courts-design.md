# Lateral Courts — Design Spec

Basketball court booking web app where users discover courts, join pickup games, book full courts, and manage sessions.

## Product Scope

**Lateral Courts** is a basketball-focused booking platform with two booking modes:

1. **Join a game** — A user creates an open session (date, time, duration, 5v5 or 3v3). Others browse and join. Player count fills up (e.g., 7/10 for 5v5). Full = confirmed.
2. **Book the full court** — A user reserves the entire court privately. They're responsible for filling all player slots. The session isn't confirmed until all spots are filled.

**Pricing:** Per-player fee always. Each player pays a fixed rate per hour regardless of booking mode (e.g., $8/player/hr). All pricing is mocked on the backend.

**Auto-cancel:** If a session isn't full by a configurable deadline (e.g., 2 hours before start), it's automatically cancelled and the court opens back up.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite + React + TypeScript |
| Routing | React Router v7 |
| Server state | TanStack Query |
| Maps | Leaflet + React Leaflet (free, no API key) |
| Backend | Fastify + TypeScript |
| Validation | Fastify JSON Schema |
| Logging | Pino (built into Fastify) |
| Auth | JWT (bcrypt for passwords) |
| Data | In-memory store with JSON seed files |
| Testing | Vitest (client + server) |
| CI | GitHub Actions |

## Project Structure

```
lateral-booking/
├── shared/
│   └── types/
│       ├── court.ts
│       ├── session.ts
│       ├── booking.ts
│       ├── user.ts
│       └── review.ts
├── client/
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── api/              # Typed fetch wrappers
│       ├── components/       # Shared UI components
│       ├── pages/            # Route pages
│       ├── hooks/            # useAuth, useCourts, etc.
│       ├── context/          # AuthContext
│       └── types/            # Client-specific types
├── server/
│   ├── tsconfig.json
│   └── src/
│       ├── server.ts
│       ├── routes/           # courts, sessions, bookings, auth, reviews
│       ├── schemas/          # JSON Schema definitions
│       ├── data/             # Seed data JSON files
│       ├── middleware/       # Auth middleware
│       └── services/         # Business logic
├── tsconfig.base.json        # Shared strict config
├── package.json              # Root: concurrently runs client + server
├── .github/workflows/        # CI pipeline
└── README.md
```

**TypeScript:** Strict mode enabled across all projects. `tsconfig.base.json` at root, extended by client and server configs. `shared/types/` referenced by both via path aliases.

## Data Models

### Court

```typescript
interface Court {
  id: string;
  name: string;                    // "Downtown Sports Center"
  address: string;
  lat: number;
  lng: number;
  type: "indoor" | "outdoor";
  surface: "hardwood" | "asphalt" | "rubber";
  amenities: string[];             // ["lights", "parking", "lockers", "water"]
  photos: string[];                // URLs
  pricePerPlayerPerHour: number;   // e.g., 8.00
  rating: number;                  // Average from reviews
  reviewCount: number;
}
```

### Session

```typescript
interface Session {
  id: string;
  courtId: string;
  createdBy: string;               // userId
  date: string;                    // "2026-04-05"
  startTime: string;               // "18:00"
  durationMinutes: number;         // 60, 90, 120 (30min increments)
  format: "5v5" | "3v3";
  mode: "open" | "private";        // open = join a game, private = full court
  maxPlayers: number;              // Derived: 10 for 5v5, 6 for 3v3. Set automatically from format.
  players: string[];               // userIds of confirmed players
  status: "filling" | "confirmed" | "cancelled" | "completed";
  autoConfirmDeadline: string;     // ISO datetime
}
```

### Booking

```typescript
interface Booking {
  id: string;
  sessionId: string;
  userId: string;
  amountPaid: number;              // pricePerPlayerPerHour * (duration / 60)
  status: "confirmed" | "cancelled";
  createdAt: string;
}
```

### User

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  createdAt: string;
}
```

### Review

```typescript
interface Review {
  id: string;
  courtId: string;
  userId: string;
  rating: number;                  // 1-5
  comment: string;
  createdAt: string;
}
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | No | Create account |
| POST | /api/auth/login | No | Login, returns JWT |
| GET | /api/auth/me | Yes | Get current user |
| GET | /api/courts | No | Search/browse courts. Query params: `query`, `type`, `surface`, `bounds` (for map viewport) |
| GET | /api/courts/:id | No | Court details |
| GET | /api/courts/:id/reviews | No | List reviews for a court |
| POST | /api/courts/:id/reviews | Yes | Add a review |
| GET | /api/courts/:id/sessions | No | Sessions for a court. Query params: `date` |
| POST | /api/sessions | Yes | Create a session (open or private) |
| POST | /api/sessions/:id/join | Yes | Join a session (triggers mock payment) |
| GET | /api/users/me/bookings | Yes | User's booking history |
| GET | /api/users/me/sessions | Yes | Sessions the user created |

**Design notes:**
- `bounds` param on `/api/courts` enables map-viewport filtering as the user pans.
- Sessions are the central entity. A booking is a player's link to a session.
- `autoConfirmDeadline` is calculated at creation: session start time minus a configurable offset.
- All mutation endpoints require JWT auth via Authorization header.
- Fastify JSON Schema validation on all request/response bodies.

## Pages & User Flows

### Pages

1. **Discover (Home)** — Feed layout: hero map at top (compact, expandable) → stats bar (live games, almost full, courts nearby, cheapest) → horizontal scroll of open games with player slot visualization → court grid with imagery. Search bar floating on the hero map.

2. **Full Map View** — Expanded Leaflet map filling the viewport. Court pins with price labels. Clicking a pin shows a popup card with quick details and "View court" CTA.

3. **Court Details** — Court info (name, address, type, surface, amenities, photos, rating). Date picker showing available sessions. Two CTAs: "Create a Game" and "Book Full Court". List of existing open sessions. Reviews section at bottom.

4. **Create Session** — Form: date, start time, duration (30min increments), format (5v5/3v3), mode (open/private). Shows calculated price per player. Creator is auto-joined as first player on submit.

5. **Session Details** — Court, time, format, player slot visualization, "Join Game" button for open sessions. Auto-cancel deadline displayed. Creator can share a link.

6. **Checkout / Join** — Confirm your spot. Session details + price summary. Mock payment form. Confirms booking on submit.

7. **Auth Pages** — Login, Register. Simple forms, same dark aesthetic.

8. **User Dashboard** — Upcoming bookings, past sessions, sessions you created and their fill status.

### Core Flow

```
Discover feed
  → See open games → "Join" → Checkout → Confirmed
  → Browse court grid → Court Details
    → "Create a Game" → Create Session → You're player 1
    → "Book Full Court" → Create Session (private) → Share link to fill spots
    → See existing sessions → "Join" → Checkout → Confirmed
  → Expand hero map → Full map view → Click pin → Court Details
Profile
  → Upcoming bookings, created sessions, fill status
```

## UI Design Direction

### Layout
- **Feed-based discovery** — vertical scroll, not split view
- Hero map at top fading into content below
- Stats bento bar for at-a-glance pulse
- Horizontal scroll for live/open games (primary action surface)
- 3-column court grid with card imagery

### Visual Language
- **Near-black background** (#050505) with subtle grain overlay (SVG noise texture)
- **Ambient glow** — soft red/orange radial gradients for warmth and depth
- **Glass morphism** — `backdrop-filter: blur()` on header, map pins, overlays
- **Inter font** across the board. Instrument Serif italic for display/editorial elements.
- **Red (#e63328) / orange (#e8720d) accent palette** — used sparingly for live indicators, CTAs, brand dot
- **Amber (#d4a012)** for ratings only

### Key Design Elements
- **Player slot visualization** — individual blocks per player spot, filled/empty. Makes session fill state immediately tangible. Color shifts from red (open) to orange (almost full).
- **Pulsing ring animation** on live session indicators — expanding border ring, not just opacity blink.
- **Breathing brand dot** — the red dot in the logo gently pulses with glow.
- **Map pins with stems** — price label → thin gradient line → glowing dot.
- **Card hover** — `translateY(-4px)` lift with expanded box-shadow. Subtle gradient overlay on active cards.
- **Top-edge highlight** on cards — `linear-gradient` on `::after` for glass edge illusion.

### Responsive
- **Desktop:** Full feed layout with 3-column grid, horizontal scroll for live games.
- **Mobile:** Same feed structure. Compact map card at top (rounded, inset). Horizontal scroll for live games. Single-column court list. Bottom tab bar (Discover, Games, Bookings, Profile).
- **List/Map toggle** on mobile for courts section.

## Error, Loading & Empty States

- **Loading:** Skeleton screens matching card shapes with shimmer animation. No spinners.
- **Empty states:**
  - No courts found: "No courts in this area. Try zooming out or adjusting filters."
  - No open games: "No open games right now. Create one!" with CTA.
  - No bookings: "You haven't joined any games yet. Find one nearby."
- **Error states:** Toast notifications (bottom-right desktop, top mobile) with retry action. Non-blocking.
- **Optimistic updates:** Joining a game fills the slot immediately in the UI. Server rejection reverts and shows error toast.

## Auth

- **Register:** Name, email, password form.
- **Login:** Email + password. JWT returned, stored in localStorage.
- **Protected routes:** Creating sessions, joining games, posting reviews require auth.
- **Public routes:** Browsing courts, viewing details/reviews, viewing sessions.
- **Auth guard:** Unauthenticated users clicking a protected action redirect to login, then back to the original action after auth.

## Testing Strategy

**Vitest** for all tests, both client and server.

**Server tests (unit + integration):**
- Booking conflict detection (overlapping time slots)
- Auto-cancel logic (unfilled sessions past deadline)
- Session fill validation (can't join a full session, can't exceed maxPlayers)
- Auth middleware (valid JWT passes, invalid rejects)
- Review creation and basic moderation

**Client tests (unit + component):**
- Court list rendering with mock data
- Filter behavior (toggling indoor/outdoor, 5v5/3v3)
- Join game flow (slot fills, checkout process)
- Auth flow (login form, protected route redirect)

## CI / Release

**GitHub Actions pipeline** on every push and PR:
1. Lint (ESLint)
2. Type-check (`tsc --noEmit` for client and server)
3. Test (Vitest)
4. Build (Vite production build + server compile)

**Release process:**
- Semantic versioning via git tags
- CHANGELOG.md maintained manually
- Production bundle via `vite build`

## Local Development

Single command to start both client and server:

```bash
npm install
npm run dev
```

Uses `concurrently` to run Vite dev server (client) and Fastify dev server (server with tsx/ts-node) in parallel. Client proxies API requests to the server via Vite config.

## Out of Scope (Future)

- Real payment processing (Stripe integration)
- Real database (PostgreSQL/MongoDB)
- Real-time updates (WebSocket for live player count changes)
- Push notifications for session fill status
- Admin panel for court management
- Social features (player profiles, friend lists, team formation)
- Deployment to Vercel/Render (optional stretch goal)
