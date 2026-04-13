import { useState } from "react";
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
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <div className="mt-5 cursor-pointer" onClick={() => setExpanded(true)}>
        <h3 className="font-['Space_Grotesk',sans-serif] text-[11px] uppercase tracking-[2px] text-[rgba(255,255,255,0.5)] mb-3">
          Location
        </h3>
        <div className="rounded-xl overflow-hidden border border-[rgba(255,255,255,0.08)] h-[140px] hover:border-[rgba(255,255,255,0.15)] transition-colors">
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

      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.9)]"
          onClick={() => setExpanded(false)}
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setExpanded(false); }}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.15)] text-white text-[20px] flex items-center justify-center hover:bg-[rgba(255,255,255,0.2)] transition-colors z-10"
          >
            ×
          </button>

          <div
            className="w-[90vw] h-[80vh] rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.1)]"
            onClick={(e) => e.stopPropagation()}
          >
            <MapContainer
              center={[lat, lng]}
              zoom={16}
              zoomControl={true}
              attributionControl={false}
              className="w-full h-full"
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              <Marker position={[lat, lng]} icon={PIN_ICON} />
            </MapContainer>
          </div>
        </div>
      )}
    </>
  );
}
