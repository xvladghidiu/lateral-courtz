# Discover Button & Geolocation Design

## Summary

Default the map to the user's GPS location with a "you are here" pin. Add a "Discover" button (DSEG font) below the search bar that flies the map to the nearest cluster of mocked courts. Add 10 courts in Cluj-Napoca to the seed data.

## Components

### 1. User Geolocation (`mapUtils.ts`)

- `getUserLocation(): Promise<[number, number]>` — wraps `navigator.geolocation.getCurrentPosition`, rejects on denial/timeout (5s)
- `findNearestCluster(userPos: [number, number], courts: Court[]): LatLngBounds` — clusters courts by geographic proximity (>50km apart = separate cluster), finds the cluster whose centroid is closest to the user, returns Leaflet `LatLngBounds` for that cluster

### 2. User Location Pin (`Discover.tsx`)

- State: `userLocation: [number, number] | null`, populated on mount
- If geolocation succeeds: map centers on user's location at zoom 13
- If geolocation fails: falls back to existing `mapCenter(courts)` behavior
- Renders a blue pulsing dot marker at user's location using `L.divIcon` (CSS-only, no image asset)

### 3. Discover Button (`Discover.tsx`)

- Position: directly below the search bar, horizontally centered
- Font: `DSEG` (same as shot clock digits)
- Style: glass backdrop matching search bar dark/light treatment
- Text: "DISCOVER"
- On click: calls `findNearestCluster(userLocation, courts)` and `map.flyToBounds(bounds, { padding: [50, 50] })`
- If no user location available: flies to `mapCenter(courts)` at zoom 13

### 4. Seed Data — 10 Cluj-Napoca Courts (`courts.json`)

Add 10 courts with real-ish names and locations in Cluj-Napoca, Romania. Varied types (indoor/outdoor), surfaces, prices (15-40 RON range converted to USD-equivalent), and ratings.

## Data Flow

```
Mount → getUserLocation()
  ├─ success → setUserLocation([lat, lng]), map centers on user
  └─ failure → map centers on mapCenter(courts) as before

Click "Discover"
  → findNearestCluster(userLocation ?? mapCenter, courts)
  → map.flyToBounds(clusterBounds)
```
