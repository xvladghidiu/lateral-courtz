import { useParams, Link } from "react-router-dom";
import type { Session } from "@shared/types/index.js";
import { useSession } from "../hooks/useSessions.js";
import { useCourt } from "../hooks/useCourts.js";
import { useAuth } from "../context/AuthContext.js";
import Header from "../components/Header.js";
import PlayerSlots from "../components/PlayerSlots.js";

/* ── sub-components ───────────────────────────────────────── */

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    filling: "bg-accent-red-soft text-accent-red",
    confirmed: "bg-[rgba(29,185,84,0.12)] text-accent-green",
    cancelled: "bg-surface-2 text-text-muted",
    completed: "bg-surface-2 text-text-secondary",
  };
  const cls = colors[status] ?? "bg-surface-2 text-text-muted";

  return (
    <span className={`text-[11px] font-semibold uppercase tracking-[0.5px] px-2.5 py-1 rounded-md ${cls}`}>
      {status}
    </span>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-[0.5px] px-2.5 py-1 rounded-md bg-surface-2 border border-border">
      {label}
    </span>
  );
}

function DeadlineCountdown({ deadline }: { deadline: string }) {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return null;

  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);

  return (
    <p className="text-xs text-accent-orange mt-2">
      Auto-cancel in {hours}h {minutes}m if not filled
    </p>
  );
}

function SessionHeader({ session, courtName, courtId }: { session: Session; courtName: string; courtId: string }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <Badge label={session.format} />
        <Badge label={session.mode === "open" ? "Open" : "Private"} />
        <StatusBadge status={session.status} />
      </div>
      <Link to={`/courts/${courtId}`} className="text-lg font-semibold hover:text-accent-red transition">
        {courtName}
      </Link>
      <div className="text-sm text-text-secondary mt-1">
        {session.date} at {session.startTime} &middot; {session.durationMinutes}min
      </div>
      {session.status === "filling" && <DeadlineCountdown deadline={session.autoConfirmDeadline} />}
    </div>
  );
}

function PlayersSection({ session }: { session: Session }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold tracking-tight mb-4">Players</h2>
      <PlayerSlots filled={session.players.length} total={session.maxPlayers} size="md" />
      <p className="text-sm text-text-secondary mt-2">
        {session.players.length}/{session.maxPlayers} players
      </p>
    </div>
  );
}

function JoinButton({ sessionId }: { sessionId: string }) {
  return (
    <Link
      to={`/checkout/${sessionId}`}
      className="inline-block bg-accent-red text-white rounded-lg px-6 py-3 font-medium text-sm hover:shadow-[0_4px_20px_rgba(230,51,40,0.35)] transition-all"
    >
      Join Game
    </Link>
  );
}

function ActionSection({ session, userId }: { session: Session; userId: string | null }) {
  const isInSession = userId ? session.players.includes(userId) : false;
  const isCreator = userId === session.createdBy;
  const isFull = session.players.length >= session.maxPlayers;
  const isOpen = session.mode === "open" && session.status === "filling";

  if (isInSession) {
    return <p className="text-sm font-medium text-accent-green">You&apos;re in this game</p>;
  }

  if (isOpen && !isFull && userId) {
    return <JoinButton sessionId={session.id} />;
  }

  if (!userId) {
    return (
      <p className="text-sm text-text-muted">
        <Link to="/login" state={{ from: `/sessions/${session.id}` }} className="text-accent-red hover:underline">
          Log in
        </Link>{" "}
        to join this game
      </p>
    );
  }

  if (isCreator) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-5">
        <p className="text-sm text-text-secondary mb-1">Share this session</p>
        <p className="text-xs text-text-muted select-all break-all">{window.location.href}</p>
      </div>
    );
  }

  return null;
}

/* ── main page ────────────────────────────────────────────── */

export default function SessionDetails() {
  const { id } = useParams<{ id: string }>();
  const { user, logout } = useAuth();
  const { data: session, isLoading } = useSession(id ?? "");
  const { data: court } = useCourt(session?.courtId ?? "");

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header user={user} onLogout={logout} />
        <div className="max-w-[900px] mx-auto px-8 py-10 text-text-muted">Loading session...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen">
        <Header user={user} onLogout={logout} />
        <div className="max-w-[900px] mx-auto px-8 py-10 text-text-muted">Session not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header user={user} onLogout={logout} />
      <div className="max-w-[900px] mx-auto px-8 py-10">
        <SessionHeader session={session} courtName={court?.name ?? "Loading..."} courtId={session.courtId} />
        <PlayersSection session={session} />
        <ActionSection session={session} userId={user?.id ?? null} />
      </div>
    </div>
  );
}
