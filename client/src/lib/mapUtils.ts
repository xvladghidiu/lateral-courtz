import L from "leaflet";
import type { Court } from "@shared/types/index.js";

export function mapCenter(courts: Court[]): [number, number] {
  if (!courts.length) return [40.73, -73.99];
  const lat = courts.reduce((sum, c) => sum + c.lat, 0) / courts.length;
  const lng = courts.reduce((sum, c) => sum + c.lng, 0) / courts.length;
  return [lat, lng];
}

const priceIconCache = new Map<number, L.DivIcon>();

export function priceIcon(price: number): L.DivIcon {
  const cached = priceIconCache.get(price);
  if (cached) return cached;
  const icon = L.divIcon({
    className: "",
    iconSize: [0, 0],
    iconAnchor: [28, 80],
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer">
        <div style="width:68px;height:68px;border-radius:50%;background:white;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(0,0,0,0.25);border:3px solid rgba(255,255,255,0.95)">
          <img src="/assets/basketball-pin.png" alt="" style="width:46px;height:46px;border-radius:50%;image-rendering:pixelated" />
        </div>
        <div style="margin-top:4px;font-size:15px;font-weight:800;padding:5px 14px;background:white;border-radius:10px;box-shadow:0 3px 12px rgba(0,0,0,0.15);color:#111;letter-spacing:-0.3px;font-family:Inter,sans-serif">$${price}</div>
      </div>`,
  });
  priceIconCache.set(price, icon);
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
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    html: `<div style="width:18px;height:18px;border-radius:50%;background:#4A90D9;border:3px solid white;box-shadow:0 0 8px rgba(74,144,217,0.6);animation:user-pulse 2s ease infinite"></div>`,
  });
}
