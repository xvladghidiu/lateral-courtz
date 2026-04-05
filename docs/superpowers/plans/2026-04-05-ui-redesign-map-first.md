# Map-First UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the Discover page from a vertical feed layout to a full-screen interactive map with glassmorphism overlays, shot clock stats (DSEG font), and a slide-in side panel for court details.

**Architecture:** The map becomes the entire home screen. All UI elements (header, search, stats, court panel) float on top as frosted-glass overlays. The existing FullMap page is deleted and merged into Discover. New components: ShotClock (DSEG display), SidePanel (slide-in court details). Color system shifts from dark theme to hybrid (light map tiles + glass overlays).

**Tech Stack:** React, TypeScript, Tailwind v4, Leaflet/react-leaflet, TanStack Query, DSEG font (CDN)

---

## File Map

### New
```
client/src/components/ShotClock.tsx        — Single shot clock stat display (DSEG font, dark glass)
client/src/components/ShotClockRow.tsx      — Vertical stack of 3 shot clocks with data
client/src/components/SidePanel.tsx         — Slide-in court detail panel (desktop right, mobile bottom)
client/src/components/SidePanelSessions.tsx — Session list with PlayerSlots inside the panel
```

### Modified
```
client/src/styles/global.css               — Replace dark theme tokens with hybrid glass tokens, remove grain
client/src/lib/mapUtils.ts                 — Restyle pins for light map (white pills, dark text)
client/src/components/Header.tsx           — Restyle: light glass, 48px, no center nav pills, inline links
client/src/pages/Discover.tsx              — Complete rewrite: full-screen map with floating overlays
client/src/App.tsx                         — Remove /map route and FullMap import
```

### Deleted
```
client/src/pages/FullMap.tsx               — Merged into Discover
client/src/components/StatCard.tsx         — Replaced by ShotClock
client/src/components/CourtCard.tsx        — No court grid (courts are map pins)
```

---

## Task 1: Theme & Global CSS Migration

**Files:**
- Modify: `client/src/styles/global.css`

- [ ] **Step 1: Replace the `@theme` block with hybrid glass tokens**

Replace the entire `@theme { ... }` block in `global.css` with:

```css
@theme {
  --color-glass-light: rgba(255, 255, 255, 0.15);
  --color-glass-light-solid: rgba(255, 255, 255, 0.85);
  --color-glass-dark: rgba(10, 10, 12, 0.35);
  --color-glass-border-light: rgba(255, 255, 255, 0.2);
  --color-glass-border-dark: rgba(255, 255, 255, 0.1);
  --color-text-on-light: rgba(0, 0, 0, 0.7);
  --color-text-on-light-muted: rgba(0, 0, 0, 0.4);
  --color-text-on-dark: rgba(255, 255, 255, 0.9);
  --color-text-on-dark-muted: rgba(255, 255, 255, 0.35);
  --color-accent-red: #ff3b30;
  --color-accent-orange: #ff9500;
  --color-accent-green: #34c759;
  --color-accent-amber: #d4a012;
}
```

- [ ] **Step 2: Update the `@layer base` body styles**

Replace the body rule with:

```css
body {
  margin: 0;
  font-family: "Inter", -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  font-feature-settings: "cv01", "cv02", "cv03", "cv04";
  overflow: hidden;
  height: 100vh;
}
```

- [ ] **Step 3: Remove the grain overlay**

Delete the entire `body::after` rule (the SVG noise texture).

- [ ] **Step 4: Add DSEG font-face**

Add at the top of the file, after `@import "tailwindcss";`:

```css
@font-face {
  font-family: "DSEG";
  src: url("https://cdn.jsdelivr.net/npm/dseg@0.46.0/fonts/DSEG7-Classic/DSEG7Classic-Bold.woff2") format("woff2");
  font-weight: bold;
  font-display: swap;
}
```

- [ ] **Step 5: Add shot clock LED pulse animation**

Add after the existing `@utility` blocks:

```css
@utility animate-led-pulse {
  animation: led-pulse 2s ease infinite;
}

@keyframes led-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
```

- [ ] **Step 6: Verify build**

```bash
cd /Users/vladghidiu/werk/Lateral_booking/client && npx vite build 2>&1 | tail -5
```

- [ ] **Step 7: Commit**

```bash
git add client/src/styles/global.css
git commit -m "refactor: migrate theme from dark to hybrid glass tokens, add DSEG font"
```

---

## Task 2: Restyle Map Pins — Pixel Basketball Icon

**Files:**
- Modify: `client/src/lib/mapUtils.ts`
- Requires: `client/public/assets/basketball-pin.png` (user must save the pixel basketball image here manually)

- [ ] **Step 1: Rewrite `priceIcon` to use basketball image with price badge**

Replace the entire `priceIcon` function and its cache:

```typescript
const priceIconCache = new Map<number, L.DivIcon>();

export function priceIcon(price: number): L.DivIcon {
  const cached = priceIconCache.get(price);
  if (cached) return cached;
  const icon = L.divIcon({
    className: "",
    iconSize: [0, 0],
    iconAnchor: [20, 52],
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer">
        <img src="/assets/basketball-pin.png" alt="" style="width:40px;height:40px;image-rendering:pixelated;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.2))" />
        <div style="margin-top:2px;font-size:11px;font-weight:700;padding:2px 8px;background:rgba(255,255,255,0.92);backdrop-filter:blur(8px);border:1px solid rgba(0,0,0,0.08);border-radius:6px;box-shadow:0 1px 6px rgba(0,0,0,0.1);color:#222;letter-spacing:-0.3px;font-family:Inter,sans-serif">$${price}</div>
      </div>`,
  });
  priceIconCache.set(price, icon);
  return icon;
}
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/vladghidiu/werk/Lateral_booking/client && npx vite build 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
git add client/src/lib/mapUtils.ts
git commit -m "refactor: restyle map pins for light map tiles"
```

---

## Task 3: ShotClock Component

**Files:**
- Create: `client/src/components/ShotClock.tsx`
- Create: `client/src/components/ShotClockRow.tsx`

- [ ] **Step 1: Create ShotClock component**

`client/src/components/ShotClock.tsx`:
```typescript
interface ShotClockProps {
  value: number;
  label: string;
  color: "red" | "orange" | "green";
}

const COLOR_MAP = {
  red: {
    text: "text-[#ff3b30]",
    shadow: "[text-shadow:0_0_10px_rgba(255,59,48,0.5),0_0_24px_rgba(255,59,48,0.2)]",
    led: "bg-[#ff3b30] shadow-[0_0_6px_rgba(255,59,48,0.6)]",
    accent: "from-transparent via-[rgba(255,59,48,0.4)] to-transparent",
  },
  orange: {
    text: "text-[#ff9500]",
    shadow: "[text-shadow:0_0_10px_rgba(255,149,0,0.5),0_0_24px_rgba(255,149,0,0.2)]",
    led: "bg-[#ff9500] shadow-[0_0_6px_rgba(255,149,0,0.6)]",
    accent: "from-transparent via-[rgba(255,149,0,0.4)] to-transparent",
  },
  green: {
    text: "text-[#34c759]",
    shadow: "[text-shadow:0_0_10px_rgba(52,199,89,0.4),0_0_24px_rgba(52,199,89,0.15)]",
    led: "bg-[#34c759] shadow-[0_0_6px_rgba(52,199,89,0.5)]",
    accent: "from-transparent via-[rgba(52,199,89,0.35)] to-transparent",
  },
};

function formatTime(value: number): string {
  return value < 10 ? `\u00A0${value}:00` : `${value}:00`;
}

export default function ShotClock({ value, label, color }: ShotClockProps) {
  const c = COLOR_MAP[color];

  return (
    <div className="w-[88px] h-[88px] rounded-xl bg-glass-dark backdrop-blur-[24px] backdrop-saturate-[180%] border border-glass-border-dark shadow-[0_8px_32px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center relative sm:w-[88px] max-sm:w-[72px] max-sm:h-[72px]">
      {/* Top accent line */}
      <div className={`absolute top-0 left-3 right-3 h-px bg-linear-to-r ${c.accent}`} />
      {/* LED dot */}
      <div className={`absolute top-1.5 right-1.5 w-1 h-1 rounded-full animate-led-pulse ${c.led}`} />
      {/* Ghost segments */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="font-['DSEG',monospace] font-bold text-[26px] max-sm:text-[20px] tracking-[1px] text-white opacity-5">
          88:88
        </span>
      </div>
      {/* Time value */}
      <span className={`font-['DSEG',monospace] font-bold text-[26px] max-sm:text-[20px] tracking-[1px] leading-none relative ${c.text} ${c.shadow}`}>
        {formatTime(value)}
      </span>
      {/* Label */}
      <span className="font-[Inter] text-[7px] font-bold uppercase tracking-[1.5px] text-text-on-dark-muted mt-1.5">
        {label}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Create ShotClockRow component**

`client/src/components/ShotClockRow.tsx`:
```typescript
import type { Session, Court } from "@shared/types/index.js";
import ShotClock from "./ShotClock.js";

interface ShotClockRowProps {
  sessions: Session[];
  courts: Court[];
}

function almostFullCount(sessions: Session[]): number {
  return sessions.filter(
    (s) => s.players.length / s.maxPlayers > 0.7,
  ).length;
}

export default function ShotClockRow({ sessions, courts }: ShotClockRowProps) {
  return (
    <div className="absolute top-1/2 left-5 -translate-y-1/2 z-10 flex flex-col gap-6">
      <ShotClock value={sessions.length} label="Active" color="red" />
      <ShotClock value={almostFullCount(sessions)} label="Filling" color="orange" />
      <ShotClock value={courts.length} label="Courts" color="green" />
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
cd /Users/vladghidiu/werk/Lateral_booking/client && npx vite build 2>&1 | tail -5
```

- [ ] **Step 4: Commit**

```bash
git add client/src/components/ShotClock.tsx client/src/components/ShotClockRow.tsx
git commit -m "feat: add ShotClock and ShotClockRow components with DSEG font"
```

---

## Task 4: SidePanel Component

**Files:**
- Create: `client/src/components/SidePanelSessions.tsx`
- Create: `client/src/components/SidePanel.tsx`

- [ ] **Step 1: Create SidePanelSessions component**

`client/src/components/SidePanelSessions.tsx`:
```typescript
import { Link } from "react-router-dom";
import type { Session } from "@shared/types/index.js";
import PlayerSlots from "./PlayerSlots.js";

interface SidePanelSessionsProps {
  sessions: Session[];
}

function SessionRow({ session }: { session: Session }) {
  const timeLabel = `${session.startTime} · ${session.durationMinutes}min`;

  return (
    <div className="py-3 border-b border-[rgba(0,0,0,0.06)] last:border-b-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-[-0.3px] text-[rgba(0,0,0,0.8)]">
            {session.format}
          </span>
          <span className="text-xs text-[rgba(0,0,0,0.4)]">{timeLabel}</span>
        </div>
        <Link
          to={`/checkout/${session.id}`}
          className="px-3 py-1 bg-accent-red text-white text-[11px] font-semibold rounded-lg shadow-[0_2px_8px_rgba(255,59,48,0.25)] hover:shadow-[0_4px_16px_rgba(255,59,48,0.35)] transition-all"
        >
          Join
        </Link>
      </div>
      <PlayerSlots filled={session.players.length} total={session.maxPlayers} size="sm" />
    </div>
  );
}

export default function SidePanelSessions({ sessions }: SidePanelSessionsProps) {
  if (sessions.length === 0) {
    return (
      <p className="text-sm text-[rgba(0,0,0,0.35)] py-4 text-center">
        No open sessions today
      </p>
    );
  }

  return (
    <div>
      {sessions.map((s) => (
        <SessionRow key={s.id} session={s} />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create SidePanel component**

`client/src/components/SidePanel.tsx`:
```typescript
import { Link } from "react-router-dom";
import type { Court, Session } from "@shared/types/index.js";
import { useCourtSessions } from "../hooks/useSessions.js";
import SidePanelSessions from "./SidePanelSessions.js";

interface SidePanelProps {
  court: Court;
  onClose: () => void;
}

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[rgba(0,0,0,0.06)] flex items-center justify-center text-[rgba(0,0,0,0.4)] hover:bg-[rgba(0,0,0,0.1)] transition-colors"
      aria-label="Close panel"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    </button>
  );
}

function TypeBadge({ type }: { type: string }) {
  const isIndoor = type === "indoor";
  const classes = isIndoor
    ? "bg-[rgba(59,130,246,0.1)] text-[#3b82f6] border-[rgba(59,130,246,0.15)]"
    : "bg-[rgba(34,197,94,0.1)] text-[#22c55e] border-[rgba(34,197,94,0.15)]";
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-[0.5px] px-2.5 py-0.5 rounded-md border ${classes}`}>
      {type}
    </span>
  );
}

function CourtHeader({ court }: { court: Court }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-bold tracking-[-0.3px] text-[rgba(0,0,0,0.85)]">
        {court.name}
      </h2>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-sm font-semibold text-accent-amber">
          ★ {court.rating}
        </span>
        <TypeBadge type={court.type} />
        <span className="text-xs text-[rgba(0,0,0,0.4)]">{court.surface}</span>
      </div>
      <div className="text-xs text-[rgba(0,0,0,0.4)] mt-1">{court.address}</div>
    </div>
  );
}

function PriceDisplay({ price }: { price: number }) {
  return (
    <div className="text-2xl font-bold tracking-[-0.5px] text-[rgba(0,0,0,0.85)] mb-4">
      ${price} <span className="text-sm font-normal text-[rgba(0,0,0,0.35)]">/ player / hr</span>
    </div>
  );
}

function Amenities({ amenities }: { amenities: string[] }) {
  if (amenities.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mb-4">
      {amenities.map((a) => (
        <span
          key={a}
          className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[rgba(0,0,0,0.04)] text-[rgba(0,0,0,0.5)] border border-[rgba(0,0,0,0.06)]"
        >
          {a}
        </span>
      ))}
    </div>
  );
}

function PanelActions({ courtId }: { courtId: string }) {
  return (
    <div className="flex gap-2 mb-4">
      <Link
        to={`/sessions/new?courtId=${courtId}&mode=open`}
        className="flex-1 text-center py-2.5 bg-accent-red text-white text-xs font-semibold rounded-xl shadow-[0_2px_12px_rgba(255,59,48,0.25)] hover:shadow-[0_4px_20px_rgba(255,59,48,0.35)] transition-all"
      >
        Create a Game
      </Link>
      <Link
        to={`/sessions/new?courtId=${courtId}&mode=private`}
        className="flex-1 text-center py-2.5 bg-[rgba(0,0,0,0.06)] text-[rgba(0,0,0,0.7)] text-xs font-semibold rounded-xl hover:bg-[rgba(0,0,0,0.1)] transition-all"
      >
        Book Full Court
      </Link>
    </div>
  );
}

function todayDate(): string {
  return new Date().toISOString().split("T")[0]!;
}

export default function SidePanel({ court, onClose }: SidePanelProps) {
  const { data: sessions = [] } = useCourtSessions(court.id, todayDate());

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className="fixed inset-0 bg-black/20 z-40 sm:hidden"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div className="fixed z-50 transition-transform duration-300 ease-out
        max-sm:bottom-0 max-sm:left-0 max-sm:right-0 max-sm:h-[50vh] max-sm:rounded-t-2xl
        sm:top-0 sm:right-0 sm:w-[400px] sm:h-full
        bg-glass-light-solid backdrop-blur-[24px] backdrop-saturate-[180%]
        border-l border-glass-border-light shadow-[0_8px_32px_rgba(0,0,0,0.12)]
        overflow-y-auto"
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[rgba(0,0,0,0.15)]" />
        </div>

        <div className="p-5 relative">
          <CloseButton onClick={onClose} />
          <CourtHeader court={court} />
          <PriceDisplay price={court.pricePerPlayerPerHour} />
          <Amenities amenities={court.amenities} />
          <PanelActions courtId={court.id} />

          <h3 className="text-xs font-bold uppercase tracking-[1px] text-[rgba(0,0,0,0.35)] mb-2">
            Open Sessions
          </h3>
          <SidePanelSessions sessions={sessions.filter((s: Session) => s.status === "filling")} />

          <Link
            to={`/courts/${court.id}`}
            className="block text-center text-xs font-medium text-accent-red mt-4 py-2 hover:underline"
          >
            View full details →
          </Link>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
cd /Users/vladghidiu/werk/Lateral_booking/client && npx vite build 2>&1 | tail -5
```

- [ ] **Step 4: Commit**

```bash
git add client/src/components/SidePanel.tsx client/src/components/SidePanelSessions.tsx
git commit -m "feat: add SidePanel and SidePanelSessions components"
```

---

## Task 5: Restyle Header for Glass Theme

**Files:**
- Modify: `client/src/components/Header.tsx`

- [ ] **Step 1: Rewrite Header.tsx**

Replace the entire file with:

```typescript
import { Link } from "react-router-dom";
import type { PublicUser } from "@shared/types/index.js";

interface HeaderProps {
  user: PublicUser | null;
  onLogout: () => void;
}

function BrandSection() {
  return (
    <Link to="/" className="flex items-center gap-2.5 text-[15px] font-semibold tracking-[-0.3px] text-text-on-light no-underline">
      <div className="w-[7px] h-[7px] rounded-full bg-accent-red shadow-[0_0_10px_rgba(255,59,48,0.5)] animate-breathe" />
      Lateral Courts
    </Link>
  );
}

function NavLinks() {
  return (
    <nav className="hidden sm:flex items-center gap-5">
      <Link to="/dashboard" className="text-[13px] font-medium text-text-on-light-muted hover:text-text-on-light transition-colors no-underline">
        My Games
      </Link>
      <Link to="/dashboard" className="text-[13px] font-medium text-text-on-light-muted hover:text-text-on-light transition-colors no-underline">
        Bookings
      </Link>
    </nav>
  );
}

function UserAvatar({ name, onLogout }: { name: string; onLogout: () => void }) {
  return (
    <button
      type="button"
      onClick={onLogout}
      className="w-7 h-7 rounded-full bg-linear-to-br from-accent-red to-accent-orange flex items-center justify-center text-[10px] font-semibold text-white"
      aria-label="User menu"
    >
      {name.charAt(0).toUpperCase()}
    </button>
  );
}

export default function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-5 h-12 bg-glass-light backdrop-blur-[24px] backdrop-saturate-[180%] border-b border-glass-border-light">
      <BrandSection />
      <div className="flex items-center gap-4">
        <NavLinks />
        {user && <UserAvatar name={user.name} onLogout={onLogout} />}
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/vladghidiu/werk/Lateral_booking/client && npx vite build 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
git add client/src/components/Header.tsx
git commit -m "refactor: restyle header to light glassmorphism, slimmer 48px"
```

---

## Task 6: Rewrite Discover Page — Map-First

**Files:**
- Rewrite: `client/src/pages/Discover.tsx`

- [ ] **Step 1: Rewrite Discover.tsx**

Replace the entire file:

```typescript
import { useState, useMemo, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Court } from "@shared/types/index.js";
import { useCourts } from "../hooks/useCourts.js";
import { useAllSessions } from "../hooks/useSessions.js";
import { useAuth } from "../context/AuthContext.js";
import Header from "../components/Header.js";
import ShotClockRow from "../components/ShotClockRow.js";
import SidePanel from "../components/SidePanel.js";
import { mapCenter, priceIcon } from "../lib/mapUtils.js";

const TILE_URL = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const EMPTY_COURTS: Court[] = [];

function SearchBar() {
  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-6 py-3.5 bg-glass-light backdrop-blur-[24px] backdrop-saturate-[180%] border border-glass-border-light rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] w-[90%] max-w-[480px]">
      <svg className="w-5 h-5 text-text-on-light-muted shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <span className="text-[15px] text-text-on-light-muted font-normal">
        Search courts near you...
      </span>
    </div>
  );
}

function CourtMarker({ court, onClick }: { court: Court; onClick: (court: Court) => void }) {
  return (
    <Marker
      position={[court.lat, court.lng]}
      icon={priceIcon(court.pricePerPlayerPerHour)}
      eventHandlers={{ click: () => onClick(court) }}
    />
  );
}

function MapResizer({ panelOpen }: { panelOpen: boolean }) {
  const map = useMap();
  useMemo(() => {
    setTimeout(() => map.invalidateSize(), 350);
  }, [panelOpen, map]);
  return null;
}

export default function Discover() {
  const { data: courts = EMPTY_COURTS } = useCourts();
  const { data: sessions = [] } = useAllSessions("filling");
  const { user, logout } = useAuth();
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);

  const center = useMemo(() => mapCenter(courts), [courts]);
  const handlePinClick = useCallback((court: Court) => setSelectedCourt(court), []);
  const handleClosePanel = useCallback(() => setSelectedCourt(null), []);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Map fills entire viewport */}
      <div className={`absolute inset-0 transition-all duration-300 ${selectedCourt ? "sm:right-[400px]" : ""}`}>
        <MapContainer
          center={center}
          zoom={13}
          zoomControl={false}
          attributionControl={false}
          className="w-full h-full"
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url={TILE_URL} />
          <MapResizer panelOpen={!!selectedCourt} />
          {courts.map((court) => (
            <CourtMarker key={court.id} court={court} onClick={handlePinClick} />
          ))}
        </MapContainer>
      </div>

      {/* Floating overlays */}
      <Header user={user} onLogout={logout} />
      <SearchBar />
      <ShotClockRow sessions={sessions} courts={courts} />

      {/* Side panel */}
      {selectedCourt && (
        <SidePanel court={selectedCourt} onClose={handleClosePanel} />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/vladghidiu/werk/Lateral_booking/client && npx vite build 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/Discover.tsx
git commit -m "feat: rewrite Discover page as full-screen map with glass overlays"
```

---

## Task 7: Cleanup — Delete Old Files & Update Routes

**Files:**
- Delete: `client/src/pages/FullMap.tsx`
- Delete: `client/src/components/StatCard.tsx`
- Delete: `client/src/components/CourtCard.tsx`
- Modify: `client/src/App.tsx`

- [ ] **Step 1: Delete FullMap.tsx**

```bash
rm /Users/vladghidiu/werk/Lateral_booking/client/src/pages/FullMap.tsx
```

- [ ] **Step 2: Delete StatCard.tsx and CourtCard.tsx**

```bash
rm /Users/vladghidiu/werk/Lateral_booking/client/src/components/StatCard.tsx
rm /Users/vladghidiu/werk/Lateral_booking/client/src/components/CourtCard.tsx
```

- [ ] **Step 3: Update App.tsx — remove /map route and FullMap import**

Replace the entire file:

```typescript
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext.js";
import Discover from "./pages/Discover.js";
import Login from "./pages/Login.js";
import Register from "./pages/Register.js";
import CourtDetails from "./pages/CourtDetails.js";
import CreateSession from "./pages/CreateSession.js";
import SessionDetails from "./pages/SessionDetails.js";
import Checkout from "./pages/Checkout.js";
import Dashboard from "./pages/Dashboard.js";
import BottomTabs from "./components/BottomTabs.js";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Discover />} />
            <Route path="/courts/:id" element={<CourtDetails />} />
            <Route path="/sessions/new" element={<CreateSession />} />
            <Route path="/sessions/:id" element={<SessionDetails />} />
            <Route path="/checkout/:sessionId" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
          <BottomTabs />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

- [ ] **Step 4: Verify build** — may have errors from other pages importing deleted components. Check and fix.

```bash
cd /Users/vladghidiu/werk/Lateral_booking/client && npx vite build 2>&1 | tail -20
```

If `CourtCard` or `StatCard` are imported elsewhere, remove those imports and their usage. If `FullMap` is linked from other pages, update those links to `/`.

- [ ] **Step 5: Run all tests**

```bash
cd /Users/vladghidiu/werk/Lateral_booking/server && npx vitest run 2>&1 | tail -10
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: remove FullMap, StatCard, CourtCard; update routes for map-first layout"
```

---

## Summary

| Task | What | Key Files |
|------|------|-----------|
| 1 | Theme migration (dark → hybrid glass) | `global.css` |
| 2 | Restyle map pins for light tiles | `mapUtils.ts` |
| 3 | ShotClock + ShotClockRow components | New components |
| 4 | SidePanel + SidePanelSessions | New components |
| 5 | Header restyle (light glass, slimmer) | `Header.tsx` |
| 6 | Discover page rewrite (map-first) | `Discover.tsx` |
| 7 | Cleanup: delete old files, update routes | Delete 3 files, update `App.tsx` |
