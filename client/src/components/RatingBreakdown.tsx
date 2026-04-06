import { useMemo } from "react";
import type { Review } from "@shared/types/index.js";
import { computeRatingDistribution } from "../lib/ratingDistribution.js";

interface RatingBreakdownProps {
  reviews: Review[];
  rating: number;
}

function StarBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="flex items-center gap-2">
      <span className="font-['Space_Grotesk',sans-serif] text-[10px] text-[rgba(255,255,255,0.4)] w-3 text-right">
        {star}
      </span>
      <div className="flex-1 h-2.5 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#d4a012] rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function RatingBreakdown({ reviews, rating }: RatingBreakdownProps) {
  const dist = useMemo(() => computeRatingDistribution(reviews), [reviews]);
  const total = reviews.length;

  return (
    <div className="flex gap-6 items-center p-5 bg-[rgba(255,255,255,0.04)] rounded-xl border border-[rgba(255,255,255,0.06)] mb-5">
      <div className="text-center min-w-[70px]">
        <div className="font-['DSEG',monospace] text-[36px] text-[rgba(255,255,255,0.9)]">
          {rating.toFixed(1)}
        </div>
        <div className="text-[#d4a012] text-xs mt-0.5">
          {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}
        </div>
        <div className="font-['Space_Grotesk',sans-serif] text-[10px] text-[rgba(255,255,255,0.3)] mt-1">
          {total} {total === 1 ? "review" : "reviews"}
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2">
        {([5, 4, 3, 2, 1] as const).map((star) => (
          <StarBar key={star} star={star} count={dist[star]} total={total} />
        ))}
      </div>
    </div>
  );
}
