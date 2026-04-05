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

## Architecture

Monorepo with three packages:

- **shared/** — TypeScript types shared between client and server
- **server/** — Fastify REST API with in-memory data store
- **client/** — Vite + React SPA with TanStack Query and Tailwind CSS

## Tech Stack

React 19, TypeScript, Vite, Tailwind CSS v4, Fastify, TanStack Query, Leaflet, Vitest
