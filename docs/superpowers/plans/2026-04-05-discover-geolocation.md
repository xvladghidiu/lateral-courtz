# Discover Button & Geolocation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Default the map to the user's GPS location, add a Discover button that flies to the nearest court cluster, and seed 10 Cluj-Napoca courts.

**Architecture:** Extend `mapUtils.ts` with geolocation and clustering helpers. Modify `Discover.tsx` to use user location as default center, add a user-location marker, and render a Discover button. Extend `courts.json` with 10 Cluj-Napoca entries.

**Tech Stack:** React, Leaflet, react-leaflet, browser Geolocation API, TypeScript

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `server/src/data/courts.json` | Modify | Add 10 Cluj-Napoca courts |
| `client/src/lib/mapUtils.ts` | Modify | Add `getUserLocation()`, `findNearestClusterBounds()`, `userLocationIcon()` |
| `client/src/pages/Discover.tsx` | Modify | Geolocation on mount, user marker, Discover button, fly-to-cluster logic |
| `client/src/styles/global.css` | Modify | Add user-location pulse animation |

---

### Task 1: Add 10 Cluj-Napoca Courts to Seed Data

**Files:**
- Modify: `server/src/data/courts.json`

- [ ] **Step 1: Add 10 courts to courts.json**

Append these entries after the existing 6 courts. Use IDs `court-7` through `court-16`. All coordinates are in Cluj-Napoca, Romania (approx 46.77°N, 23.59°E):

```json
{"id":"court-7","name":"Sala Polivalentă Cluj","address":"Aleea Stadionului 2, Cluj-Napoca","lat":46.7654,"lng":23.5705,"type":"indoor","surface":"hardwood","amenities":["lights","parking","lockers","showers","water"],"photos":[],"pricePerPlayerPerHour":10,"rating":4.8,"reviewCount":52},
{"id":"court-8","name":"Parcul Central Courts","address":"Str. Napoca 1, Cluj-Napoca","lat":46.7712,"lng":23.5897,"type":"outdoor","surface":"asphalt","amenities":["lights","water"],"photos":[],"pricePerPlayerPerHour":5,"rating":4.1,"reviewCount":19},
{"id":"court-9","name":"Gheorgheni Sports Hall","address":"Str. Alexandru Vaida Voevod 53, Cluj-Napoca","lat":46.7632,"lng":23.6145,"type":"indoor","surface":"rubber","amenities":["lights","lockers","water"],"photos":[],"pricePerPlayerPerHour":8,"rating":4.4,"reviewCount":27},
{"id":"court-10","name":"Mănăștur Playground","address":"Str. Primăverii 24, Cluj-Napoca","lat":46.7589,"lng":23.5498,"type":"outdoor","surface":"asphalt","amenities":["lights"],"photos":[],"pricePerPlayerPerHour":4,"rating":3.9,"reviewCount":11},
{"id":"court-11","name":"Baza Sportivă Clujana","address":"Str. Fabricii 10, Cluj-Napoca","lat":46.7845,"lng":23.5732,"type":"outdoor","surface":"asphalt","amenities":["lights","parking","water"],"photos":[],"pricePerPlayerPerHour":6,"rating":4.0,"reviewCount":14},
{"id":"court-12","name":"FEFS University Gym","address":"Str. Pandurilor 7, Cluj-Napoca","lat":46.7681,"lng":23.5812,"type":"indoor","surface":"hardwood","amenities":["lights","lockers","showers","water"],"photos":[],"pricePerPlayerPerHour":9,"rating":4.6,"reviewCount":35},
{"id":"court-13","name":"Mărăști Basketball Court","address":"Str. Aurel Vlaicu 2, Cluj-Napoca","lat":46.7756,"lng":23.6054,"type":"outdoor","surface":"asphalt","amenities":["lights","water"],"photos":[],"pricePerPlayerPerHour":5,"rating":4.2,"reviewCount":22},
{"id":"court-14","name":"Sigma Center Courts","address":"Str. Meteor 12, Cluj-Napoca","lat":46.7543,"lng":23.5643,"type":"indoor","surface":"rubber","amenities":["lights","parking","lockers","water"],"photos":[],"pricePerPlayerPerHour":11,"rating":4.5,"reviewCount":29},
{"id":"court-15","name":"Zorilor Recreation Park","address":"Str. Observatorului 130, Cluj-Napoca","lat":46.7498,"lng":23.5789,"type":"outdoor","surface":"asphalt","amenities":["water"],"photos":[],"pricePerPlayerPerHour":4,"rating":3.7,"reviewCount":9},
{"id":"court-16","name":"Iulius Park Court","address":"Str. Alexandru Vaida Voevod 100, Cluj-Napoca","lat":46.7621,"lng":23.6212,"type":"outdoor","surface":"rubber","amenities":["lights","parking","water"],"photos":[],"pricePerPlayerPerHour":7,"rating":4.3,"reviewCount":20}
```

- [ ] **Step 2: Commit**

```bash
git add server/src/data/courts.json
git commit -m "feat: add 10 Cluj-Napoca basketball courts to seed data"
```

---

### Task 2: Add Geolocation and Clustering Helpers to mapUtils

**Files:**
- Modify: `client/src/lib/mapUtils.ts`

- [ ] **Step 1: Add `getUserLocation` function**

Append to `mapUtils.ts`:

```typescript
export function getUserLocation(): Promise<[number, number]> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve([pos.coords.latitude, pos.coords.longitude]),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  });
}
```

- [ ] **Step 2: Add `findNearestClusterBounds` function**

This function groups courts into clusters where courts within 50km of each other belong to the same cluster, then returns the Leaflet `LatLngBounds` of the cluster closest to the user.

```typescript
function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos((a[0] * Math.PI) / 180) *
      Math.cos((b[0] * Math.PI) / 180) *
      sinLng * sinLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function findNearestClusterBounds(
  userPos: [number, number],
  courts: Court[]
): L.LatLngBounds {
  if (!courts.length) return L.latLngBounds([userPos, userPos]);

  // Simple single-linkage clustering with 50km threshold
  const assigned = new Array(courts.length).fill(-1);
  let clusterId = 0;

  for (let i = 0; i < courts.length; i++) {
    if (assigned[i] !== -1) continue;
    assigned[i] = clusterId;
    const queue = [i];
    while (queue.length) {
      const current = queue.pop()!;
      for (let j = 0; j < courts.length; j++) {
        if (assigned[j] !== -1) continue;
        const dist = haversineKm(
          [courts[current].lat, courts[current].lng],
          [courts[j].lat, courts[j].lng]
        );
        if (dist < 50) {
          assigned[j] = clusterId;
          queue.push(j);
        }
      }
    }
    clusterId++;
  }

  // Group courts by cluster and find centroid of each
  const clusters: Court[][] = [];
  for (let i = 0; i < courts.length; i++) {
    if (!clusters[assigned[i]]) clusters[assigned[i]] = [];
    clusters[assigned[i]].push(courts[i]);
  }

  // Find cluster whose centroid is closest to user
  let nearestIdx = 0;
  let nearestDist = Infinity;
  for (let i = 0; i < clusters.length; i++) {
    const c = clusters[i];
    const centLat = c.reduce((s, x) => s + x.lat, 0) / c.length;
    const centLng = c.reduce((s, x) => s + x.lng, 0) / c.length;
    const d = haversineKm(userPos, [centLat, centLng]);
    if (d < nearestDist) {
      nearestDist = d;
      nearestIdx = i;
    }
  }

  const nearest = clusters[nearestIdx];
  return L.latLngBounds(nearest.map((c) => [c.lat, c.lng] as [number, number]));
}
```

- [ ] **Step 3: Add `userLocationIcon` factory**

```typescript
export function userLocationIcon(): L.DivIcon {
  return L.divIcon({
    className: "",
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    html: `<div style="width:18px;height:18px;border-radius:50%;background:#4A90D9;border:3px solid white;box-shadow:0 0 8px rgba(74,144,217,0.6);animation:user-pulse 2s ease infinite"></div>`,
  });
}
```

- [ ] **Step 4: Commit**

```bash
git add client/src/lib/mapUtils.ts
git commit -m "feat: add geolocation, clustering, and user-location icon helpers"
```

---

### Task 3: Add User-Location Pulse Animation

**Files:**
- Modify: `client/src/styles/global.css`

- [ ] **Step 1: Add `user-pulse` keyframes**

Append before the closing of the file:

```css
@keyframes user-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(74, 144, 217, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(74, 144, 217, 0); }
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/styles/global.css
git commit -m "feat: add user-location pulse animation"
```

---

### Task 4: Wire Up Geolocation, User Marker, and Discover Button in Discover Page

**Files:**
- Modify: `client/src/pages/Discover.tsx`

- [ ] **Step 1: Add imports**

Update the import from `mapUtils.ts` to include the new functions:

```typescript
import { mapCenter, priceIcon, getUserLocation, findNearestClusterBounds, userLocationIcon } from "../lib/mapUtils.js";
```

- [ ] **Step 2: Add `useMap` accessor component for Discover button**

Add a component that exposes the map instance to siblings via a callback:

```typescript
function MapRef({ onMap }: { onMap: (map: L.Map) => void }) {
  const map = useMap();
  useEffect(() => { onMap(map); }, [map, onMap]);
  return null;
}
```

- [ ] **Step 3: Add geolocation state and effect in `Discover` component**

Inside the `Discover` component, add:

```typescript
const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
const mapRef = useRef<L.Map | null>(null);
const handleMapRef = useCallback((map: L.Map) => { mapRef.current = map; }, []);

useEffect(() => {
  getUserLocation()
    .then((pos) => {
      setUserLocation(pos);
      mapRef.current?.flyTo(pos, 13, { duration: 1.5 });
    })
    .catch(() => {});
}, []);
```

- [ ] **Step 4: Add `handleDiscover` callback**

```typescript
const handleDiscover = useCallback(() => {
  const origin = userLocation ?? mapCenter(courts);
  const bounds = findNearestClusterBounds(origin, courts);
  mapRef.current?.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
}, [userLocation, courts]);
```

- [ ] **Step 5: Add `<MapRef>` inside `<MapContainer>`**

Add right after the existing `<MapNavigator>`:

```tsx
<MapRef onMap={handleMapRef} />
```

- [ ] **Step 6: Add user location marker inside `<MapContainer>`**

Add after the court markers loop:

```tsx
{userLocation && (
  <Marker position={userLocation} icon={userLocationIcon()} />
)}
```

- [ ] **Step 7: Add Discover button below SearchBar in JSX**

Place this right after `<SearchBar onNavigate={handleNavigate} dark={isDarkTile(tileStyle)} />`:

```tsx
<button
  type="button"
  onClick={handleDiscover}
  className={`absolute top-[7.5rem] left-1/2 -translate-x-1/2 z-20 font-['DSEG',monospace] font-bold text-[16px] tracking-[3px] px-8 py-3 rounded-xl backdrop-blur-[24px] backdrop-saturate-[180%] shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all hover:scale-105 ${
    isDarkTile(tileStyle)
      ? "bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] text-[#ff3b30] [text-shadow:0_0_10px_rgba(255,59,48,0.5),0_0_24px_rgba(255,59,48,0.2)] hover:bg-[rgba(255,255,255,0.14)]"
      : "bg-[rgba(255,255,255,0.15)] border border-[rgba(255,255,255,0.25)] text-[#ff3b30] [text-shadow:0_0_8px_rgba(255,59,48,0.4)] hover:bg-[rgba(255,255,255,0.25)]"
  }`}
>
  DISCOVER
</button>
```

- [ ] **Step 8: Commit**

```bash
git add client/src/pages/Discover.tsx
git commit -m "feat: add geolocation default, user pin, and Discover button"
```

---

### Task 5: Verify Everything Works

- [ ] **Step 1: Start the dev server and verify**

```bash
cd /Users/vladghidiu/werk/Lateral_booking && npm run dev
```

Check:
1. Map starts at your GPS location (or falls back to court center if denied)
2. Blue pulsing dot at your location
3. "DISCOVER" button visible below search bar in DSEG font
4. Clicking Discover flies to nearest court cluster
5. All 16 courts render as pins on the map
