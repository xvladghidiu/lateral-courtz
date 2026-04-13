import L from "leaflet";
import type { Court } from "@shared/types/index.js";

export function mapCenter(courts: Court[]): [number, number] {
  if (!courts.length) return [40.73, -73.99];
  const lat = courts.reduce((sum, c) => sum + c.lat, 0) / courts.length;
  const lng = courts.reduce((sum, c) => sum + c.lng, 0) / courts.length;
  return [lat, lng];
}

const courtIconCache = new Map<string, L.DivIcon>();

export function courtIcon(id: string, name: string, price: number, rating: number): L.DivIcon {
  const cached = courtIconCache.get(id);
  if (cached) return cached;
  const shortName = name.length > 14 ? name.slice(0, 12) + "…" : name;
  const icon = L.divIcon({
    className: "",
    iconSize: [0, 0],
    iconAnchor: [80, 52],
    html: `
      <div style="display:flex;align-items:center;gap:10px;cursor:pointer;filter:drop-shadow(0 6px 20px rgba(0,0,0,0.4))">
        <div style="width:44px;height:44px;border-radius:50%;background:rgba(12,12,14,0.9);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,0.12);flex-shrink:0">
          <img src="/assets/basketball-pin.png" alt="" style="width:28px;height:28px;border-radius:50%;image-rendering:pixelated" />
        </div>
        <div style="background:rgba(12,12,14,0.9);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:10px 18px;font-family:'Space Grotesk',sans-serif;min-width:120px">
          <div style="font-size:11px;font-weight:600;color:rgba(255,255,255,0.85);letter-spacing:0.3px;white-space:nowrap;margin-bottom:4px">${shortName}</div>
          <div style="display:flex;align-items:center;gap:8px;white-space:nowrap">
            <span style="font-family:'DSEG',monospace;font-size:16px;font-weight:700;color:rgba(255,255,255,0.9)">$${price}</span>
            <span style="font-size:11px;color:#d4a012;font-weight:600">★ ${rating}</span>
          </div>
        </div>
      </div>`,
  });
  courtIconCache.set(id, icon);
  return icon;
}

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

  const assigned: number[] = new Array(courts.length).fill(-1);
  let clusterId = 0;

  for (let i = 0; i < courts.length; i++) {
    if (assigned[i] !== -1) continue;
    assigned[i] = clusterId;
    const queue: number[] = [i];
    while (queue.length) {
      const current = queue.pop() as number;
      const courtA = courts[current] as Court;
      for (let j = 0; j < courts.length; j++) {
        if (assigned[j] !== -1) continue;
        const courtB = courts[j] as Court;
        const dist = haversineKm(
          [courtA.lat, courtA.lng],
          [courtB.lat, courtB.lng]
        );
        if (dist < 50) {
          assigned[j] = clusterId;
          queue.push(j);
        }
      }
    }
    clusterId++;
  }

  const clusters: Court[][] = [];
  for (let i = 0; i < courts.length; i++) {
    const id = assigned[i] as number;
    if (!clusters[id]) clusters[id] = [];
    (clusters[id] as Court[]).push(courts[i] as Court);
  }

  let nearestIdx = 0;
  let nearestDist = Infinity;
  for (let i = 0; i < clusters.length; i++) {
    const c = clusters[i] as Court[];
    const centLat = c.reduce((s, x) => s + x.lat, 0) / c.length;
    const centLng = c.reduce((s, x) => s + x.lng, 0) / c.length;
    const d = haversineKm(userPos, [centLat, centLng]);
    if (d < nearestDist) {
      nearestDist = d;
      nearestIdx = i;
    }
  }

  const nearest = clusters[nearestIdx] as Court[];
  return L.latLngBounds(nearest.map((c) => [c.lat, c.lng] as [number, number]));
}

export function userLocationIcon(): L.DivIcon {
  return L.divIcon({
    className: "",
    iconSize: [0, 0],
    iconAnchor: [70, 52],
    html: `
      <div style="display:flex;align-items:center;gap:10px;filter:drop-shadow(0 6px 20px rgba(0,0,0,0.4))">
        <div style="width:44px;height:44px;border-radius:50%;background:rgba(12,12,14,0.9);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;border:2px solid rgba(74,144,217,0.4);flex-shrink:0;position:relative">
          <div style="width:14px;height:14px;border-radius:50%;background:#4A90D9;box-shadow:0 0 12px rgba(74,144,217,0.6);animation:user-pulse 2s ease infinite"></div>
        </div>
        <div style="background:rgba(12,12,14,0.9);backdrop-filter:blur(16px);border:1px solid rgba(74,144,217,0.2);border-radius:14px;padding:8px 14px;font-family:'Space Grotesk',sans-serif">
          <div style="font-size:11px;font-weight:600;color:rgba(255,255,255,0.85);letter-spacing:0.3px;white-space:nowrap">You are here</div>
          <div style="font-size:9px;color:rgba(74,144,217,0.7);letter-spacing:1px;text-transform:uppercase;margin-top:2px">📍 Current location</div>
        </div>
      </div>`,
  });
}
