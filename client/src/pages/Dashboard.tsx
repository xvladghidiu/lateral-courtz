import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Booking, Session, Court } from "@shared/types/index.js";
import { useMyBookings, useMySessions } from "../hooks/useBookings.js";
import { useCourts } from "../hooks/useCourts.js";
import { useAuth } from "../context/AuthContext.js";
import { todayDate } from "../components/utils.js";

/* ── helpers ──────────────────────────────────────────────── */

function toMap<T extends { id: string }>(items: T[]): Map<string, T> {
  return new Map(items.map((x) => [x.id, x]));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ── status badge ────────────────────────────────────────── */

const STATUS_COLORS: Record<string, string> = {
  confirmed: "text-[rgba(100,220,140,0.8)]",
  filling: "text-[rgba(255,200,100,0.8)]",
  cancelled: "text-[rgba(255,100,100,0.8)]",
  completed: "text-[rgba(255,255,255,0.5)]",
};

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? STATUS_COLORS.completed;
  return (
    <span className={`bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.1)] rounded-full px-3 py-1 font-['Space_Grotesk',sans-serif] text-[9px] uppercase tracking-[1.5px] ${color}`}>
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
    <div className="flex gap-2 mb-6">
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
                : "bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] text-[rgba(255,255,255,0.5)] hover:bg-[rgba(255,255,255,0.12)]"
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── booking row ─────────────────────────────────────────── */

function BookingRow({
  booking,
  session,
  courtName,
}: {
  booking: Booking;
  session: Session | undefined;
  courtName: string;
}) {
  const navigate = useNavigate();
  const dateTime = session
    ? `${formatDate(session.date)} · ${session.startTime}`
    : formatDate(booking.createdAt);
  const courtId = session?.courtId;

  return (
    <button
      type="button"
      onClick={() => courtId && navigate(`/courts/${courtId}`)}
      className="w-full flex items-center justify-between px-4 py-3.5 bg-[rgba(255,255,255,0.04)] border-b border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.07)] transition-colors cursor-pointer text-left"
    >
      <div className="flex items-center gap-2">
        <span className="font-['Space_Grotesk',sans-serif] text-[13px] text-[rgba(255,255,255,0.85)]">
          {courtName}
        </span>
        <span className="font-['Space_Grotesk',sans-serif] text-[11px] text-[rgba(255,255,255,0.4)]">
          · {dateTime}
        </span>
      </div>
      <StatusBadge status={booking.status} />
    </button>
  );
}

/* ── empty state ─────────────────────────────────────────── */

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] rounded-xl py-8 text-center">
      <p className="font-['Space_Grotesk',sans-serif] text-[11px] text-[rgba(255,255,255,0.3)]">
        {message}
      </p>
    </div>
  );
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

  if (authLoading) return null;

  return (
    <div className="fixed inset-0 bg-[#0a0a0c] text-white overflow-y-auto z-10">
      <div className="max-w-[800px] mx-auto px-4 md:px-8 pt-6 pb-12">
        <Link
          to="/"
          className="inline-block font-['Space_Grotesk',sans-serif] text-[10px] uppercase tracking-[1.5px] text-[rgba(255,255,255,0.4)] hover:text-white transition-colors mb-6"
        >
          &#8592; Back
        </Link>

        <h1 className="font-['Lixdu',sans-serif] text-[22px] uppercase tracking-[3px] text-[rgba(255,255,255,0.85)] mb-6">
          My Bookings
        </h1>

        <TabToggle active={tab} onChange={setTab} />

        {activeList.length === 0 ? (
          <EmptyState message={tab === "upcoming" ? "No upcoming bookings" : "No past bookings"} />
        ) : (
          <div className="rounded-xl overflow-hidden border border-[rgba(255,255,255,0.06)]">
            {activeList.map((b) => {
              const session = sessionById.get(b.sessionId);
              const court = session ? courtsById.get(session.courtId) : undefined;
              const courtName = court?.name ?? `Session ${b.sessionId.slice(0, 8)}`;
              return (
                <BookingRow
                  key={b.id}
                  booking={b}
                  session={session}
                  courtName={courtName}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
