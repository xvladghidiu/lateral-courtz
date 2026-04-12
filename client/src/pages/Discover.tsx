import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Court } from "@shared/types/index.js";
import { useCourts } from "../hooks/useCourts.js";
import { useAllSessions } from "../hooks/useSessions.js";
import { useAuth } from "../context/AuthContext.js";
import Header from "../components/Header.js";
import ShotClockRow from "../components/ShotClockRow.js";
import { mapCenter, courtIcon, getUserLocation, findNearestClusterBounds, userLocationIcon } from "../lib/mapUtils.js";

const TILE_STYLES = {
  dark: { url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", label: "Dark" },
  voyager: { url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", label: "Color" },
  light: { url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", label: "Light" },
  satellite: { url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", label: "Satellite" },
} as const;

export type TileStyle = keyof typeof TILE_STYLES;

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const EMPTY_COURTS: Court[] = [];

/* ── Search Bar with Nominatim geocoding ─────────────── */

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

export function isDarkTile(style: TileStyle): boolean {
  return style === "dark" || style === "satellite";
}

function SearchBar({ onNavigate, dark }: { onNavigate: (lat: number, lng: number) => void; dark: boolean }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  function handleInput(value: string) {
    setQuery(value);
    clearTimeout(debounceRef.current);
    if (value.length < 3) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const params = new URLSearchParams({ q: value, format: "json", limit: "5" });
      const res = await fetch(`${NOMINATIM_URL}?${params}`);
      const data: SearchResult[] = await res.json();
      setResults(data);
      setIsOpen(data.length > 0);
    }, 350);
  }

  function selectResult(result: SearchResult) {
    setQuery(result.display_name);
    setIsOpen(false);
    onNavigate(parseFloat(result.lat), parseFloat(result.lon));
  }

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[5] w-[95%] max-w-[720px]">
      <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl backdrop-blur-[24px] backdrop-saturate-[180%] shadow-[0_8px_32px_rgba(0,0,0,0.3)] ${
        dark
          ? "bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)]"
          : "bg-[rgba(255,255,255,0.15)] border border-[rgba(255,255,255,0.25)]"
      }`}>
        <span className={`text-lg ${dark ? "text-[rgba(255,255,255,0.3)]" : "text-[rgba(0,0,0,0.3)]"}`}>⌕</span>
        <input
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="Search address or neighborhood..."
          className={`flex-1 bg-transparent text-[15px] focus:outline-none placeholder:opacity-40 ${
            dark ? "text-white placeholder:text-white" : "text-black placeholder:text-black"
          }`}
        />
      </div>
      {isOpen && (
        <div className="mt-2 rounded-xl overflow-hidden border border-[rgba(255,255,255,0.1)] bg-[rgba(10,10,12,0.95)] backdrop-blur-[24px]">
          {results.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => selectResult(r)}
              className="w-full text-left px-5 py-3 text-[13px] text-[rgba(255,255,255,0.7)] hover:bg-[rgba(255,255,255,0.08)] border-b border-[rgba(255,255,255,0.06)] last:border-b-0 transition-colors"
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

function CourtTooltipCard({ court }: { court: Court }) {
  return (
    <div style={{ width: 640, borderRadius: 24, overflow: "hidden", background: "rgba(12,12,14,0.94)", backdropFilter: "blur(32px)", boxShadow: "0 20px 64px rgba(0,0,0,0.6)", fontFamily: "'Space Grotesk', sans-serif", border: "1px solid rgba(255,255,255,0.1)" }}>
      <div style={{ position: "relative", height: 280, overflow: "hidden", margin: 0, padding: 0, lineHeight: 0, background: "#333" }}>
        <img src="/assets/basketball-pin.png" alt="" style={{ width: "130%", height: "130%", objectFit: "cover", display: "block", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", imageRendering: "pixelated" as any }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(12,12,14,0.95) 0%, rgba(12,12,14,0.3) 40%, transparent 70%)" }} />
        <div style={{ position: "absolute", top: 14, left: 16, fontSize: 13, fontWeight: 600, color: "#d4a012", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", padding: "5px 12px", borderRadius: 10, display: "flex", alignItems: "center", gap: 5 }}>
          ★ {court.rating} <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>({court.reviewCount})</span>
        </div>
        <div style={{ position: "absolute", bottom: 18, left: 24, right: 24, fontSize: 18, fontWeight: 700, color: "white", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Lixdu', sans-serif", lineHeight: 1.3 }}>
          {court.name}
        </div>
      </div>
      <div style={{ padding: "22px 24px 24px" }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          {[court.type, court.surface].map((label) => (
            <span key={label} style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "2px", color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "6px 14px" }}>
              {label}
            </span>
          ))}
        </div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>{court.address}</div>
        {court.amenities.length > 0 && (
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", marginBottom: 16 }}>
            {court.amenities.join(" · ")}
          </div>
        )}
        <div>
          <span style={{ fontFamily: "'DSEG', monospace", fontSize: 34, color: "rgba(255,255,255,0.9)" }}>${court.pricePerPlayerPerHour}</span>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginLeft: 6 }}>/ hr</span>
        </div>
      </div>
    </div>
  );
}

function CourtMarker({ court }: { court: Court }) {
  const navigate = useNavigate();

  const eventHandlers = useMemo(() => ({
    click: () => navigate(`/courts/${court.id}`),
  }), [court.id, navigate]);

  return (
    <Marker
      position={[court.lat, court.lng]}
      icon={courtIcon(court.id, court.name, court.pricePerPlayerPerHour, court.rating)}
      eventHandlers={eventHandlers}
    >
      <Tooltip
        direction="top"
        offset={[0, -85]}
        opacity={1}
        className="court-tooltip"
      >
        <CourtTooltipCard court={court} />
      </Tooltip>
    </Marker>
  );
}

function TooltipListener({ onChange }: { onChange: (open: boolean) => void }) {
  const map = useMap();
  useEffect(() => {
    const onOpen = () => onChange(true);
    const onClose = () => onChange(false);
    map.on("tooltipopen", onOpen);
    map.on("tooltipclose", onClose);
    return () => {
      map.off("tooltipopen", onOpen);
      map.off("tooltipclose", onClose);
    };
  }, [map, onChange]);
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

function MapStyleSwitcher({
  active,
  onChange,
}: {
  active: TileStyle;
  onChange: (style: TileStyle) => void;
}) {
  return (
    <div className="absolute bottom-6 left-5 z-[5] flex gap-1.5">
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
  const location = useLocation();
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
  const [tileStyle, setTileStyle] = useState<TileStyle>("dark");
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [geoReady, setGeoReady] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const handleMapRef = useCallback((map: L.Map) => { mapRef.current = map; }, []);

  useEffect(() => {
    getUserLocation()
      .then((pos) => {
        setUserLocation(pos);
        setGeoReady(true);
      })
      .catch(() => {
        setGeoReady(true);
      });
  }, []);

  const center = useMemo(() => userLocation ?? mapCenter(courts), [userLocation, courts]);
  const isDark = isDarkTile(tileStyle);
  const userIcon = useMemo(() => userLocationIcon(), []);
  const handleNavigate = useCallback(
    (lat: number, lng: number) => setFlyTarget([lat, lng]),
    [],
  );
  const handleDiscover = useCallback(() => {
    const origin = userLocation ?? center;
    const bounds = findNearestClusterBounds(origin, courts);
    mapRef.current?.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
  }, [userLocation, center, courts]);

  // Always mounted — hide when not on home route
  const isVisible = location.pathname === "/";

  useEffect(() => {
    if (!isVisible || !mapRef.current) return;
    const timer = setTimeout(() => mapRef.current?.invalidateSize(), 50);
    return () => clearTimeout(timer);
  }, [isVisible]);

  if (!geoReady) {
    return (
      <div className="relative w-screen h-screen overflow-hidden bg-[#1a1a1e]" style={{ display: isVisible ? undefined : "none" }} />
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ display: isVisible ? undefined : "none" }}>
      <div className="absolute inset-0">
        <MapContainer
          center={center}
          zoom={userLocation ? 14 : 15}
          zoomControl={false}
          attributionControl={false}
          className="w-full h-full"
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer key={tileStyle} url={TILE_STYLES[tileStyle].url} />
          <TooltipListener onChange={setTooltipOpen} />
          <MapNavigator target={flyTarget} />
          <MapRef onMap={handleMapRef} />
          {courts.map((court) => (
            <CourtMarker key={court.id} court={court} />
          ))}
          {userLocation && (
            <Marker position={userLocation} icon={userIcon} />
          )}
        </MapContainer>
      </div>

      <Header user={user} onLogout={logout} tileStyle={tileStyle} />
      {!tooltipOpen && <SearchBar onNavigate={handleNavigate} dark={isDark} />}
      {!tooltipOpen && (
        <button
          type="button"
          onClick={handleDiscover}
          className={`group absolute top-[10.5rem] left-1/2 z-[5] flex items-center gap-2.5 pl-4 pr-5 py-2.5 rounded-full backdrop-blur-[24px] backdrop-saturate-[180%] shadow-[0_8px_24px_rgba(0,0,0,0.12),0_16px_48px_rgba(0,0,0,0.06)] animate-float transition-shadow duration-300 hover:shadow-[0_12px_32px_rgba(0,0,0,0.18),0_24px_60px_rgba(0,0,0,0.1)] active:scale-95 ${
            isDark
              ? "bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.14)]"
              : "bg-[rgba(255,255,255,0.15)] border border-[rgba(255,255,255,0.25)] hover:bg-[rgba(255,255,255,0.25)]"
          }`}
        >
          <span className="text-[18px] transition-transform duration-300 group-hover:rotate-[360deg]">🏀</span>
          <span className={`font-['Space_Grotesk',sans-serif] text-[13px] uppercase tracking-[3px] ${
            isDark ? "text-[rgba(255,255,255,0.8)]" : "text-[rgba(0,0,0,0.55)]"
          }`}>
            Discover
          </span>
        </button>
      )}
      <ShotClockRow sessions={sessions} courts={courts} />
      <MapStyleSwitcher active={tileStyle} onChange={setTileStyle} />
    </div>
  );
}
