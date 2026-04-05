import { Link } from "react-router-dom";
import type { Court, Session } from "@shared/types/index.js";
import { useCourtSessions } from "../hooks/useSessions.js";
import SidePanelSessions from "./SidePanelSessions.js";

interface SidePanelProps {
  court: Court;
  onClose: () => void;
}

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[rgba(0,0,0,0.06)] flex items-center justify-center text-[rgba(0,0,0,0.4)] hover:bg-[rgba(0,0,0,0.1)] transition-colors"
      aria-label="Close panel"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    </button>
  );
}

function TypeBadge({ type }: { type: string }) {
  const isIndoor = type === "indoor";
  const classes = isIndoor
    ? "bg-[rgba(59,130,246,0.1)] text-[#3b82f6] border-[rgba(59,130,246,0.15)]"
    : "bg-[rgba(34,197,94,0.1)] text-[#22c55e] border-[rgba(34,197,94,0.15)]";
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-[0.5px] px-2.5 py-0.5 rounded-md border ${classes}`}>
      {type}
    </span>
  );
}

function CourtHeader({ court }: { court: Court }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-bold tracking-[-0.3px] text-[rgba(0,0,0,0.85)]">
        {court.name}
      </h2>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-sm font-semibold text-accent-amber">
          ★ {court.rating}
        </span>
        <TypeBadge type={court.type} />
        <span className="text-xs text-[rgba(0,0,0,0.4)]">{court.surface}</span>
      </div>
      <div className="text-xs text-[rgba(0,0,0,0.4)] mt-1">{court.address}</div>
    </div>
  );
}

function PriceDisplay({ price }: { price: number }) {
  return (
    <div className="text-2xl font-bold tracking-[-0.5px] text-[rgba(0,0,0,0.85)] mb-4">
      ${price} <span className="text-sm font-normal text-[rgba(0,0,0,0.35)]">/ player / hr</span>
    </div>
  );
}

function Amenities({ amenities }: { amenities: string[] }) {
  if (amenities.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mb-4">
      {amenities.map((a) => (
        <span
          key={a}
          className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[rgba(0,0,0,0.04)] text-[rgba(0,0,0,0.5)] border border-[rgba(0,0,0,0.06)]"
        >
          {a}
        </span>
      ))}
    </div>
  );
}

function PanelActions({ courtId }: { courtId: string }) {
  return (
    <div className="flex gap-2 mb-4">
      <Link
        to={`/sessions/new?courtId=${courtId}&mode=open`}
        className="flex-1 text-center py-2.5 bg-accent-red text-white text-xs font-semibold rounded-xl shadow-[0_2px_12px_rgba(255,59,48,0.25)] hover:shadow-[0_4px_20px_rgba(255,59,48,0.35)] transition-all"
      >
        Create a Game
      </Link>
      <Link
        to={`/sessions/new?courtId=${courtId}&mode=private`}
        className="flex-1 text-center py-2.5 bg-[rgba(0,0,0,0.06)] text-[rgba(0,0,0,0.7)] text-xs font-semibold rounded-xl hover:bg-[rgba(0,0,0,0.1)] transition-all"
      >
        Book Full Court
      </Link>
    </div>
  );
}

const todayDate = new Date().toISOString().split("T")[0]!;

export default function SidePanel({ court, onClose }: SidePanelProps) {
  const { data: sessions = [] } = useCourtSessions(court.id, todayDate);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 z-40 sm:hidden"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="button"
        tabIndex={-1}
        aria-label="Close panel"
      />
      {/* Panel */}
      <div className="fixed z-50 transition-transform duration-300 ease-out
        max-sm:bottom-0 max-sm:left-0 max-sm:right-0 max-sm:h-[50vh] max-sm:rounded-t-2xl
        sm:top-0 sm:right-0 sm:w-[400px] sm:h-full
        bg-glass-light-solid backdrop-blur-[24px] backdrop-saturate-[180%]
        border-l border-glass-border-light shadow-[0_8px_32px_rgba(0,0,0,0.12)]
        overflow-y-auto"
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[rgba(0,0,0,0.15)]" />
        </div>

        <div className="p-5 relative">
          <CloseButton onClick={onClose} />
          <CourtHeader court={court} />
          <PriceDisplay price={court.pricePerPlayerPerHour} />
          <Amenities amenities={court.amenities} />
          <PanelActions courtId={court.id} />

          <h3 className="text-xs font-bold uppercase tracking-[1px] text-[rgba(0,0,0,0.35)] mb-2">
            Open Sessions
          </h3>
          <SidePanelSessions sessions={sessions.filter((s: Session) => s.status === "filling")} />

          <Link
            to={`/courts/${court.id}`}
            className="block text-center text-xs font-medium text-accent-red mt-4 py-2 hover:underline"
          >
            View full details →
          </Link>
        </div>
      </div>
    </>
  );
}
