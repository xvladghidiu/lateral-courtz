import type { Court } from "@shared/types/index.js";
import { capitalize } from "./utils.js";

interface CourtCardProps {
  court: Court;
  sessionCount: number;
}

const BG_GRADIENTS: Record<string, string> = {
  hardwood: "bg-linear-[145deg,#0d1520,#131a28]",
  asphalt: "bg-linear-[145deg,#0d1a10,#132818]",
  rubber: "bg-linear-[145deg,#1a0d10,#281318]",
};

const FALLBACK_GRADIENT = "bg-linear-[145deg,#0d0d1a,#131328]";

function CourtImage({ court }: { court: Court }) {
  const bgClass = BG_GRADIENTS[court.surface] ?? FALLBACK_GRADIENT;
  return (
    <div className="h-40 relative overflow-hidden">
      <div className={`absolute inset-0 flex items-center justify-center text-[40px] ${bgClass}`} />
      <div className="absolute inset-0 opacity-[0.06] before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-[60px] before:h-[60px] before:rounded-full before:border-2 before:border-white after:content-[''] after:absolute after:top-0 after:left-1/2 after:-translate-x-1/2 after:w-0.5 after:h-full after:bg-white" />
      <div className="absolute bottom-0 left-0 right-0 h-[60px] bg-linear-to-t from-surface to-transparent" />
      <TypeBadge type={court.type} />
      <RatingBadge rating={court.rating} />
    </div>
  );
}

function TypeBadge({ type }: { type: Court["type"] }) {
  const colorClass = type === "indoor"
    ? "bg-[rgba(59,130,246,0.15)] text-[#93c5fd] border-[rgba(59,130,246,0.15)]"
    : "bg-[rgba(34,197,94,0.15)] text-[#86efac] border-[rgba(34,197,94,0.15)]";
  return (
    <div className={`absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-[0.5px] px-2.5 py-[3px] rounded-md backdrop-blur-[8px] border ${colorClass}`}>
      {type === "indoor" ? "Indoor" : "Outdoor"}
    </div>
  );
}

function RatingBadge({ rating }: { rating: number }) {
  return (
    <div className="absolute top-3 right-3 text-xs font-semibold text-accent-amber flex items-center gap-[3px] px-2 py-[3px] bg-[rgba(12,12,14,0.6)] backdrop-blur-[8px] rounded-md">
      <span>&#9733;</span>
      {rating.toFixed(1)}
    </div>
  );
}

function AmenityTags({ amenities }: { amenities: string[] }) {
  const visible = amenities.slice(0, 3);
  return (
    <div className="flex gap-1">
      {visible.map((tag) => (
        <span key={tag} className="text-[10px] font-medium px-[9px] py-[3px] rounded-full text-text-secondary bg-[rgba(255,255,255,0.03)] border border-border">
          {tag}
        </span>
      ))}
    </div>
  );
}

function CardBody({ court, sessionCount }: CourtCardProps) {
  const meta = [
    capitalize(court.surface),
    `${sessionCount} open game${sessionCount !== 1 ? "s" : ""}`,
  ].join(" \u00B7 ");

  return (
    <div className="px-[18px] pt-4 pb-[18px]">
      <div className="text-[15px] font-semibold tracking-[-0.3px]">{court.name}</div>
      <div className="text-xs text-text-secondary mt-[3px]">{meta}</div>
      <div className="flex items-center justify-between mt-3.5">
        <AmenityTags amenities={court.amenities} />
        <div className="text-[17px] font-bold tracking-[-0.5px]">
          ${court.pricePerPlayerPerHour}
          <span className="text-[11px] font-normal text-text-muted"> /hr</span>
        </div>
      </div>
    </div>
  );
}

export default function CourtCard({ court, sessionCount }: CourtCardProps) {
  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-[rgba(255,255,255,0.08)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
      <CourtImage court={court} />
      <CardBody court={court} sessionCount={sessionCount} />
    </div>
  );
}
