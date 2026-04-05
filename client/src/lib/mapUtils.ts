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
