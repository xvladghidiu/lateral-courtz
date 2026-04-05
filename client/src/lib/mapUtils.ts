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
    iconAnchor: [20, 48],
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer">
        <div style="font-size:12px;font-weight:600;padding:5px 11px;background:rgba(16,16,20,0.8);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.05);border-radius:9px;box-shadow:0 4px 16px rgba(0,0,0,0.5);color:#f0f0f0">$${price}</div>
        <div style="width:1px;height:12px;background:linear-gradient(to bottom,#404048,transparent);margin:0 auto"></div>
        <div style="width:5px;height:5px;border-radius:50%;background:#e63328;box-shadow:0 0 8px rgba(230,51,40,0.4)"></div>
      </div>`,
  });
  priceIconCache.set(price, icon);
  return icon;
}
