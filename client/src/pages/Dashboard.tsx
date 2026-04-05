import { useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Booking, Session, Court } from "@shared/types/index.js";
import { useMyBookings, useMySessions } from "../hooks/useBookings.js";
import { useCourts } from "../hooks/useCourts.js";
import { useAuth } from "../context/AuthContext.js";
import Header from "../components/Header.js";
import PlayerSlots from "../components/PlayerSlots.js";

/* ── helpers ──────────────────────────────────────────────── */

function toMap<T extends { id: string }>(items: T[]): Map<string, T> {
  return new Map(items.map((x) => [x.id, x]));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/* ── status badges ────────────────────────────────────────── */

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    confirmed: "bg-[rgba(29,185,84,0.12)] text-accent-green border border-[rgba(29,185,84,0.2)]",
    filling: "bg-[rgba(232,114,13,0.12)] text-accent-orange border border-[rgba(232,114,13,0.2)]",
    cancelled: "bg-surface-2 text-text-muted border border-border",
    completed: "bg-surface-2 text-text-secondary border border-border",
  };
  const cls = colors[status] ?? colors.completed;
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-[0.5px] px-2 py-0.5 rounded-md ${cls}`}>
      {status}
    </span>
  );
}

/* ── booking item ─────────────────────────────────────────── */

function BookingItem({ booking, session, courtsById }: { booking: Booking; session: Session | undefined; courtsById: Map<string, Court> }) {
  const court = session ? courtsById.get(session.courtId) : undefined;

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">{court?.name ?? `Session ${booking.sessionId.slice(0, 8)}`}</div>
          {session && (
            <div className="text-xs text-text-muted mt-0.5">
              {formatDate(session.date)} &middot; {session.startTime} &middot; {session.format}
            </div>
          )}
        </div>
        <StatusBadge status={booking.status} />
      </div>
      <div className="text-sm font-bold text-accent-green">${booking.amountPaid.toFixed(2)} paid</div>
    </div>
  );
}

/* ── session item ─────────────────────────────────────────── */

function SessionItem({ session, courtsById }: { session: Session; courtsById: Map<string, Court> }) {
  const court = courtsById.get(session.courtId);

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">{court?.name ?? `Court ${session.courtId.slice(0, 8)}`}</div>
          <div className="text-xs text-text-muted mt-0.5">
            {formatDate(session.date)} &middot; {session.startTime} &middot; {session.format}
          </div>
        </div>
        <StatusBadge status={session.status} />
      </div>
      <PlayerSlots filled={session.players.length} total={session.maxPlayers} size="sm" />
    </div>
  );
}

/* ── empty state ──────────────────────────────────────────── */

function EmptyState({ message }: { message: string }) {
  return (
    <p className="text-sm text-text-muted py-6 text-center bg-surface border border-border rounded-2xl">
      {message}
    </p>
  );
}

/* ── section header ───────────────────────────────────────── */

function SectionTitle({ title }: { title: string }) {
  return <h2 className="text-lg font-semibold tracking-tight mb-4">{title}</h2>;
}

/* ── main page ────────────────────────────────────────────── */

const EMPTY_BOOKINGS: Booking[] = [];
const EMPTY_SESSIONS: Session[] = [];
const EMPTY_COURTS: Court[] = [];

export default function Dashboard() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  const { data: bookings = EMPTY_BOOKINGS } = useMyBookings();
  const { data: mySessions = EMPTY_SESSIONS } = useMySessions();
  const { data: courts = EMPTY_COURTS } = useCourts();

  const courtsById = useMemo(() => toMap(courts), [courts]);
  const sessionById = useMemo(() => toMap(mySessions), [mySessions]);

  if (authLoading) return null;

  return (
    <div className="min-h-screen">
      <Header user={user} onLogout={logout} />
      <div className="max-w-[900px] mx-auto px-4 sm:px-8 py-10">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Dashboard</h1>

        <section className="mb-10">
          <SectionTitle title="My Bookings" />
          {bookings.length === 0 ? (
            <EmptyState message="You haven't joined any games yet." />
          ) : (
            <div className="flex flex-col gap-3">
              {bookings.map((b) => (
                <BookingItem
                  key={b.id}
                  booking={b}
                  session={sessionById.get(b.sessionId)}
                  courtsById={courtsById}
                />
              ))}
            </div>
          )}
        </section>

        <section className="mb-10">
          <SectionTitle title="My Sessions" />
          {mySessions.length === 0 ? (
            <EmptyState message="You haven't created any sessions yet." />
          ) : (
            <div className="flex flex-col gap-3">
              {mySessions.map((s) => (
                <SessionItem key={s.id} session={s} courtsById={courtsById} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
