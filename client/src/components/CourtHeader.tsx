import type { Court } from "@shared/types/index.js";
import { capitalize } from "./utils.js";

const PILL =
  "bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.1)] rounded-full px-3 py-1 font-['Space_Grotesk',sans-serif] text-[9px] uppercase tracking-[1.5px] text-[rgba(255,255,255,0.6)]";

const AMENITY_PILL =
  "bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] rounded-full px-3.5 py-1.5 font-['Space_Grotesk',sans-serif] text-[10px] uppercase tracking-[1px] text-[rgba(255,255,255,0.5)]";

const SECTION_HEADING =
  "font-['Space_Grotesk',sans-serif] text-[11px] uppercase tracking-[2px] text-[rgba(255,255,255,0.5)] mb-3";

export default function CourtHeader({ court }: { court: Court }) {
  return (
    <div className="mb-5">
      <h1 className="font-['Lixdu',sans-serif] text-[22px] uppercase tracking-[3px] text-[rgba(255,255,255,0.85)] mb-2">
        {court.name}
      </h1>
      <p className="font-['Space_Grotesk',sans-serif] text-[11px] uppercase tracking-[1.5px] text-[rgba(255,255,255,0.4)] mb-4">
        {court.address}
      </p>

      <div className="flex items-center gap-2.5 flex-wrap mb-5">
        <span className={PILL}>{court.type === "indoor" ? "Indoor" : "Outdoor"}</span>
        <span className={PILL}>{capitalize(court.surface)}</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[#d4a012] text-sm">
            {"★".repeat(Math.round(court.rating))}
          </span>
          <span className="text-sm text-[rgba(255,255,255,0.85)]">
            {court.rating.toFixed(1)}
          </span>
          <span className="text-xs text-[rgba(255,255,255,0.4)]">
            ({court.reviewCount} reviews)
          </span>
        </div>
      </div>

      <div className="pb-5 border-b border-[rgba(255,255,255,0.06)]">
        <h3 className={SECTION_HEADING}>Amenities</h3>
        <div className="flex gap-2 flex-wrap">
          {court.amenities.map((a) => (
            <span key={a} className={AMENITY_PILL}>{a}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
