import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Court } from "@shared/types/index.js";
import { useCourts } from "../hooks/useCourts.js";
import { useAllSessions } from "../hooks/useSessions.js";
import { useAuth } from "../context/AuthContext.js";
import Header from "../components/Header.js";
import ShotClockRow from "../components/ShotClockRow.js";
import SidePanel from "../components/SidePanel.js";
import { mapCenter, priceIcon, getUserLocation, findNearestClusterBounds, userLocationIcon } from "../lib/mapUtils.js";

const TILE_STYLES = {
  dark: { url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", label: "Dark" },
  voyager: { url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", label: "Color" },
  light: { url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", label: "Light" },
  satellite: { url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", label: "Satellite" },
} as const;

type TileStyle = keyof typeof TILE_STYLES;

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const EMPTY_COURTS: Court[] = [];

/* ── Search Bar with Nominatim geocoding ─────────────── */

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

function isDarkTile(style: TileStyle): boolean {
  return style === "dark" || style === "satellite";
}

function SearchBar({ onNavigate, dark }: { onNavigate: (lat: number, lng: number) => void; dark: boolean }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  function handleInput(value: string) {
    setQuery(value);
    clearTimeout(debounceRef.current);
    if (value.length < 3) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => searchNominatim(value), 400);
  }

  async function searchNominatim(q: string) {
    const params = new URLSearchParams({ q, format: "json", limit: "5" });
    const res = await fetch(`${NOMINATIM_URL}?${params}`);
    const data: SearchResult[] = await res.json();
    setResults(data);
    setIsOpen(data.length > 0);
  }

  function selectResult(result: SearchResult) {
    onNavigate(parseFloat(result.lat), parseFloat(result.lon));
    setQuery(result.display_name.split(",")[0] ?? "");
    setIsOpen(false);
    setResults([]);
  }

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 w-[95%] max-w-[720px]">
      <div className={`flex items-center gap-3 px-6 py-4 backdrop-blur-[24px] backdrop-saturate-[180%] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] ${
        dark
          ? "bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)]"
          : "bg-[rgba(255,255,255,0.15)] border border-[rgba(255,255,255,0.25)]"
      }`}>
        <svg
          className={`w-5 h-5 shrink-0 ${dark ? "text-[rgba(255,255,255,0.4)]" : "text-[rgba(0,0,0,0.35)]"}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Search address or neighborhood..."
          className={`flex-1 text-[15px] bg-transparent outline-none ${
            dark
              ? "text-white placeholder:text-[rgba(255,255,255,0.35)]"
              : "text-[rgba(0,0,0,0.7)] placeholder:text-[rgba(0,0,0,0.35)]"
          }`}
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(""); setResults([]); setIsOpen(false); }}
            className={`transition-colors ${dark ? "text-[rgba(255,255,255,0.35)] hover:text-white" : "text-[rgba(0,0,0,0.35)] hover:text-[rgba(0,0,0,0.6)]"}`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {isOpen && (
        <div className="mt-2 bg-[rgba(255,255,255,0.92)] backdrop-blur-[24px] border border-[rgba(0,0,0,0.08)] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden">
          {results.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => selectResult(r)}
              className="w-full text-left px-5 py-3 text-[13px] text-[rgba(0,0,0,0.65)] hover:bg-[rgba(0,0,0,0.04)] transition-colors border-b border-[rgba(0,0,0,0.04)] last:border-b-0 truncate"
            >
              {r.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Map helpers ─────────────────────────────────────── */

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
    >
      <Tooltip
        direction="top"
        offset={[0, -85]}
        opacity={1}
        className="court-tooltip"
      >
        <div style={{ width: 280, borderRadius: 16, overflow: "hidden", background: "#fff", boxShadow: "0 8px 32px rgba(0,0,0,0.25)", fontFamily: "Inter, sans-serif" }}>
          <div style={{ position: "relative", height: 140, overflow: "hidden", margin: 0, padding: 0, lineHeight: 0, background: "#888" }}>
            <img src="/assets/basketball-pin.png" alt="" style={{ width: "130%", height: "130%", objectFit: "cover", display: "block", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", imageRendering: "pixelated" as any }} />
            <div style={{ position: "absolute", top: 8, right: 8, fontSize: 11, fontWeight: 700, color: "#f59e0b", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", padding: "3px 10px", borderRadius: 8 }}>
              ★ {court.rating}
            </div>
          </div>
          <div style={{ padding: "12px 14px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#111", letterSpacing: "-0.3px" }}>{court.name}</div>
            <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>
              {court.type} · {court.surface} · {court.address}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: "#111" }}>${court.pricePerPlayerPerHour}<span style={{ fontSize: 11, fontWeight: 400, color: "#999" }}>/hr</span></span>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#ff3b30", cursor: "pointer" }}>View Details →</span>
            </div>
          </div>
        </div>
      </Tooltip>
    </Marker>
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

function MapNavigator({ target }: { target: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, 15, { duration: 1.5 });
  }, [target, map]);
  return null;
}

function MapRef({ onMap }: { onMap: (map: L.Map) => void }) {
  const map = useMap();
  useEffect(() => { onMap(map); }, [map, onMap]);
  return null;
}

/* ── Tile style switcher ─────────────────────────────── */

function TileUpdater({ url }: { url: string }) {
  const map = useMap();
  useEffect(() => {
    map.eachLayer((layer) => {
      if ((layer as any)._url) map.removeLayer(layer);
    });
    new (L as any).TileLayer(url).addTo(map);
  }, [url, map]);
  return null;
}

function MapStyleSwitcher({
  active,
  onChange,
}: {
  active: TileStyle;
  onChange: (style: TileStyle) => void;
}) {
  return (
    <div className="absolute bottom-6 left-5 z-20 flex gap-1.5">
      {(Object.keys(TILE_STYLES) as TileStyle[]).map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`px-3.5 py-2 text-[11px] font-bold tracking-[0.5px] rounded-lg backdrop-blur-[16px] transition-all ${
            active === key
              ? "bg-white text-[#111] shadow-[0_2px_10px_rgba(0,0,0,0.15)]"
              : "bg-[rgba(0,0,0,0.45)] text-[rgba(255,255,255,0.7)] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(0,0,0,0.6)] hover:text-white"
          }`}
        >
          {TILE_STYLES[key].label}
        </button>
      ))}
    </div>
  );
}

/* ── Main page ───────────────────────────────────────── */

export default function Discover() {
  const { data: courts = EMPTY_COURTS } = useCourts();
  const { data: sessions = [] } = useAllSessions("filling");
  const { user, logout } = useAuth();
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
  const [tileStyle, setTileStyle] = useState<TileStyle>("dark");

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

  const center = useMemo(() => mapCenter(courts), [courts]);
  const isDark = useMemo(() => isDarkTile(tileStyle), [tileStyle]);
  const userIcon = useMemo(() => userLocationIcon(), []);
  const handlePinClick = useCallback(
    (court: Court) => setSelectedCourt(court),
    [],
  );
  const handleClosePanel = useCallback(() => setSelectedCourt(null), []);
  const handleNavigate = useCallback(
    (lat: number, lng: number) => setFlyTarget([lat, lng]),
    [],
  );
  const handleDiscover = useCallback(() => {
    const origin = userLocation ?? center;
    const bounds = findNearestClusterBounds(origin, courts);
    mapRef.current?.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
  }, [userLocation, center, courts]);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <div
        className={`absolute inset-0 z-0 transition-all duration-300 ${selectedCourt ? "sm:right-[400px]" : ""}`}
      >
        <MapContainer
          center={center}
          zoom={15}
          zoomControl={false}
          attributionControl={false}
          className="w-full h-full"
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url={TILE_STYLES[tileStyle].url} />
          <TileUpdater url={TILE_STYLES[tileStyle].url} />
          <MapResizer panelOpen={!!selectedCourt} />
          <MapNavigator target={flyTarget} />
          <MapRef onMap={handleMapRef} />
          {courts.map((court) => (
            <CourtMarker
              key={court.id}
              court={court}
              onClick={handlePinClick}
            />
          ))}
          {userLocation && (
            <Marker position={userLocation} icon={userIcon} />
          )}
        </MapContainer>
      </div>

      <Header user={user} onLogout={logout} dark={isDark} />
      <SearchBar onNavigate={handleNavigate} dark={isDark} />
      <button
        type="button"
        onClick={handleDiscover}
        className={`group absolute top-[7.5rem] left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-6 py-3 rounded-full backdrop-blur-[24px] backdrop-saturate-[180%] shadow-[0_8px_32px_rgba(0,0,0,0.15)] transition-all duration-300 hover:scale-105 hover:shadow-[0_12px_40px_rgba(255,59,48,0.2)] ${
          isDark
            ? "bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.12)] hover:border-[rgba(255,59,48,0.3)]"
            : "bg-[rgba(255,255,255,0.2)] border border-[rgba(255,255,255,0.3)] hover:bg-[rgba(255,255,255,0.35)] hover:border-[rgba(255,59,48,0.25)]"
        }`}
      >
        <span className="text-[20px] group-hover:animate-bounce">🏀</span>
        <span className={`font-['DSEG',monospace] font-bold text-[14px] tracking-[3px] ${
          isDark
            ? "text-[#ff3b30] [text-shadow:0_0_10px_rgba(255,59,48,0.5),0_0_24px_rgba(255,59,48,0.2)]"
            : "text-[#ff3b30] [text-shadow:0_0_8px_rgba(255,59,48,0.4)]"
        }`}>
          DISCOVER
        </span>
        <span className="text-[14px] opacity-60 group-hover:opacity-100 transition-opacity">→</span>
      </button>
      <ShotClockRow sessions={sessions} courts={courts} />

      <MapStyleSwitcher active={tileStyle} onChange={setTileStyle} />

      {selectedCourt && (
        <SidePanel court={selectedCourt} onClose={handleClosePanel} />
      )}
    </div>
  );
}
