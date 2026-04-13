import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Review, CreateReviewInput } from "@shared/types/index.js";
import { useCourt } from "../hooks/useCourts.js";
import { useReviews, usePostReview } from "../hooks/useReviews.js";
import { useAuth } from "../context/AuthContext.js";
import CourtHeader from "../components/CourtHeader.js";
import RatingBreakdown from "../components/RatingBreakdown.js";
import BookingSidebar from "../components/BookingSidebar.js";
import CourtLocationMap from "../components/CourtLocationMap.js";
import MobileBookingBar from "../components/MobileBookingBar.js";

/* ── Review sub-components (kept inline, same page concern) ── */

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
              ? "bg-[rgba(255,255,255,0.15)] text-white"
              : "bg-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.4)]"
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
      <p className="font-['Space_Grotesk',sans-serif] text-[11px] uppercase tracking-[1.5px] text-[rgba(255,255,255,0.4)] mt-4">
        <Link to="/login" className="text-white hover:underline">Log in</Link> to leave a review
      </p>
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input: CreateReviewInput = { rating, comment };
    mutate(input, { onSuccess: () => setComment("") });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <h3 className="font-['Space_Grotesk',sans-serif] text-[11px] uppercase tracking-[1.5px] text-[rgba(255,255,255,0.6)] mb-3">
        Add a review
      </h3>
      <StarSelector value={rating} onChange={setRating} />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience..."
        rows={3}
        className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white text-[14px] focus:border-[rgba(255,255,255,0.25)] outline-none placeholder:text-[rgba(255,255,255,0.25)] resize-none mb-3"
      />
      <button
        type="submit"
        disabled={isPending || !comment.trim()}
        className="text-white rounded-xl px-6 py-3 font-['Lixdu',sans-serif] text-[14px] uppercase tracking-[3px] hover:shadow-[0_4px_20px_rgba(232,120,23,0.4)] transition-all disabled:opacity-50"
        style={{ backgroundImage: "url(/assets/basketball-leather.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        {isPending ? "Posting..." : "Submit review"}
      </button>
    </form>
  );
}

function ReviewItem({ review }: { review: Review }) {
  const userName = review.userId.slice(0, 8);
  const formatted = new Date(review.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="py-3.5 border-b border-[rgba(255,255,255,0.08)]">
      <div className="flex items-center gap-2.5 mb-1.5">
        <span className="text-[#d4a012] text-[13px]">
          {Array.from({ length: 5 }, (_, i) => (i < review.rating ? "\u2605" : "\u2606")).join("")}
        </span>
        <span className="text-[13px] text-[rgba(255,255,255,0.85)]">{userName}</span>
        <span className="text-[11px] text-[rgba(255,255,255,0.4)]">{formatted}</span>
      </div>
      <p className="text-[13px] text-[rgba(255,255,255,0.7)] leading-normal">{review.comment}</p>
    </div>
  );
}

function ReviewsSection({ courtId, reviews, rating }: { courtId: string; reviews: Review[]; rating: number }) {
  return (
    <section className="pt-5">
      <h3 className="font-['Space_Grotesk',sans-serif] text-[11px] uppercase tracking-[2px] text-[rgba(255,255,255,0.5)] mb-4">
        Reviews
      </h3>
      <RatingBreakdown reviews={reviews} rating={rating} />
      {reviews.length === 0 && (
        <p className="font-['Space_Grotesk',sans-serif] text-[11px] uppercase tracking-[1.5px] text-[rgba(255,255,255,0.4)]">
          No reviews yet
        </p>
      )}
      {reviews.map((r) => (
        <ReviewItem key={r.id} review={r} />
      ))}
      <ReviewForm courtId={courtId} />
    </section>
  );
}

/* ── Loading / Error states ──────────────────────────────── */

function FullScreenMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
      {children}
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────── */

const EMPTY_REVIEWS: Review[] = [];

export default function CourtDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: court, isLoading: courtLoading } = useCourt(id ?? "");
  const { data: reviews = EMPTY_REVIEWS } = useReviews(id ?? "");

  if (courtLoading) {
    return (
      <FullScreenMessage>
        <span className="font-['Space_Grotesk',sans-serif] text-[12px] uppercase tracking-[2px] text-[rgba(255,255,255,0.5)]">
          Loading court...
        </span>
      </FullScreenMessage>
    );
  }

  if (!court) {
    return (
      <FullScreenMessage>
        <span className="font-['Space_Grotesk',sans-serif] text-[12px] uppercase tracking-[2px] text-[#ff3b30]">
          Court not found
        </span>
      </FullScreenMessage>
    );
  }

  function handleBook() {
    navigate(`/sessions/new?courtId=${court!.id}&mode=private`);
  }

  return (
    <div className="fixed inset-0 text-white z-10">
      {/* Dark map background */}
      <div className="fixed inset-0 z-0">
        <MapContainer
          center={[court.lat, court.lng]}
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

      {/* Content */}
      <div className="relative z-[2] h-full overflow-y-auto">
      {/* Back button */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 pt-6">
        <Link
          to="/"
          className="inline-block font-['Space_Grotesk',sans-serif] text-[10px] uppercase tracking-[1.5px] text-[rgba(255,255,255,0.4)] hover:text-white transition-colors mb-4"
        >
          &#8592; Back
        </Link>
      </div>

      {/* Two-column content */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        <div className="md:grid md:grid-cols-[1fr_420px] md:gap-12 pt-8 pb-24 md:pb-8">
          {/* Left: main content */}
          <div>
            <CourtHeader court={court} />
            <ReviewsSection courtId={court.id} reviews={reviews} rating={court.rating} />
          </div>

          {/* Right: booking sidebar (desktop only) */}
          <div className="hidden md:block self-start sticky top-8">
            <BookingSidebar court={court} />
            <CourtLocationMap lat={court.lat} lng={court.lng} />
          </div>
        </div>
      </div>

      {/* Mobile bottom bar */}
      <MobileBookingBar
        pricePerPlayerPerHour={court.pricePerPlayerPerHour}
        onBook={handleBook}
        disabled={false}
      />
      </div>
    </div>
  );
}
