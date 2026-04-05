import { useMemo } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Court } from "@shared/types/index.js";
import { useCourts } from "../hooks/useCourts.js";
import { useAuth } from "../context/AuthContext.js";
import Header from "../components/Header.js";
import { mapCenter, priceIcon } from "../lib/mapUtils.js";

/* ── back button ──────────────────────────────────────────── */

function BackButton() {
  return (
    <Link
      to="/"
      className="absolute top-4 left-4 z-[1000] flex items-center gap-2 px-4 py-2 bg-[rgba(12,12,14,0.85)] backdrop-blur-[16px] border border-border rounded-[10px] text-xs font-medium text-text-secondary transition-all duration-200 hover:border-[rgba(255,255,255,0.1)] hover:text-text-primary"
    >
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 12H5M12 5l-7 7 7 7" />
      </svg>
      Back
    </Link>
  );
}

/* ── court popup ──────────────────────────────────────────── */

function CourtPopupContent({ court }: { court: Court }) {
  return (
    <div style={{ minWidth: 180, fontFamily: "Inter, sans-serif", color: "#f0f0f0", background: "transparent" }}>
      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{court.name}</div>
      <div style={{ fontSize: 12, color: "#8a8a96", marginBottom: 4 }}>
        {"★".repeat(Math.round(court.rating))} {court.rating.toFixed(1)} &middot; {court.reviewCount} reviews
      </div>
      <div style={{ fontSize: 11, color: "#8a8a96", marginBottom: 2 }}>
        {court.type === "indoor" ? "Indoor" : "Outdoor"} &middot; {court.surface}
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#f0f0f0", marginBottom: 8 }}>
        ${court.pricePerPlayerPerHour}<span style={{ fontWeight: 400, fontSize: 11, color: "#8a8a96" }}>/player/hr</span>
      </div>
      <a
        href={`/courts/${court.id}`}
        style={{ display: "inline-block", padding: "5px 12px", background: "#e63328", color: "#fff", borderRadius: 7, fontSize: 11, fontWeight: 600, textDecoration: "none" }}
      >
        View court
      </a>
    </div>
  );
}

/* ── map layer ────────────────────────────────────────────── */

function FullMapLayer({ center, courts }: { center: [number, number]; courts: Court[] }) {
  return (
    <MapContainer
      center={center}
      zoom={13}
      zoomControl
      attributionControl={false}
      className="absolute inset-0"
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
      {courts.map((court) => (
        <Marker key={court.id} position={[court.lat, court.lng]} icon={priceIcon(court.pricePerPlayerPerHour)}>
          <Popup>
            <CourtPopupContent court={court} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

/* ── main page ────────────────────────────────────────────── */

const EMPTY_COURTS: Court[] = [];

export default function FullMap() {
  const { user, logout } = useAuth();
  const { data: courts = EMPTY_COURTS } = useCourts();
  const center = useMemo(() => mapCenter(courts), [courts]);

  return (
    <div className="flex flex-col" style={{ height: "100dvh" }}>
      <Header user={user} onLogout={logout} />
      <div className="relative flex-1 overflow-hidden">
        <BackButton />
        <FullMapLayer center={center} courts={courts} />
      </div>
    </div>
  );
}
