import type { Court } from "@shared/types/index.js";
import { capitalize } from "./utils.js";
import "./CourtCard.css";

interface CourtCardProps {
  court: Court;
  sessionCount: number;
}

const BG_COLORS: Record<string, string> = {
  hardwood: "court-img-blue",
  asphalt: "court-img-green",
  rubber: "court-img-red",
};

function CourtImage({ court }: { court: Court }) {
  const bgClass = BG_COLORS[court.surface] ?? "court-img-purple";
  return (
    <div className="court-img">
      <div className={`court-img-bg ${bgClass}`} />
      <div className="court-lines" />
      <div className="court-img-fade" />
      <TypeBadge type={court.type} />
      <RatingBadge rating={court.rating} />
    </div>
  );
}

function TypeBadge({ type }: { type: Court["type"] }) {
  const badgeClass = type === "indoor" ? "badge-indoor" : "badge-outdoor";
  return (
    <div className={`court-img-badge ${badgeClass}`}>
      {type === "indoor" ? "Indoor" : "Outdoor"}
    </div>
  );
}

function RatingBadge({ rating }: { rating: number }) {
  return (
    <div className="court-img-rating">
      <span>&#9733;</span>
      {rating.toFixed(1)}
    </div>
  );
}

function AmenityTags({ amenities }: { amenities: string[] }) {
  const visible = amenities.slice(0, 3);
  return (
    <div className="court-card-tags">
      {visible.map((tag) => (
        <span key={tag} className="court-card-tag">
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
    <div className="court-card-body">
      <div className="court-card-name">{court.name}</div>
      <div className="court-card-meta">{meta}</div>
      <div className="court-card-row">
        <AmenityTags amenities={court.amenities} />
        <div className="court-card-price">
          ${court.pricePerPlayerPerHour}
          <span className="court-card-price-unit"> /hr</span>
        </div>
      </div>
    </div>
  );
}

export default function CourtCard({ court, sessionCount }: CourtCardProps) {
  return (
    <div className="court-card">
      <CourtImage court={court} />
      <CardBody court={court} sessionCount={sessionCount} />
    </div>
  );
}

