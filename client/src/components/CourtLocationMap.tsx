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
    <div className="mt-5">
      <h3 className="font-['Space_Grotesk',sans-serif] text-[11px] uppercase tracking-[2px] text-[rgba(255,255,255,0.5)] mb-3">
        Location
      </h3>
      <div className="rounded-xl overflow-hidden border border-[rgba(255,255,255,0.08)] h-[140px]">
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
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        <Marker position={[lat, lng]} icon={PIN_ICON} />
      </MapContainer>
      </div>
    </div>
  );
}
