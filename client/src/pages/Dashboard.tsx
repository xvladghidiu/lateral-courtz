import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Booking, Session, Court } from "@shared/types/index.js";
import { useMyBookings, useMySessions } from "../hooks/useBookings.js";
import { useCourts } from "../hooks/useCourts.js";
import { useAuth } from "../context/AuthContext.js";
import { todayDate, formatTime } from "../components/utils.js";

function toMap<T extends { id: string }>(items: T[]): Map<string, T> {
  return new Map(items.map((x) => [x.id, x]));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const pinIcon = L.icon({
  iconUrl: "/assets/basketball-pin.png",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

/* ── status badge ────────────────────────────────────────── */

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-[rgba(100,220,140,0.1)] border-[rgba(100,220,140,0.2)] text-[rgba(100,220,140,0.8)]",
  filling: "bg-[rgba(255,200,100,0.1)] border-[rgba(255,200,100,0.2)] text-[rgba(255,200,100,0.8)]",
  cancelled: "bg-[rgba(255,100,100,0.1)] border-[rgba(255,100,100,0.2)] text-[rgba(255,100,100,0.8)]",
  completed: "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.4)]",
};

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.completed;
  return (
    <span className={`border rounded-full px-3 py-1 font-['Space_Grotesk',sans-serif] text-[9px] uppercase tracking-[1.5px] whitespace-nowrap ${style}`}>
      {status}
    </span>
  );
}

/* ── tab toggle ──────────────────────────────────────────── */

type Tab = "upcoming" | "past";

function TabToggle({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const tabs: { key: Tab; label: string }[] = [
    { key: "upcoming", label: "Upcoming" },
    { key: "past", label: "Past" },
  ];

  return (
    <div className="flex gap-2 mb-8">
      {tabs.map((t) => {
        const isActive = active === t.key;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={`rounded-lg px-5 py-2 font-['Space_Grotesk',sans-serif] text-[11px] uppercase tracking-[2px] font-medium transition-all ${
              isActive
                ? "bg-[rgba(212,160,18,0.15)] border border-[rgba(212,160,18,0.3)] text-[#d4a012]"
                : "bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.5)] hover:bg-[rgba(255,255,255,0.1)]"
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── map thumbnail ──────────────────────────────────────── */

function MapThumb({ lat, lng }: { lat: number; lng: number }) {
  return (
    <div className="w-24 self-stretch shrink-0 rounded-l-xl overflow-hidden">
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
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        <Marker position={[lat, lng]} icon={pinIcon} />
      </MapContainer>
    </div>
  );
}

/* ── booking card ───────────────────────────────────────── */

function BookingCard({
  booking,
  session,
  court,
}: {
  booking: Booking;
  session: Session;
  court: Court;
}) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(`/courts/${court.id}`)}
      className="w-full flex bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] rounded-xl overflow-hidden hover:bg-[rgba(255,255,255,0.1)] transition-colors cursor-pointer text-left"
    >
      <MapThumb lat={court.lat} lng={court.lng} />
      <div className="flex-1 px-4 py-3 flex flex-col justify-between min-w-0">
        <div className="flex items-start justify-between gap-2">
          <span className="font-['Lixdu',sans-serif] text-[13px] uppercase tracking-[1.5px] text-[rgba(255,255,255,0.9)] truncate">
            {court.name}
          </span>
          <StatusBadge status={booking.status} />
        </div>
        <div className="font-['Space_Grotesk',sans-serif] text-[11px] text-[rgba(255,255,255,0.35)] tracking-[0.5px] mt-1">
          {formatTime(session.startTime)} · {session.durationMinutes} min
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="font-['Space_Grotesk',sans-serif] text-[9px] uppercase tracking-[1px] px-2.5 py-0.5 rounded-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.5)]">
            {session.format}
          </span>
          <span className="font-['Space_Grotesk',sans-serif] text-[9px] uppercase tracking-[1px] px-2.5 py-0.5 rounded-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.5)]">
            {session.players.length}/{session.maxPlayers}
          </span>
          <span className="font-['DSEG',monospace] text-[16px] text-[rgba(255,255,255,0.8)] ml-auto">
            ${booking.amountPaid}
          </span>
        </div>
      </div>
    </button>
  );
}

/* ── empty state ─────────────────────────────────────────── */

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <span className="text-[64px] animate-ball-spin mb-6">🏀</span>
      <p className="font-['Space_Grotesk',sans-serif] text-[13px] text-[rgba(255,255,255,0.35)] mb-8">
        {message}
      </p>
      <Link
        to="/"
        className="text-white rounded-xl px-8 py-4 font-['Lixdu',sans-serif] text-[14px] uppercase tracking-[2.5px] hover:shadow-[0_4px_20px_rgba(232,120,23,0.4)] transition-all no-underline"
        style={{ backgroundImage: "url(/assets/basketball-leather.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        Explore Courts
      </Link>
    </div>
  );
}

/* ── timeline ───────────────────────────────────────────── */

interface BookingGroup {
  date: string;
  label: string;
  items: { booking: Booking; session: Session; court: Court }[];
}

function groupByDate(
  bookings: Booking[],
  sessionById: Map<string, Session>,
  courtsById: Map<string, Court>,
): BookingGroup[] {
  const groups = new Map<string, BookingGroup>();

  for (const b of bookings) {
    const session = sessionById.get(b.sessionId);
    if (!session) continue;
    const court = courtsById.get(session.courtId);
    if (!court) continue;

    let group = groups.get(session.date);
    if (!group) {
      group = { date: session.date, label: formatDate(session.date).toUpperCase(), items: [] };
      groups.set(session.date, group);
    }
    group.items.push({ booking: b, session, court });
  }

  const sorted = Array.from(groups.values()).sort((a, b) => a.date.localeCompare(b.date));
  for (const g of sorted) {
    g.items.sort((a, b) => a.session.startTime.localeCompare(b.session.startTime));
  }
  return sorted;
}

/* ── main page ───────────────────────────────────────────── */

const EMPTY_BOOKINGS: Booking[] = [];
const EMPTY_SESSIONS: Session[] = [];
const EMPTY_COURTS: Court[] = [];

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("upcoming");

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  const { data: bookings = EMPTY_BOOKINGS } = useMyBookings();
  const { data: mySessions = EMPTY_SESSIONS } = useMySessions();
  const { data: courts = EMPTY_COURTS } = useCourts();

  const courtsById = useMemo(() => toMap(courts), [courts]);
  const sessionById = useMemo(() => toMap(mySessions), [mySessions]);

  const today = useMemo(() => todayDate(), []);
  const { upcoming, past } = useMemo(() => {
    const up: Booking[] = [];
    const pa: Booking[] = [];
    for (const b of bookings) {
      const session = sessionById.get(b.sessionId);
      if (session && session.date >= today) {
        up.push(b);
      } else {
        pa.push(b);
      }
    }
    return { upcoming: up, past: pa };
  }, [bookings, sessionById, today]);

  const activeList = tab === "upcoming" ? upcoming : past;
  const groups = useMemo(
    () => groupByDate(activeList, sessionById, courtsById),
    [activeList, sessionById, courtsById],
  );

  if (authLoading) return null;

  return (
    <div className="fixed inset-0 text-white z-10">
      {/* Dark map background — fixed so it doesn't scroll */}
      <div className="fixed inset-0 z-0">
        <MapContainer
          center={[40.73, -73.99]}
          zoom={13}
          zoomControl={false}
          attributionControl={false}
          dragging={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          touchZoom={false}
          keyboard={false}
          className="w-full h-full"
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        </MapContainer>
      </div>
      <div className="fixed inset-0 z-[1] bg-[rgba(10,10,12,0.85)]" />

      {/* Content — scrollable */}
      <div className="relative z-[2] max-w-[800px] mx-auto px-4 md:px-8 pt-6 pb-12 h-full overflow-y-auto">
        <Link
          to="/"
          className="inline-block font-['Space_Grotesk',sans-serif] text-[10px] uppercase tracking-[1.5px] text-[rgba(255,255,255,0.4)] hover:text-white transition-colors mb-6"
        >
          &#8592; Back
        </Link>

        <h1 className="font-['Lixdu',sans-serif] text-[36px] uppercase tracking-[4px] text-white mb-3">
          My Bookings
        </h1>

        <TabToggle active={tab} onChange={setTab} />

        {activeList.length === 0 ? (
          <EmptyState message={tab === "upcoming" ? "No upcoming bookings" : "No past bookings"} />
        ) : (
          <div className="relative pl-8">
            {/* Timeline line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[rgba(255,255,255,0.08)]" />

            {groups.map((group) => (
              <div key={group.date} className="relative mb-6">
                {/* Gold dot */}
                <div className="absolute -left-8 top-[3px] w-[14px] h-[14px] rounded-full bg-[rgba(212,160,18,0.3)] border-2 border-[#d4a012]" />

                {/* Date label */}
                <div className="font-['Space_Grotesk',sans-serif] text-[10px] font-semibold uppercase tracking-[1.5px] text-[rgba(255,255,255,0.35)] mb-3">
                  {group.label}
                </div>

                {/* Cards for this date */}
                <div className="flex flex-col gap-3">
                  {group.items.map(({ booking, session, court }) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      session={session}
                      court={court}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
