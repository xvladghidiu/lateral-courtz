import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import type { Court, Session, Review, CreateReviewInput } from "@shared/types/index.js";
import { useCourt } from "../hooks/useCourts.js";
import { useCourtSessions } from "../hooks/useSessions.js";
import { useReviews, usePostReview } from "../hooks/useReviews.js";
import { useAuth } from "../context/AuthContext.js";
import Header from "../components/Header.js";
import PlayerSlots from "../components/PlayerSlots.js";
import ReviewCard from "../components/ReviewCard.js";
import { capitalize } from "../components/utils.js";

/* ── helpers ──────────────────────────────────────────────── */

function todayDate(): string {
  return new Date().toISOString().split("T")[0]!;
}

/* ── sub-components: Court Header ────────────────────────── */

function TypeBadge({ type }: { type: string }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-[0.5px] px-2.5 py-1 rounded-md bg-surface-2 border border-border">
      {type === "indoor" ? "Indoor" : "Outdoor"}
    </span>
  );
}

function SurfaceBadge({ surface }: { surface: string }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-[0.5px] px-2.5 py-1 rounded-md bg-surface-2 border border-border">
      {capitalize(surface)}
    </span>
  );
}

function RatingDisplay({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-accent-amber font-semibold text-sm">{"★".repeat(Math.round(rating))}</span>
      <span className="text-sm font-semibold">{rating.toFixed(1)}</span>
      <span className="text-xs text-text-muted">({reviewCount} reviews)</span>
    </div>
  );
}

function AmenityPill({ label }: { label: string }) {
  return (
    <span className="text-[11px] px-3 py-1 rounded-full bg-surface-2 border border-border text-text-secondary">
      {label}
    </span>
  );
}

function CourtHeader({ court }: { court: Court }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold tracking-tight mb-2">{court.name}</h1>
      <p className="text-sm text-text-secondary mb-4">{court.address}</p>
      <div className="flex items-center gap-2.5 flex-wrap mb-4">
        <TypeBadge type={court.type} />
        <SurfaceBadge surface={court.surface} />
        <RatingDisplay rating={court.rating} reviewCount={court.reviewCount} />
      </div>
      <div className="flex gap-2 flex-wrap mb-4">
        {court.amenities.map((a) => <AmenityPill key={a} label={a} />)}
      </div>
      <div className="text-2xl font-bold tracking-tight">
        ${court.pricePerPlayerPerHour}
        <span className="text-sm font-normal text-text-muted"> / player / hr</span>
      </div>
    </div>
  );
}

/* ── sub-components: Sessions Section ────────────────────── */

function DatePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-surface border border-border rounded-lg px-4 py-2.5 text-sm focus:border-accent-red transition"
    />
  );
}

function SessionCTAs({ courtId }: { courtId: string }) {
  return (
    <div className="flex gap-3">
      <Link
        to={`/sessions/new?courtId=${courtId}&mode=open`}
        className="bg-accent-red text-white rounded-lg px-5 py-2.5 font-medium text-sm hover:shadow-[0_4px_20px_rgba(230,51,40,0.35)] transition-all"
      >
        Create a Game
      </Link>
      <Link
        to={`/sessions/new?courtId=${courtId}&mode=private`}
        className="bg-surface-2 border border-border text-text-primary rounded-lg px-5 py-2.5 font-medium text-sm hover:border-border-hover transition-all"
      >
        Book Full Court
      </Link>
    </div>
  );
}

function SessionRow({ session, onJoin }: { session: Session; onJoin: () => void }) {
  const spotsLeft = session.maxPlayers - session.players.length;

  return (
    <div className="bg-surface border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">{session.format}</span>
          <span className="text-xs text-text-muted">{session.startTime}</span>
          <span className="text-xs text-text-muted">{session.durationMinutes}min</span>
        </div>
        {spotsLeft > 0 && (
          <button
            type="button"
            onClick={onJoin}
            className="bg-accent-red text-white rounded-lg px-4 py-2 text-xs font-semibold hover:shadow-[0_4px_20px_rgba(230,51,40,0.35)] transition-all"
          >
            Join
          </button>
        )}
      </div>
      <PlayerSlots filled={session.players.length} total={session.maxPlayers} size="sm" />
    </div>
  );
}

function SessionsList({ sessions }: { sessions: Session[] }) {
  const navigate = useNavigate();

  if (!sessions.length) {
    return <p className="text-sm text-text-muted py-6">No sessions for this date</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {sessions.map((s) => (
        <SessionRow key={s.id} session={s} onJoin={() => navigate(`/sessions/${s.id}`)} />
      ))}
    </div>
  );
}

function SessionsSection({ courtId, sessions }: { courtId: string; sessions: Session[] }) {
  const [date, setDate] = useState(todayDate);

  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold tracking-tight mb-4">Sessions</h2>
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <DatePicker value={date} onChange={setDate} />
        <SessionCTAs courtId={courtId} />
      </div>
      <SessionsList sessions={sessions} />
    </section>
  );
}

/* ── sub-components: Review Form ─────────────────────────── */

function StarSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1 mb-3">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`w-8 h-8 rounded-md text-sm font-bold transition ${
            n <= value
              ? "bg-accent-amber text-bg"
              : "bg-surface-2 border border-border text-text-muted"
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function ReviewForm({ courtId }: { courtId: string }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const { mutate, isPending } = usePostReview(courtId);

  if (!user) {
    return (
      <p className="text-sm text-text-muted mt-4">
        <Link to="/login" className="text-accent-red hover:underline">Log in</Link> to leave a review
      </p>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const input: CreateReviewInput = { rating, comment };
    mutate(input, { onSuccess: () => setComment("") });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <h3 className="text-sm font-semibold mb-3">Add a review</h3>
      <StarSelector value={rating} onChange={setRating} />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience..."
        rows={3}
        className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-sm focus:border-accent-red transition placeholder:text-text-muted resize-none mb-3"
      />
      <button
        type="submit"
        disabled={isPending || !comment.trim()}
        className="bg-accent-red text-white rounded-lg px-5 py-2.5 font-medium text-sm hover:shadow-[0_4px_20px_rgba(230,51,40,0.35)] transition-all disabled:opacity-50"
      >
        {isPending ? "Posting..." : "Submit review"}
      </button>
    </form>
  );
}

function ReviewsSection({ courtId, reviews }: { courtId: string; reviews: Review[] }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold tracking-tight mb-4">Reviews</h2>
      {reviews.length === 0 && <p className="text-sm text-text-muted">No reviews yet</p>}
      {reviews.map((r) => (
        <ReviewCard key={r.id} review={r} userName={r.userId.slice(0, 8)} />
      ))}
      <ReviewForm courtId={courtId} />
    </section>
  );
}

/* ── main page ────────────────────────────────────────────── */

const EMPTY_SESSIONS: Session[] = [];
const EMPTY_REVIEWS: Review[] = [];

export default function CourtDetails() {
  const { id } = useParams<{ id: string }>();
  const { user, logout } = useAuth();
  const { data: court, isLoading: courtLoading } = useCourt(id ?? "");
  const { data: sessions = EMPTY_SESSIONS } = useCourtSessions(id ?? "", todayDate());
  const { data: reviews = EMPTY_REVIEWS } = useReviews(id ?? "");

  if (courtLoading) {
    return (
      <div className="min-h-screen">
        <Header user={user} onLogout={logout} />
        <div className="max-w-[900px] mx-auto px-8 py-10 text-text-muted">Loading court...</div>
      </div>
    );
  }

  if (!court) {
    return (
      <div className="min-h-screen">
        <Header user={user} onLogout={logout} />
        <div className="max-w-[900px] mx-auto px-8 py-10 text-text-muted">Court not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header user={user} onLogout={logout} />
      <div className="max-w-[900px] mx-auto px-8 py-10">
        <CourtHeader court={court} />
        <SessionsSection courtId={court.id} sessions={sessions} />
        <ReviewsSection courtId={court.id} reviews={reviews} />
      </div>
    </div>
  );
}
