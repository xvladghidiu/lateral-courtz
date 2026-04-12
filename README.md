# Lateral Courts

A full-stack basketball court discovery and booking platform. Find nearby courts, browse details and reviews, and book pickup sessions — all from an interactive map interface.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, React Router v7, TanStack Query v5 |
| Styling | Tailwind CSS v4, glass morphism design system |
| Maps | Leaflet + react-leaflet (CartoDB tiles, Nominatim geocoding) |
| Backend | Fastify 5, JWT auth, bcrypt |
| Shared | TypeScript types across client and server |
| Build | Vite, npm workspaces, concurrently |
| Testing | Vitest, React Testing Library |

## Features

- **Court Discovery** — Interactive map with custom basketball pins, search by address/neighborhood, filter by type (indoor/outdoor) and surface (hardwood/asphalt/rubber)
- **Court Details** — Photos, amenities, pricing, location map, and player reviews with star ratings
- **Session Booking** — Create or join pickup games (5v5, 3v3), choose date/time/duration, automatic price-per-player calculation
- **Shot Clock Row** — Live "filling" sessions with countdown to auto-confirm deadline
- **Auth** — Register/login with JWT, persistent sessions via localStorage
- **Dashboard** — Upcoming and past bookings at a glance

## Project Structure

```
lateral-courts/
  client/          React SPA (Vite)
  server/          Fastify REST API
  shared/          TypeScript types shared across packages
```

## Getting Started

### Prerequisites

- Node.js >= 20
- npm >= 10

### Install & Run

```bash
# Install all dependencies (root, client, server, shared)
npm install

# Start both client and server in dev mode
npm run dev
```

- **Client** — http://localhost:5173
- **Server** — http://localhost:3001

The Vite dev server proxies `/api` requests to the backend automatically.

### Environment Variables

All optional — sensible defaults are built in.

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server listen port |
| `JWT_SECRET` | `lateral-courts-dev-secret-change-me` | JWT signing key (change in production) |
| `AUTO_CANCEL_OFFSET_HOURS` | `2` | Hours before session start to auto-confirm |

### Other Commands

```bash
npm run build        # Build server and client for production
npm test             # Run all tests
npm run typecheck    # Type-check both packages
npm run lint         # Lint all .ts/.tsx files
```

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Get JWT token |
| `GET` | `/api/auth/me` | Current user (auth required) |
| `GET` | `/api/courts` | Search/list courts |
| `GET` | `/api/courts/:id` | Court details |
| `GET` | `/api/courts/:id/sessions` | Sessions for a court |
| `GET` | `/api/courts/:id/reviews` | Reviews for a court |
| `POST` | `/api/courts/:id/reviews` | Add review (auth required) |
| `GET` | `/api/sessions` | List sessions |
| `POST` | `/api/sessions` | Create session (auth required) |
| `GET` | `/api/bookings` | User's bookings (auth required) |
| `POST` | `/api/bookings` | Join a session (auth required) |

## Architecture

The backend uses a **repository pattern** with in-memory data stores seeded from JSON files — no database setup required. Swap the repositories for a real database adapter when moving to production.

The frontend uses **React Context** for auth state and **TanStack Query** for server state with cache invalidation on mutations.

## License

MIT
