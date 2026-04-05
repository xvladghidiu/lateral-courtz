import type { Session, Court } from "@shared/types/index.js";
import PlayerSlots from "./PlayerSlots.js";
import { capitalize } from "./utils.js";

interface LiveGameCardProps {
  session: Session;
  court: Court;
  onJoin: () => void;
}

function LiveBadge({ spotsLeft }: { spotsLeft: number }) {
  const isAlmostFull = spotsLeft <= 2;
  return (
    <div className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.5px] ${isAlmostFull ? "text-accent-orange" : "text-[#ff6b6b]"}`}>
      <div className="w-1.5 h-1.5 rounded-full bg-accent-red relative after:content-[''] after:absolute after:inset-[-3px] after:rounded-full after:border after:border-accent-red after:animate-ring" />
      {isAlmostFull ? "Almost full" : "Live"}
    </div>
  );
}

function ClockIcon() {
  return (
    <svg
      className="w-[13px] h-[13px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function CardHeader({ spotsLeft, format }: { spotsLeft: number; format: string }) {
  return (
    <div className="flex items-center justify-between mb-3.5">
      <LiveBadge spotsLeft={spotsLeft} />
      <div className="text-xl font-extrabold tracking-[-0.5px] text-text-primary">{format}</div>
    </div>
  );
}

function CardFooter({
  spotsLeft,
  durationMinutes,
  pricePerPlayer,
  onJoin,
}: {
  spotsLeft: number;
  durationMinutes: number;
  pricePerPlayer: number;
  onJoin: () => void;
}) {
  const isLastSpot = spotsLeft === 1;
  const hours = durationMinutes / 60;
  const duration = hours === 1 ? "1h session" : `${hours}h session`;

  return (
    <div className="flex justify-between items-center mt-3.5 pt-3.5 border-t border-border">
      <div className="text-xs text-text-secondary flex items-center gap-[5px]">
        <ClockIcon />
        {duration}
      </div>
      <div className="text-[15px] font-bold tracking-[-0.3px]">
        ${pricePerPlayer}
        <span className="text-[11px] font-normal text-text-muted"> /player</span>
      </div>
      <button
        className={`px-[18px] py-[7px] rounded-[9px] text-xs font-semibold text-white transition-all duration-200 ${
          isLastSpot
            ? "bg-accent-orange shadow-[0_2px_12px_rgba(232,114,13,0.25)] hover:shadow-[0_4px_20px_rgba(232,114,13,0.35)] hover:-translate-y-px"
            : "bg-accent-red shadow-[0_2px_12px_rgba(230,51,40,0.25)] hover:shadow-[0_4px_20px_rgba(230,51,40,0.35)] hover:-translate-y-px"
        }`}
        type="button"
        onClick={onJoin}
      >
        {isLastSpot ? "Last spot" : "Join game"}
      </button>
    </div>
  );
}

export default function LiveGameCard({
  session,
  court,
  onJoin,
}: LiveGameCardProps) {
  const spotsLeft = session.maxPlayers - session.players.length;
  const meta = [
    court.type === "indoor" ? "Indoor" : "Outdoor",
    capitalize(court.surface),
    `Today ${session.startTime}`,
  ].join(" \u00B7 ");

  return (
    <div className="min-w-[300px] shrink-0 bg-surface border border-border rounded-2xl p-5 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] relative overflow-hidden hover:-translate-y-1 hover:border-[rgba(255,255,255,0.08)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] after:content-[''] after:absolute after:top-0 after:left-0 after:right-0 after:h-px after:bg-linear-to-r after:from-transparent after:via-[rgba(255,255,255,0.06)] after:to-transparent">
      <CardHeader spotsLeft={spotsLeft} format={session.format} />
      <div className="text-[15px] font-semibold tracking-[-0.2px] mb-[3px]">{court.name}</div>
      <div className="text-xs text-text-secondary mb-4">{meta}</div>
      <PlayerSlots filled={session.players.length} total={session.maxPlayers} />
      <CardFooter
        spotsLeft={spotsLeft}
        durationMinutes={session.durationMinutes}
        pricePerPlayer={court.pricePerPlayerPerHour}
        onJoin={onJoin}
      />
    </div>
  );
}
