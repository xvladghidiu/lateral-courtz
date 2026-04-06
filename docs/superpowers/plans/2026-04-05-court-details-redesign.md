# Court Details Page Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the court details page from a centered modal overlay to a full-width hybrid layout with photo hero, two-column content, sticky booking sidebar, and rating breakdown chart.

**Architecture:** Extract the monolithic `CourtDetails.tsx` into focused components (`PhotoHero`, `CourtHeader`, `BookingSidebar`, `RatingBreakdown`, `SessionsPreview`, `CourtLocationMap`, `MobileBookingBar`). The page component owns `selectedDate` state shared between sidebar and sessions. No backend changes — all data from existing hooks.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4 (glass design tokens), Leaflet, TanStack Query, Vitest + Testing Library

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `client/src/lib/ratingDistribution.ts` | Pure function: reviews[] → star count distribution |
| Create | `client/src/lib/__tests__/ratingDistribution.test.ts` | Unit tests for rating distribution |
| Create | `client/src/components/PhotoHero.tsx` | Photo grid (desktop) / carousel (mobile) with empty fallback |
| Create | `client/src/components/CourtHeader.tsx` | Court name, address, badges, rating, amenities |
| Create | `client/src/components/RatingBreakdown.tsx` | Large score + 5-bar star distribution chart |
| Create | `client/src/components/SessionsPreview.tsx` | Compact session list for selected date |
| Create | `client/src/components/BookingSidebar.tsx` | Sticky glass card: price, calendar, time slots, CTA |
| Create | `client/src/components/CourtLocationMap.tsx` | Small non-interactive Leaflet map with pin |
| Create | `client/src/components/MobileBookingBar.tsx` | Sticky bottom bar with price + CTA (mobile only) |
| Rewrite | `client/src/pages/CourtDetails.tsx` | Assemble all components in new two-column layout |

---

### Task 1: Rating Distribution Utility

**Files:**
- Create: `client/src/lib/ratingDistribution.ts`
- Create: `client/src/lib/__tests__/ratingDistribution.test.ts`

- [ ] **Step 1: Write the failing test**

Create `client/src/lib/__tests__/ratingDistribution.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { computeRatingDistribution } from "../ratingDistribution.js";

describe("computeRatingDistribution", () => {
  it("returns zero counts for empty array", () => {
    const result = computeRatingDistribution([]);
    expect(result).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  });

  it("counts ratings correctly", () => {
    const reviews = [
      { rating: 5 },
      { rating: 5 },
      { rating: 4 },
      { rating: 3 },
      { rating: 5 },
    ];
    const result = computeRatingDistribution(reviews);
    expect(result).toEqual({ 1: 0, 2: 0, 3: 1, 4: 1, 5: 3 });
  });

  it("computes percentage for each star", () => {
    const reviews = [{ rating: 5 }, { rating: 5 }, { rating: 3 }, { rating: 3 }];
    const result = computeRatingDistribution(reviews);
    expect(result[5]).toBe(2);
    expect(result[3]).toBe(2);
    expect(result[1]).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd client && npx vitest run src/lib/__tests__/ratingDistribution.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write the implementation**

Create `client/src/lib/ratingDistribution.ts`:

```ts
export type RatingDistribution = Record<1 | 2 | 3 | 4 | 5, number>;

export function computeRatingDistribution(
  reviews: { rating: number }[],
): RatingDistribution {
  const dist: RatingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of reviews) {
    const star = r.rating as 1 | 2 | 3 | 4 | 5;
    if (star >= 1 && star <= 5) dist[star]++;
  }
  return dist;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd client && npx vitest run src/lib/__tests__/ratingDistribution.test.ts`
Expected: 3 tests PASS

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/ratingDistribution.ts client/src/lib/__tests__/ratingDistribution.test.ts
git commit -m "feat: add computeRatingDistribution utility"
```

---

### Task 2: PhotoHero Component

**Files:**
- Create: `client/src/components/PhotoHero.tsx`

- [ ] **Step 1: Create the component**

Create `client/src/components/PhotoHero.tsx`:

```tsx
import type { CourtType } from "@shared/types/index.js";

interface PhotoHeroProps {
  photos: string[];
  courtType: CourtType;
}

function PlaceholderHero({ courtType }: { courtType: CourtType }) {
  return (
    <div className="w-full h-[200px] md:h-[280px] bg-gradient-to-br from-[#1a1a1a] via-[#2a2015] to-[#1a1a1a] flex items-center justify-center">
      <div className="text-center">
        <span className="text-4xl opacity-30 block mb-2">
          {courtType === "indoor" ? "🏟️" : "🏀"}
        </span>
        <span className="font-['Space_Grotesk',sans-serif] text-[10px] uppercase tracking-[1.5px] text-[rgba(255,255,255,0.25)]">
          No photos available
        </span>
      </div>
    </div>
  );
}

function PhotoGrid({ photos }: { photos: string[] }) {
  const display = photos.slice(0, 5);
  const hasMore = photos.length > 5;

  return (
    <div className="hidden md:grid grid-cols-[2fr_1fr_1fr] grid-rows-2 gap-1 h-[280px]">
      <div className="row-span-2 relative overflow-hidden">
        <img src={display[0]} alt="Court main" className="w-full h-full object-cover" />
      </div>
      {display.slice(1, 5).map((photo, i) => (
        <div key={i} className="relative overflow-hidden">
          <img src={photo} alt={`Court ${i + 2}`} className="w-full h-full object-cover" />
          {i === 3 && hasMore && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-[rgba(0,0,0,0.6)] border border-[rgba(255,255,255,0.15)] rounded-lg px-3 py-1.5 font-['Space_Grotesk',sans-serif] text-[10px] text-[rgba(255,255,255,0.7)]">
                Show all
              </span>
            </div>
          )}
        </div>
      ))}
      {/* Fill empty grid slots if fewer than 5 photos */}
      {Array.from({ length: Math.max(0, 4 - display.slice(1).length) }, (_, i) => (
        <div key={`empty-${i}`} className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2015]" />
      ))}
    </div>
  );
}

function PhotoCarousel({ photos }: { photos: string[] }) {
  return (
    <div className="md:hidden">
      <div className="flex overflow-x-auto snap-x snap-mandatory h-[200px] scrollbar-hide">
        {photos.map((photo, i) => (
          <div key={i} className="snap-center shrink-0 w-full h-full">
            <img src={photo} alt={`Court ${i + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
      {photos.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {photos.map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[rgba(255,255,255,0.3)]"
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PhotoHero({ photos, courtType }: PhotoHeroProps) {
  if (photos.length === 0) {
    return <PlaceholderHero courtType={courtType} />;
  }

  return (
    <div className="relative">
      <PhotoGrid photos={photos} />
      <PhotoCarousel photos={photos} />
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd client && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add client/src/components/PhotoHero.tsx
git commit -m "feat: add PhotoHero component with grid and carousel"
```

---

### Task 3: CourtHeader Component

**Files:**
- Create: `client/src/components/CourtHeader.tsx`

- [ ] **Step 1: Create the component**

Extract and clean up header from current `CourtDetails.tsx`. Create `client/src/components/CourtHeader.tsx`:

```tsx
import type { Court } from "@shared/types/index.js";
import { capitalize } from "./utils.js";

const PILL =
  "bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.1)] rounded-full px-3 py-1 font-['Space_Grotesk',sans-serif] text-[9px] uppercase tracking-[1.5px] text-[rgba(255,255,255,0.6)]";

const AMENITY_PILL =
  "bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] rounded-full px-3.5 py-1.5 font-['Space_Grotesk',sans-serif] text-[10px] uppercase tracking-[1px] text-[rgba(255,255,255,0.5)]";

const SECTION_HEADING =
  "font-['Space_Grotesk',sans-serif] text-[11px] uppercase tracking-[2px] text-[rgba(255,255,255,0.5)] mb-3";

export default function CourtHeader({ court }: { court: Court }) {
  return (
    <div className="mb-7">
      <h1 className="font-['Lixdu',sans-serif] text-[22px] uppercase tracking-[3px] text-[rgba(255,255,255,0.85)] mb-2">
        {court.name}
      </h1>
      <p className="font-['Space_Grotesk',sans-serif] text-[11px] uppercase tracking-[1.5px] text-[rgba(255,255,255,0.4)] mb-4">
        {court.address}
      </p>

      {/* Type, Surface, Rating */}
      <div className="flex items-center gap-2.5 flex-wrap mb-5">
        <span className={PILL}>{court.type === "indoor" ? "Indoor" : "Outdoor"}</span>
        <span className={PILL}>{capitalize(court.surface)}</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[#d4a012] text-sm">
            {"★".repeat(Math.round(court.rating))}
          </span>
          <span className="text-sm text-[rgba(255,255,255,0.85)]">
            {court.rating.toFixed(1)}
          </span>
          <span className="text-xs text-[rgba(255,255,255,0.4)]">
            ({court.reviewCount} reviews)
          </span>
        </div>
      </div>

      {/* Amenities */}
      <div className="pb-7 border-b border-[rgba(255,255,255,0.06)]">
        <h3 className={SECTION_HEADING}>Amenities</h3>
        <div className="flex gap-2 flex-wrap">
          {court.amenities.map((a) => (
            <span key={a} className={AMENITY_PILL}>{a}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd client && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add client/src/components/CourtHeader.tsx
git commit -m "feat: add CourtHeader component"
```

---

### Task 4: RatingBreakdown Component

**Files:**
- Create: `client/src/components/RatingBreakdown.tsx`

- [ ] **Step 1: Create the component**

Create `client/src/components/RatingBreakdown.tsx`:

```tsx
import type { Review } from "@shared/types/index.js";
import { computeRatingDistribution } from "../lib/ratingDistribution.js";

interface RatingBreakdownProps {
  reviews: Review[];
  rating: number;
}

function StarBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="flex items-center gap-2">
      <span className="font-['Space_Grotesk',sans-serif] text-[10px] text-[rgba(255,255,255,0.4)] w-3 text-right">
        {star}
      </span>
      <div className="flex-1 h-1.5 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#d4a012] rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function RatingBreakdown({ reviews, rating }: RatingBreakdownProps) {
  const dist = computeRatingDistribution(reviews);
  const total = reviews.length;

  return (
    <div className="flex gap-6 items-center p-5 bg-[rgba(255,255,255,0.04)] rounded-xl border border-[rgba(255,255,255,0.06)] mb-5">
      {/* Score */}
      <div className="text-center min-w-[70px]">
        <div className="font-['DSEG',monospace] text-[36px] text-[rgba(255,255,255,0.9)]">
          {rating.toFixed(1)}
        </div>
        <div className="text-[#d4a012] text-xs mt-0.5">
          {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}
        </div>
        <div className="font-['Space_Grotesk',sans-serif] text-[10px] text-[rgba(255,255,255,0.3)] mt-1">
          {total} {total === 1 ? "review" : "reviews"}
        </div>
      </div>

      {/* Distribution bars */}
      <div className="flex-1 flex flex-col gap-1.5">
        {([5, 4, 3, 2, 1] as const).map((star) => (
          <StarBar key={star} star={star} count={dist[star]} total={total} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd client && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add client/src/components/RatingBreakdown.tsx
git commit -m "feat: add RatingBreakdown component with star distribution chart"
```

---

### Task 5: SessionsPreview Component

**Files:**
- Create: `client/src/components/SessionsPreview.tsx`

- [ ] **Step 1: Create the component**

Create `client/src/components/SessionsPreview.tsx`:

```tsx
import { Link } from "react-router-dom";
import type { Session } from "@shared/types/index.js";

interface SessionsPreviewProps {
  sessions: Session[];
  selectedDate: string;
}

const SECTION_HEADING =
  "font-['Space_Grotesk',sans-serif] text-[11px] uppercase tracking-[2px] text-[rgba(255,255,255,0.5)] mb-3";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function SessionRow({ session }: { session: Session }) {
  const spotsLeft = session.maxPlayers - session.players.length;

  return (
    <Link
      to={`/sessions/${session.id}`}
      className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] rounded-xl px-4 py-3 flex items-center justify-between hover:bg-[rgba(255,255,255,0.07)] transition-colors"
    >
      <div className="flex items-center gap-2.5">
        <span className="font-['Space_Grotesk',sans-serif] text-[13px] font-semibold text-[rgba(255,255,255,0.7)]">
          {session.format}
        </span>
        <span className="font-['Space_Grotesk',sans-serif] text-[11px] text-[rgba(255,255,255,0.35)]">
          {session.startTime} · {session.durationMinutes}min
        </span>
      </div>
      <span className="font-['Space_Grotesk',sans-serif] text-[10px] uppercase tracking-[1px] text-[rgba(255,255,255,0.3)]">
        {spotsLeft} {spotsLeft === 1 ? "spot" : "spots"}
      </span>
    </Link>
  );
}

export default function SessionsPreview({ sessions, selectedDate }: SessionsPreviewProps) {
  return (
    <section className="py-7 border-b border-[rgba(255,255,255,0.06)]">
      <h3 className={SECTION_HEADING}>
        Open Sessions · {formatDate(selectedDate)}
      </h3>
      {sessions.length === 0 ? (
        <p className="font-['Space_Grotesk',sans-serif] text-[11px] uppercase tracking-[1.5px] text-[rgba(255,255,255,0.4)] py-4">
          No sessions for this date
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {sessions.map((s) => (
            <SessionRow key={s.id} session={s} />
          ))}
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd client && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add client/src/components/SessionsPreview.tsx
git commit -m "feat: add SessionsPreview component"
```

---

### Task 6: BookingSidebar Component

**Files:**
- Create: `client/src/components/BookingSidebar.tsx`

- [ ] **Step 1: Create the component**

Create `client/src/components/BookingSidebar.tsx`:

```tsx
import { useNavigate } from "react-router-dom";
import type { Court } from "@shared/types/index.js";
import GlassCalendar from "./GlassCalendar.js";

interface BookingSidebarProps {
  court: Court;
  selectedDate: string;
  onDateChange: (date: string) => void;
  selectedSlot: string | null;
  onSlotChange: (slot: string) => void;
  minDate: string;
}

const TIME_SLOTS = ["16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];

function formatSlotLabel(slot: string): string {
  const hour = parseInt(slot.split(":")[0]!, 10);
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
}

export default function BookingSidebar({ court, selectedDate, onDateChange, selectedSlot, onSlotChange, minDate }: BookingSidebarProps) {
  const navigate = useNavigate();

  function handleBook() {
    if (!selectedSlot) return;
    navigate(`/checkout?courtId=${court.id}&date=${selectedDate}&time=${selectedSlot}`);
  }

  return (
    <div className="sticky top-8">
      {/* Glass card */}
      <div className="bg-[rgba(255,255,255,0.12)] backdrop-blur-[24px] backdrop-saturate-[180%] border border-[rgba(255,255,255,0.15)] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] px-6 py-7">
        {/* Price */}
        <div className="mb-5 flex items-baseline gap-1">
          <span className="font-['DSEG',monospace] text-[28px] text-[rgba(255,255,255,0.9)]">
            ${court.pricePerPlayerPerHour}
          </span>
          <span className="font-['Space_Grotesk',sans-serif] text-[11px] text-[rgba(255,255,255,0.4)] tracking-[1px]">
            /player/hr
          </span>
        </div>

        {/* Calendar */}
        <GlassCalendar value={selectedDate} onChange={onDateChange} minDate={minDate} />

        {/* Time slots */}
        <div className="mb-5">
          <span className="font-['Space_Grotesk',sans-serif] text-[10px] uppercase tracking-[2px] text-[rgba(255,255,255,0.5)] mb-2 block">
            Time Slot
          </span>
          <div className="flex gap-1.5 flex-wrap">
            {TIME_SLOTS.map((slot) => {
              const active = selectedSlot === slot;
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => onSlotChange(slot)}
                  className={`rounded-lg px-3 py-1.5 font-['Space_Grotesk',sans-serif] text-[11px] transition-all ${
                    active
                      ? "bg-[rgba(212,160,18,0.15)] border border-[rgba(212,160,18,0.3)] text-[#d4a012]"
                      : "bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] text-[rgba(255,255,255,0.5)] hover:bg-[rgba(255,255,255,0.12)]"
                  }`}
                >
                  {formatSlotLabel(slot)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[rgba(255,255,255,0.08)] mb-4" />

        {/* Duration summary */}
        {selectedSlot && (
          <div className="flex justify-between mb-5">
            <span className="font-['Space_Grotesk',sans-serif] text-[12px] text-[rgba(255,255,255,0.5)]">
              Full court · {selectedSlot}
            </span>
          </div>
        )}

        {/* CTA */}
        <button
          type="button"
          onClick={handleBook}
          disabled={!selectedSlot}
          className="w-full text-white rounded-xl px-6 py-4 font-['Lixdu',sans-serif] text-[14px] uppercase tracking-[2.5px] hover:shadow-[0_4px_20px_rgba(232,120,23,0.4)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            backgroundImage: "url(/assets/basketball-leather.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          Book Full Court
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd client && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add client/src/components/BookingSidebar.tsx
git commit -m "feat: add BookingSidebar component with calendar, time slots, CTA"
```

---

### Task 7: CourtLocationMap Component

**Files:**
- Create: `client/src/components/CourtLocationMap.tsx`

- [ ] **Step 1: Create the component**

Create `client/src/components/CourtLocationMap.tsx`:

```tsx
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface CourtLocationMapProps {
  lat: number;
  lng: number;
}

const PIN_ICON = L.icon({
  iconUrl: "/assets/basketball-pin.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

export default function CourtLocationMap({ lat, lng }: CourtLocationMapProps) {
  return (
    <div className="mt-5 rounded-xl overflow-hidden border border-[rgba(255,255,255,0.08)] h-[140px]">
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        zoomControl={false}
        attributionControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        keyboard={false}
        className="w-full h-full"
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        <Marker position={[lat, lng]} icon={PIN_ICON} />
      </MapContainer>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd client && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add client/src/components/CourtLocationMap.tsx
git commit -m "feat: add CourtLocationMap component"
```

---

### Task 8: MobileBookingBar Component

**Files:**
- Create: `client/src/components/MobileBookingBar.tsx`

- [ ] **Step 1: Create the component**

Create `client/src/components/MobileBookingBar.tsx`:

```tsx
interface MobileBookingBarProps {
  pricePerPlayerPerHour: number;
  onBook: () => void;
  disabled: boolean;
}

export default function MobileBookingBar({ pricePerPlayerPerHour, onBook, disabled }: MobileBookingBarProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[rgba(10,10,12,0.85)] backdrop-blur-[24px] border-t border-[rgba(255,255,255,0.1)] px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-1">
          <span className="font-['DSEG',monospace] text-[20px] text-[rgba(255,255,255,0.9)]">
            ${pricePerPlayerPerHour}
          </span>
          <span className="font-['Space_Grotesk',sans-serif] text-[10px] text-[rgba(255,255,255,0.4)] tracking-[1px]">
            /player/hr
          </span>
        </div>
        <button
          type="button"
          onClick={onBook}
          disabled={disabled}
          className="text-white rounded-xl px-6 py-3 font-['Lixdu',sans-serif] text-[12px] uppercase tracking-[2px] hover:shadow-[0_4px_20px_rgba(232,120,23,0.4)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            backgroundImage: "url(/assets/basketball-leather.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          Book Full Court
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd client && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add client/src/components/MobileBookingBar.tsx
git commit -m "feat: add MobileBookingBar sticky bottom component"
```

---

### Task 9: Rewrite CourtDetails Page

**Files:**
- Rewrite: `client/src/pages/CourtDetails.tsx`

This is the assembly step. The page imports all new components and wires them together with the two-column layout.

- [ ] **Step 1: Rewrite the page**

Replace the entire contents of `client/src/pages/CourtDetails.tsx` with:

```tsx
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import type { Session, Review, CreateReviewInput } from "@shared/types/index.js";
import { useCourt } from "../hooks/useCourts.js";
import { useCourtSessions } from "../hooks/useSessions.js";
import { useReviews, usePostReview } from "../hooks/useReviews.js";
import { useAuth } from "../context/AuthContext.js";
import PhotoHero from "../components/PhotoHero.js";
import CourtHeader from "../components/CourtHeader.js";
import SessionsPreview from "../components/SessionsPreview.js";
import RatingBreakdown from "../components/RatingBreakdown.js";
import BookingSidebar from "../components/BookingSidebar.js";
import CourtLocationMap from "../components/CourtLocationMap.js";
import MobileBookingBar from "../components/MobileBookingBar.js";
import GlassCalendar from "../components/GlassCalendar.js";

function todayDate(): string {
  return new Date().toISOString().split("T")[0]!;
}

/* ── Review sub-components (kept inline, same page concern) ── */

function StarSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1 mb-3">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`w-8 h-8 rounded-md text-sm font-bold transition ${
            n <= value
              ? "bg-[rgba(255,255,255,0.15)] text-white"
              : "bg-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.4)]"
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function ReviewForm({ courtId }: { courtId: string }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const { mutate, isPending } = usePostReview(courtId);

  if (!user) {
    return (
      <p className="font-['Space_Grotesk',sans-serif] text-[11px] uppercase tracking-[1.5px] text-[rgba(255,255,255,0.4)] mt-4">
        <Link to="/login" className="text-white hover:underline">Log in</Link> to leave a review
      </p>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const input: CreateReviewInput = { rating, comment };
    mutate(input, { onSuccess: () => setComment("") });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <h3 className="font-['Space_Grotesk',sans-serif] text-[11px] uppercase tracking-[1.5px] text-[rgba(255,255,255,0.6)] mb-3">
        Add a review
      </h3>
      <StarSelector value={rating} onChange={setRating} />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience..."
        rows={3}
        className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white text-[14px] focus:border-[rgba(255,255,255,0.25)] outline-none placeholder:text-[rgba(255,255,255,0.25)] resize-none mb-3"
      />
      <button
        type="submit"
        disabled={isPending || !comment.trim()}
        className="text-white rounded-xl px-6 py-3 font-['Lixdu',sans-serif] text-[14px] uppercase tracking-[3px] hover:shadow-[0_4px_20px_rgba(232,120,23,0.4)] transition-all disabled:opacity-50"
        style={{ backgroundImage: "url(/assets/basketball-leather.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        {isPending ? "Posting..." : "Submit review"}
      </button>
    </form>
  );
}

function ReviewItem({ review }: { review: Review }) {
  const userName = review.userId.slice(0, 8);
  const formatted = new Date(review.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="py-3.5 border-b border-[rgba(255,255,255,0.08)]">
      <div className="flex items-center gap-2.5 mb-1.5">
        <span className="text-[#d4a012] text-[13px]">
          {Array.from({ length: 5 }, (_, i) => (i < review.rating ? "★" : "☆")).join("")}
        </span>
        <span className="text-[13px] text-[rgba(255,255,255,0.85)]">{userName}</span>
        <span className="text-[11px] text-[rgba(255,255,255,0.4)]">{formatted}</span>
      </div>
      <p className="text-[13px] text-[rgba(255,255,255,0.7)] leading-normal">{review.comment}</p>
    </div>
  );
}

function ReviewsSection({ courtId, reviews, rating }: { courtId: string; reviews: Review[]; rating: number }) {
  return (
    <section className="pt-7">
      <h3 className="font-['Space_Grotesk',sans-serif] text-[11px] uppercase tracking-[2px] text-[rgba(255,255,255,0.5)] mb-4">
        Reviews
      </h3>
      <RatingBreakdown reviews={reviews} rating={rating} />
      {reviews.length === 0 && (
        <p className="font-['Space_Grotesk',sans-serif] text-[11px] uppercase tracking-[1.5px] text-[rgba(255,255,255,0.4)]">
          No reviews yet
        </p>
      )}
      {reviews.map((r) => (
        <ReviewItem key={r.id} review={r} />
      ))}
      <ReviewForm courtId={courtId} />
    </section>
  );
}

/* ── Loading / Error states ──────────────────────────────── */

function FullScreenMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
      {children}
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────── */

const EMPTY_SESSIONS: Session[] = [];
const EMPTY_REVIEWS: Review[] = [];

export default function CourtDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(todayDate);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const { data: court, isLoading: courtLoading } = useCourt(id ?? "");
  const { data: sessions = EMPTY_SESSIONS } = useCourtSessions(id ?? "", selectedDate);
  const { data: reviews = EMPTY_REVIEWS } = useReviews(id ?? "");

  if (courtLoading) {
    return (
      <FullScreenMessage>
        <span className="font-['Space_Grotesk',sans-serif] text-[12px] uppercase tracking-[2px] text-[rgba(255,255,255,0.5)]">
          Loading court...
        </span>
      </FullScreenMessage>
    );
  }

  if (!court) {
    return (
      <FullScreenMessage>
        <span className="font-['Space_Grotesk',sans-serif] text-[12px] uppercase tracking-[2px] text-[#ff3b30]">
          Court not found
        </span>
      </FullScreenMessage>
    );
  }

  function handleBook() {
    const params = new URLSearchParams({ courtId: court!.id, date: selectedDate });
    if (selectedSlot) params.set("time", selectedSlot);
    navigate(`/checkout?${params.toString()}`);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white overflow-y-auto">
      {/* Hero */}
      <div className="relative">
        <PhotoHero photos={court.photos} courtType={court.type} />
        <Link
          to="/"
          className="absolute top-4 left-4 z-10 bg-[rgba(0,0,0,0.5)] backdrop-blur-[12px] border border-[rgba(255,255,255,0.1)] rounded-lg px-3.5 py-2 font-['Space_Grotesk',sans-serif] text-[10px] uppercase tracking-[1.5px] text-[rgba(255,255,255,0.7)] hover:text-white transition-colors"
        >
          ← Back
        </Link>
      </div>

      {/* Two-column content */}
      <div className="max-w-[1100px] mx-auto px-4 md:px-8">
        <div className="md:grid md:grid-cols-[1fr_340px] md:gap-12 pt-8 pb-24 md:pb-8">
          {/* Left: main content */}
          <div>
            <CourtHeader court={court} />
            <SessionsPreview sessions={sessions} selectedDate={selectedDate} />
            <ReviewsSection courtId={court.id} reviews={reviews} rating={court.rating} />
          </div>

          {/* Right: booking sidebar (hidden on mobile, replaced by bottom bar) */}
          <div className="hidden md:block">
            <BookingSidebar
              court={court}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              selectedSlot={selectedSlot}
              onSlotChange={setSelectedSlot}
              minDate={todayDate()}
            />
            <CourtLocationMap lat={court.lat} lng={court.lng} />
          </div>
        </div>
      </div>

      {/* Mobile: inline calendar + map */}
      <div className="md:hidden px-4 pb-24">
        <GlassCalendar value={selectedDate} onChange={setSelectedDate} minDate={todayDate()} />
        <CourtLocationMap lat={court.lat} lng={court.lng} />
      </div>

      {/* Mobile bottom bar */}
      <MobileBookingBar
        pricePerPlayerPerHour={court.pricePerPlayerPerHour}
        onBook={handleBook}
        disabled={false}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd client && npx tsc --noEmit`
Expected: no errors (warnings about unused imports from old code are fine to clean up)

- [ ] **Step 3: Verify the dev server renders**

Run: `cd /Users/vladghidiu/werk/Lateral_booking && npm run dev`
Open `http://localhost:5173/courts/court-1` and verify:
- Photo hero shows (or placeholder if no photos)
- Two-column layout on desktop
- Court header with badges, rating, amenities
- Sessions preview for today
- Reviews with rating breakdown chart
- Sticky sidebar with calendar, time slots, leather CTA
- Small map below sidebar
- Mobile: single column with sticky bottom bar

- [ ] **Step 4: Commit**

```bash
git add client/src/pages/CourtDetails.tsx
git commit -m "feat: rewrite CourtDetails as full-width two-column layout"
```

---

### Task 10: Hide Scrollbar Utility + Final Polish

**Files:**
- Modify: `client/src/styles/global.css`

The photo carousel on mobile needs a hidden scrollbar. Add the utility class.

- [ ] **Step 1: Add scrollbar-hide utility to global.css**

Add at the end of `client/src/styles/global.css`:

```css
@utility scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}
```

- [ ] **Step 2: Verify dev server still works**

Run: `cd /Users/vladghidiu/werk/Lateral_booking && npm run dev`
Expected: no CSS errors, carousel scrollbar hidden on mobile

- [ ] **Step 3: Run all client tests**

Run: `cd client && npx vitest run`
Expected: all tests pass (including the ratingDistribution tests from Task 1)

- [ ] **Step 4: Run typecheck**

Run: `cd client && npx tsc --noEmit`
Expected: no type errors

- [ ] **Step 5: Commit**

```bash
git add client/src/styles/global.css
git commit -m "feat: add scrollbar-hide utility for photo carousel"
```
