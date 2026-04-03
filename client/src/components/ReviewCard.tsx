import type { Review } from "@shared/types/index.js";

interface ReviewCardProps {
  review: Review;
  userName: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span style={{ color: "var(--amber)", fontWeight: 600, fontSize: 13 }}>
      {Array.from({ length: 5 }, (_, i) =>
        i < rating ? "\u2605" : "\u2606"
      ).join("")}
    </span>
  );
}

function ReviewDate({ isoDate }: { isoDate: string }) {
  const formatted = new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return (
    <span style={{ fontSize: 11, color: "var(--text-3)" }}>{formatted}</span>
  );
}

export default function ReviewCard({ review, userName }: ReviewCardProps) {
  return (
    <div style={{ padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 6,
        }}
      >
        <StarRating rating={review.rating} />
        <span style={{ fontSize: 13, fontWeight: 600 }}>{userName}</span>
        <ReviewDate isoDate={review.createdAt} />
      </div>
      <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>
        {review.comment}
      </p>
    </div>
  );
}
