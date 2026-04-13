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

function SearchBar({ onNavigate, onCourtSelect, dark, courts }: { onNavigate: (lat: number, lng: number) => void; onCourtSelect: (court: Court) => void; dark: boolean; courts: Court[] }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const lowerQuery = query.toLowerCase();

  const nameMatches = query.length >= 2
    ? courts.filter((c) => c.name.toLowerCase().includes(lowerQuery) || c.address.toLowerCase().includes(lowerQuery))
    : [];

  const nearbyMatches = results.length > 0 && nameMatches.length === 0
    ? courts.filter((c) => results.some((r) => {
        const dLat = Math.abs(c.lat - parseFloat(r.lat));
        const dLng = Math.abs(c.lng - parseFloat(r.lon));
        return dLat < 0.5 && dLng < 0.5;
      }))
    : [];

  const matchedCourts = nameMatches.length > 0 ? nameMatches : nearbyMatches;
  const hasResults = results.length > 0 || matchedCourts.length > 0;

  function handleInput(value: string) {
    setQuery(value);
    clearTimeout(debounceRef.current);
    const lower = value.toLowerCase();
    const localMatches = value.length >= 2
      ? courts.filter((c) => c.name.toLowerCase().includes(lower) || c.address.toLowerCase().includes(lower))
      : [];
    if (value.length < 3) {
      setResults([]);
      setIsOpen(localMatches.length > 0);
      return;
    }
    setIsOpen(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: value, format: "json", limit: "5" });
        const res = await fetch(`${NOMINATIM_URL}?${params}`);
        const data: SearchResult[] = await res.json();
        setResults(data);
        setIsOpen(data.length > 0 || localMatches.length > 0);
      } catch {
        /* network error — keep showing local matches if any */
      }
    }, 350);
  }

  function selectResult(result: SearchResult) {
    setQuery(result.display_name);
    setIsOpen(false);
    onNavigate(parseFloat(result.lat), parseFloat(result.lon));
  }

  function selectCourt(court: Court) {
    setQuery(court.name);
    setIsOpen(false);
    onCourtSelect(court);
  }

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 w-[95%] max-w-[720px]">
      <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl backdrop-blur-[24px] backdrop-saturate-[180%] shadow-[0_8px_32px_rgba(0,0,0,0.3)] ${
        dark
          ? "bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)]"
          : "bg-[rgba(255,255,255,0.15)] border border-[rgba(255,255,255,0.25)]"
      }`}>
        <svg className={`w-5 h-5 shrink-0 ${dark ? "text-[rgba(255,255,255,0.4)]" : "text-[rgba(0,0,0,0.4)]"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
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
      {isOpen && hasResults && (
        <div className="mt-2 rounded-xl overflow-hidden border border-[rgba(255,255,255,0.1)] bg-[rgba(10,10,12,0.95)] backdrop-blur-[24px] max-h-[60vh] overflow-y-auto">
          {matchedCourts.length > 0 && (
            <>
              <div className="px-5 pt-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[1.5px] text-[rgba(255,255,255,0.3)]">Courts</div>
              {matchedCourts.map((court) => (
                <button
                  key={court.id}
                  type="button"
                  onClick={() => selectCourt(court)}
                  className="w-full text-left px-5 py-3 flex items-center gap-3 text-[13px] text-[rgba(255,255,255,0.85)] hover:bg-[rgba(255,255,255,0.08)] border-b border-[rgba(255,255,255,0.06)] last:border-b-0 transition-colors"
                >
                  <span className="text-[16px]">🏀</span>
                  <span>
                    <span className="font-medium">{court.name}</span>
                    <span className="text-[11px] text-[rgba(255,255,255,0.35)] ml-2">{court.address}</span>
                  </span>
                </button>
              ))}
            </>
          )}
          {results.length > 0 && (
            <>
              <div className="px-5 pt-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[1.5px] text-[rgba(255,255,255,0.3)]">Locations</div>
              {results.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectResult(r)}
                  className="w-full text-left px-5 py-3 flex items-center gap-3 text-[13px] text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.08)] border-b border-[rgba(255,255,255,0.06)] last:border-b-0 transition-colors"
                >
                  <span className="text-[14px]">📍</span>
                  <span>{r.display_name}</span>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Map helpers ─────────────────────────────────────── */

function CourtTooltipCard({ court }: { court: Court }) {
  return (
    <div style={{ width: 420, borderRadius: 16, overflow: "hidden", background: "rgba(12,12,14,0.94)", backdropFilter: "blur(32px)", boxShadow: "0 12px 40px rgba(0,0,0,0.6)", fontFamily: "'Space Grotesk', sans-serif", border: "1px solid rgba(255,255,255,0.1)" }}>
      <div style={{ position: "relative", height: 140, overflow: "hidden", margin: 0, padding: 0, lineHeight: 0, background: "#333" }}>
        <img src="/assets/basketball-pin.png" alt="" style={{ width: "130%", height: "130%", objectFit: "cover", display: "block", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", imageRendering: "pixelated" as any }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(12,12,14,0.95) 0%, rgba(12,12,14,0.3) 40%, transparent 70%)" }} />
        <div style={{ position: "absolute", top: 10, left: 12, fontSize: 13, fontWeight: 700, color: "#d4a012", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(12px)", padding: "5px 10px", borderRadius: 8, display: "flex", alignItems: "center", gap: 4, border: "1px solid rgba(212,160,18,0.25)" }}>
          ★ {court.rating} <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 500 }}>({court.reviewCount})</span>
        </div>
      </div>
      <div style={{ padding: "14px 16px 16px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "white", letterSpacing: "1px", textTransform: "uppercase", fontFamily: "'Lixdu', sans-serif", lineHeight: 1.4, marginBottom: 10, wordBreak: "break-word" as const }}>
          {court.name}
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          {[court.type, court.surface].map((label) => (
            <span key={label} style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "1.5px", color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "4px 10px" }}>
              {label}
            </span>
          ))}
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>{court.address}</div>
        <div>
          <span style={{ fontFamily: "'DSEG', monospace", fontSize: 24, color: "rgba(255,255,255,0.9)" }}>${court.pricePerPlayerPerHour}</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginLeft: 4 }}>/ hr</span>
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

function MapNavigator({ target, onDone }: { target: [number, number] | null; onDone: () => void }) {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    map.flyTo(target, 15, { duration: 1.5 });
    map.once("moveend", onDone);
    return () => { map.off("moveend", onDone); };
  }, [target, map, onDone]);
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
  const [flying, setFlying] = useState(false);

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

    if (!navigator.permissions) return;
    let permStatus: PermissionStatus | null = null;
    const onChange = () => {
      if (permStatus?.state === "granted") {
        getUserLocation().then(setUserLocation).catch(() => {});
      }
    };
    navigator.permissions.query({ name: "geolocation" }).then((s) => {
      permStatus = s;
      s.addEventListener("change", onChange);
    });
    return () => {
      permStatus?.removeEventListener("change", onChange);
    };
  }, []);

  const center = useMemo((): [number, number] => {
    if (userLocation) return userLocation;
    if (courts.length) return [courts[0]!.lat, courts[0]!.lng];
    return mapCenter(courts);
  }, [userLocation, courts]);
  const isDark = isDarkTile(tileStyle);
  const userIcon = useMemo(() => userLocationIcon(), []);
  const playingNow = useMemo(() => sessions.reduce((sum, s) => sum + s.players.length, 0), [sessions]);
  const stopFlying = useCallback(() => setFlying(false), []);
  const handleNavigate = useCallback(
    (lat: number, lng: number) => {
      setFlying(true);
      setFlyTarget([lat, lng]);
    },
    [],
  );
  const handleDiscover = useCallback(() => {
    const origin = userLocation ?? center;
    const bounds = findNearestClusterBounds(origin, courts);
    setFlying(true);
    mapRef.current?.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
    mapRef.current?.once("moveend", () => setFlying(false));
  }, [userLocation, center, courts]);

  // Always mounted — hide when not on home route
  const isVisible = location.pathname === "/";

  useEffect(() => {
    if (!isVisible || !mapRef.current) return;
    const timer = setTimeout(() => mapRef.current?.invalidateSize(), 50);
    return () => clearTimeout(timer);
  }, [isVisible]);

  const autoFlewRef = useRef(false);
  useEffect(() => {
    if (autoFlewRef.current || userLocation || !geoReady || !courts.length || !mapRef.current) return;
    autoFlewRef.current = true;
    const origin: [number, number] = [courts[0]!.lat, courts[0]!.lng];
    const bounds = findNearestClusterBounds(origin, courts);
    const timer = setTimeout(() => {
      mapRef.current?.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
    }, 300);
    return () => clearTimeout(timer);
  }, [geoReady, userLocation, courts]);

  if (!geoReady) {
    return (
      <div className="relative w-screen h-screen overflow-hidden bg-[#1a1a1e] flex items-center justify-center" style={{ display: isVisible ? undefined : "none" }}>
        <span className="text-[64px] animate-ball-spin">🏀</span>
      </div>
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
          <MapNavigator target={flyTarget} onDone={stopFlying} />
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
      {!tooltipOpen && <SearchBar onNavigate={handleNavigate} onCourtSelect={(court) => handleNavigate(court.lat, court.lng)} dark={isDark} courts={courts} />}
      <button
          type="button"
          onClick={handleDiscover}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[5] flex items-center gap-4 px-6 py-4 rounded-2xl border border-[rgba(255,255,255,0.1)] shadow-[0_4px_20px_rgba(232,120,23,0.3),0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_32px_rgba(232,120,23,0.4),0_12px_40px_rgba(0,0,0,0.4)] active:scale-[0.98] transition-all"
          style={{ backgroundImage: "url(/assets/basketball-leather.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}
        >
          <div className="flex-1 text-left">
            <div className="font-['Lixdu',sans-serif] text-[14px] uppercase tracking-[2px] text-white">
              Discover Courts
            </div>
            {userLocation ? (
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-['DSEG',monospace] text-[20px] text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">{playingNow}</span>
                  <span className="font-['Lixdu',sans-serif] text-[10px] uppercase tracking-[1.5px] text-[rgba(255,255,255,0.7)]">Playing</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-['DSEG',monospace] text-[20px] text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">{sessions.length}</span>
                  <span className="font-['Lixdu',sans-serif] text-[10px] uppercase tracking-[1.5px] text-[rgba(255,255,255,0.7)]">Active</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-['DSEG',monospace] text-[20px] text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">{courts.length}</span>
                  <span className="font-['Lixdu',sans-serif] text-[10px] uppercase tracking-[1.5px] text-[rgba(255,255,255,0.7)]">Courts</span>
                </div>
              </div>
            ) : (
              <div className="font-['Space_Grotesk',sans-serif] text-[11px] font-medium text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] mt-0.5">
                Please enable your location for nearby courts
              </div>
            )}
          </div>
      </button>
      <MapStyleSwitcher active={tileStyle} onChange={setTileStyle} />

      {flying && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.4)] backdrop-blur-[4px]">
          <span className="text-[64px] animate-ball-spin">🏀</span>
        </div>
      )}
    </div>
  );
}
