import { useState, useMemo, useCallback, useEffect } from "react";
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

const TILE_URL =
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const EMPTY_COURTS: Court[] = [];

function SearchBar() {
  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-6 py-3.5 bg-glass-light backdrop-blur-[24px] backdrop-saturate-[180%] border border-glass-border-light rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] w-[90%] max-w-[480px]">
      <svg
        className="w-5 h-5 text-text-on-light-muted shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <span className="text-[15px] text-text-on-light-muted font-normal">
        Search courts near you...
      </span>
    </div>
  );
}

function CourtMarker({
  court,
  onClick,
}: {
  court: Court;
  onClick: (court: Court) => void;
}) {
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
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 350);
    return () => clearTimeout(timer);
  }, [panelOpen, map]);
  return null;
}

export default function Discover() {
  const { data: courts = EMPTY_COURTS } = useCourts();
  const { data: sessions = [] } = useAllSessions("filling");
  const { user, logout } = useAuth();
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);

  const center = useMemo(() => mapCenter(courts), [courts]);
  const handlePinClick = useCallback(
    (court: Court) => setSelectedCourt(court),
    [],
  );
  const handleClosePanel = useCallback(() => setSelectedCourt(null), []);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <div
        className={`absolute inset-0 transition-all duration-300 ${selectedCourt ? "sm:right-[400px]" : ""}`}
      >
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
            <CourtMarker
              key={court.id}
              court={court}
              onClick={handlePinClick}
            />
          ))}
        </MapContainer>
      </div>

      <Header user={user} onLogout={logout} />
      <SearchBar />
      <ShotClockRow sessions={sessions} courts={courts} />

      {selectedCourt && (
        <SidePanel court={selectedCourt} onClose={handleClosePanel} />
      )}
    </div>
  );
}
