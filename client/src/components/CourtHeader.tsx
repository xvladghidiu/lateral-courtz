import { useState } from "react";
import type { Court } from "@shared/types/index.js";
import { capitalize } from "./utils.js";

const PILL =
  "bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.1)] rounded-full px-3 py-1 font-['Space_Grotesk',sans-serif] text-[9px] uppercase tracking-[1.5px] text-[rgba(255,255,255,0.6)]";

const AMENITY_PILL =
  "bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] rounded-full px-3.5 py-1.5 font-['Space_Grotesk',sans-serif] text-[10px] uppercase tracking-[1px] text-[rgba(255,255,255,0.5)]";

const SECTION_HEADING =
  "font-['Space_Grotesk',sans-serif] text-[11px] uppercase tracking-[2px] text-[rgba(255,255,255,0.5)] mb-3";

function ArrowBtn({ direction, onClick, large }: { direction: "left" | "right"; onClick: (e: React.MouseEvent) => void; large?: boolean }) {
  const size = large ? "w-12 h-12 text-[20px]" : "w-8 h-8 text-[14px]";
  const pos = direction === "left"
    ? `left-${large ? 5 : 3}`
    : `right-${large ? 5 : 3}`;
  const visibility = large ? "" : "opacity-0 group-hover:opacity-100 transition-opacity";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`absolute ${pos} top-1/2 -translate-y-1/2 ${size} rounded-full bg-[rgba(0,0,0,0.6)] backdrop-blur-[8px] border border-[rgba(255,255,255,0.1)] text-white flex items-center justify-center hover:bg-[rgba(0,0,0,0.8)] transition-colors ${visibility}`}
    >
      {direction === "left" ? "‹" : "›"}
    </button>
  );
}

function DotBar({ count, active, onSelect, large }: { count: number; active: number; onSelect: (e: React.MouseEvent, i: number) => void; large?: boolean }) {
  const gap = large ? "gap-2" : "gap-1.5";
  const dotH = large ? "h-2" : "h-1.5";
  const activeW = large ? "w-8" : "w-6";
  const inactiveW = large ? "w-2" : "w-1.5";
  const bottom = large ? "bottom-6" : "bottom-3";
  return (
    <div className={`absolute ${bottom} left-1/2 -translate-x-1/2 flex ${gap}`}>
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={(e) => onSelect(e, i)}
          className={`${dotH} rounded-full transition-all ${
            i === active ? `${activeW} bg-white` : `${inactiveW} bg-[rgba(255,255,255,0.4)]`
          }`}
        />
      ))}
    </div>
  );
}

function PhotoCarousel({ photos }: { photos: string[] }) {
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  if (!photos.length) return null;

  function prev(e: React.MouseEvent) {
    e.stopPropagation();
    setIndex((i) => (i === 0 ? photos.length - 1 : i - 1));
  }

  function next(e: React.MouseEvent) {
    e.stopPropagation();
    setIndex((i) => (i === photos.length - 1 ? 0 : i + 1));
  }

  function selectDot(e: React.MouseEvent, i: number) {
    e.stopPropagation();
    setIndex(i);
  }

  if (expanded) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.9)] cursor-pointer"
        onClick={() => setExpanded(false)}
      >
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setExpanded(false); }}
          className="absolute top-5 right-5 w-10 h-10 rounded-full bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.15)] text-white text-[20px] flex items-center justify-center hover:bg-[rgba(255,255,255,0.2)] transition-colors z-10"
        >
          ×
        </button>

        <img
          src={photos[index]}
          alt=""
          className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl"
          onClick={(e) => e.stopPropagation()}
        />

        {photos.length > 1 && (
          <>
            <ArrowBtn direction="left" onClick={prev} large />
            <ArrowBtn direction="right" onClick={next} large />
          </>
        )}
        <DotBar count={photos.length} active={index} onSelect={selectDot} large />
      </div>
    );
  }

  return (
    <div
      className="relative rounded-2xl overflow-hidden mb-5 group cursor-pointer"
      onClick={() => setExpanded(true)}
    >
      <div className="relative h-[240px] md:h-[320px]">
        <img
          src={photos[index]}
          alt=""
          className="w-full h-full object-cover transition-opacity duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,12,0.6)] to-transparent" />
      </div>

      {photos.length > 1 && (
        <>
          <ArrowBtn direction="left" onClick={prev} />
          <ArrowBtn direction="right" onClick={next} />
        </>
      )}
      <DotBar count={photos.length} active={index} onSelect={selectDot} />
    </div>
  );
}

export default function CourtHeader({ court }: { court: Court }) {
  return (
    <div className="mb-5">
      <PhotoCarousel photos={court.photos} />
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
