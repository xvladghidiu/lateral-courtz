import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Court, Session } from "@shared/types/index.js";
import { useCourts } from "../hooks/useCourts.js";
import { useAllSessions } from "../hooks/useSessions.js";
import { useAuth } from "../context/AuthContext.js";
import Header from "../components/Header.js";
import StatCard from "../components/StatCard.js";
import LiveGameCard from "../components/LiveGameCard.js";
import CourtCard from "../components/CourtCard.js";
import { SkeletonCard, SkeletonCourtCard, SkeletonStat } from "../components/Skeleton.js";
import { mapCenter, priceIcon } from "../lib/mapUtils.js";

/* ── helpers ──────────────────────────────────────────────── */

function courtMap(courts: Court[]): Map<string, Court> {
  return new Map(courts.map((c) => [c.id, c]));
}

function sessionCountMap(sessions: Session[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const s of sessions) {
    m.set(s.courtId, (m.get(s.courtId) ?? 0) + 1);
  }
  return m;
}

function cheapestPrice(courts: Court[]): number {
  if (!courts.length) return 0;
  return Math.min(...courts.map((c) => c.pricePerPlayerPerHour));
}

function almostFullCount(sessions: Session[]): number {
  return sessions.filter((s) => s.maxPlayers - s.players.length <= 2).length;
}

/* ── sub-components ───────────────────────────────────────── */

function SearchIcon() {
  return (
    <svg className="w-4 h-4 text-text-muted shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function HeroSearch() {
  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2.5 px-5 py-2.5 bg-[rgba(12,12,14,0.75)] backdrop-blur-[24px] border border-border rounded-[14px] min-w-[520px] transition-all duration-300 hover:border-[rgba(255,255,255,0.08)]">
      <SearchIcon />
      <span className="text-[13px] text-text-muted font-normal">Search by name, location, or neighborhood...</span>
      <span className="ml-auto text-[10px] font-semibold px-[7px] py-[2px] bg-[rgba(255,255,255,0.04)] border border-border rounded-[5px] text-text-muted">&#8984;K</span>
    </div>
  );
}

function HeroOverlay({ courtCount, gameCount }: { courtCount: number; gameCount: number }) {
  return (
    <div className="absolute bottom-8 left-10 z-[3]">
      <div className="text-[11px] font-medium text-accent-red uppercase tracking-[2px] mb-2">Your area</div>
      <div className="font-[Instrument_Serif] italic text-[48px] font-normal tracking-[-1px] leading-none text-text-primary">
        {courtCount} courts nearby
      </div>
      <div className="text-sm text-text-secondary mt-2 font-normal">
        {gameCount} open game{gameCount !== 1 ? "s" : ""} happening now
      </div>
    </div>
  );
}

function HeroExpandButton() {
  return (
    <Link
      to="/map"
      className="absolute bottom-[42px] right-10 z-10 flex items-center gap-1.5 px-3.5 py-2 bg-[rgba(12,12,14,0.7)] backdrop-blur-[16px] border border-border rounded-[10px] text-xs font-medium text-text-secondary transition-all duration-200 hover:border-[rgba(255,255,255,0.1)] hover:text-text-primary"
    >
      <ExpandIcon />
      Full map
    </Link>
  );
}

function HeroMap({ courts, gameCount }: { courts: Court[]; gameCount: number }) {
  const center = useMemo(() => mapCenter(courts), [courts]);

  return (
    <div className="relative h-[220px] sm:h-[280px] lg:h-[340px] overflow-hidden bg-[#06080c]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,rgba(230,51,40,0.06)_0%,transparent_60%),radial-gradient(ellipse_at_70%_60%,rgba(232,114,13,0.04)_0%,transparent_50%)]" />
      <MapLayer center={center} courts={courts} />
      <div className="absolute bottom-0 left-0 right-0 h-[120px] bg-linear-to-t from-bg to-transparent z-[2]" />
      <HeroSearch />
      <HeroOverlay courtCount={courts.length} gameCount={gameCount} />
      <HeroExpandButton />
    </div>
  );
}

function MapLayer({ center, courts }: { center: [number, number]; courts: Court[] }) {
  return (
    <MapContainer
      center={center}
      zoom={13}
      zoomControl={false}
      attributionControl={false}
      dragging={false}
      scrollWheelZoom={false}
      className="absolute inset-0 z-[1]"
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
      {courts.map((court) => (
        <Marker key={court.id} position={[court.lat, court.lng]} icon={priceIcon(court.pricePerPlayerPerHour)}>
          <Popup>{court.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

function StatsRow({
  courts,
  sessions,
  isLoading,
}: {
  courts: Court[];
  sessions: Session[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-10">
        {Array.from({ length: 4 }, (_, i) => <SkeletonStat key={i} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-10">
      <StatCard value={sessions.length} label="Live games right now" icon="&#9889;" color="red" />
      <StatCard value={almostFullCount(sessions)} label="Almost full \u2014 hurry" icon="&#128293;" color="orange" />
      <StatCard value={courts.length} label="Courts near you" icon="&#128205;" color="green" />
      <StatCard value={`$${cheapestPrice(courts)}`} label="Cheapest available" icon="&#128176;" color="white" />
    </div>
  );
}

function SectionHeader({ title, linkTo }: { title: string; linkTo: string }) {
  return (
    <div className="flex items-baseline justify-between mb-4">
      <h2 className="text-xl font-semibold tracking-[-0.5px]">{title}</h2>
      <Link to={linkTo} className="text-xs font-medium text-text-muted flex items-center gap-1 transition-colors duration-200 hover:text-text-secondary">
        View all
        <ArrowIcon />
      </Link>
    </div>
  );
}

function ScrollRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1 -mx-2 px-2 scrollbar-none">
      {children}
    </div>
  );
}

function GamesList({ sessions, courtsById }: { sessions: Session[]; courtsById: Map<string, Court> }) {
  const navigate = useNavigate();
  return (
    <ScrollRow>
      {sessions.map((s) => {
        const court = courtsById.get(s.courtId);
        if (!court) return null;
        return <LiveGameCard key={s.id} session={s} court={court} onJoin={() => navigate(`/sessions/${s.id}`)} />;
      })}
    </ScrollRow>
  );
}

function OpenGamesSection({ sessions, courtsById, isLoading }: { sessions: Session[]; courtsById: Map<string, Court>; isLoading: boolean }) {
  return (
    <section className="mt-10">
      <SectionHeader title="Open games" linkTo="/map" />
      {isLoading
        ? <ScrollRow>{Array.from({ length: 4 }, (_, i) => <SkeletonCard key={i} />)}</ScrollRow>
        : <GamesList sessions={sessions} courtsById={courtsById} />}
    </section>
  );
}

function CourtsList({ courts, sessionCounts }: { courts: Court[]; sessionCounts: Map<string, number> }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {courts.map((c) => (
        <Link key={c.id} to={`/courts/${c.id}`}>
          <CourtCard court={c} sessionCount={sessionCounts.get(c.id) ?? 0} />
        </Link>
      ))}
    </div>
  );
}

function CourtsGrid({ courts, sessionCounts, isLoading }: { courts: Court[]; sessionCounts: Map<string, number>; isLoading: boolean }) {
  const skeletons = (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {Array.from({ length: 6 }, (_, i) => <SkeletonCourtCard key={i} />)}
    </div>
  );

  return (
    <section className="mt-10 pb-16">
      <SectionHeader title="Courts near you" linkTo="/map" />
      {isLoading ? skeletons : <CourtsList courts={courts} sessionCounts={sessionCounts} />}
    </section>
  );
}

/* ── main page ────────────────────────────────────────────── */

const EMPTY_COURTS: Court[] = [];
const EMPTY_SESSIONS: Session[] = [];

export default function Discover() {
  const { data: courts = EMPTY_COURTS, isLoading: courtsLoading } = useCourts();
  const { data: sessions = EMPTY_SESSIONS, isLoading: sessionsLoading } = useAllSessions("filling");
  const { user, logout } = useAuth();

  const courtsById = useMemo(() => courtMap(courts), [courts]);
  const sessionCounts = useMemo(() => sessionCountMap(sessions), [sessions]);
  const isLoading = courtsLoading || sessionsLoading;

  return (
    <div className="min-h-screen">
      <Header user={user} onLogout={logout} />
      <HeroMap courts={courts} gameCount={sessions.length} />
      <div className="max-w-[1320px] mx-auto px-4 sm:px-8">
        <StatsRow courts={courts} sessions={sessions} isLoading={isLoading} />
        <OpenGamesSection sessions={sessions} courtsById={courtsById} isLoading={isLoading} />
        <CourtsGrid courts={courts} sessionCounts={sessionCounts} isLoading={isLoading} />
      </div>
    </div>
  );
}
