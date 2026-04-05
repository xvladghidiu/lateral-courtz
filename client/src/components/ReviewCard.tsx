import type { Review } from "@shared/types/index.js";

interface ReviewCardProps {
  review: Review;
  userName: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-accent-amber font-semibold text-[13px]">
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
  return <span className="text-[11px] text-text-muted">{formatted}</span>;
}

export default function ReviewCard({ review, userName }: ReviewCardProps) {
  return (
    <div className="py-3.5 border-b border-border">
      <div className="flex items-center gap-2.5 mb-1.5">
        <StarRating rating={review.rating} />
        <span className="text-[13px] font-semibold">{userName}</span>
        <ReviewDate isoDate={review.createdAt} />
      </div>
      <p className="text-[13px] text-text-secondary leading-normal">
        {review.comment}
      </p>
    </div>
  );
}
