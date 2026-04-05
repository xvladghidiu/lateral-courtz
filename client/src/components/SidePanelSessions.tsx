import { Link } from "react-router-dom";
import type { Session } from "@shared/types/index.js";
import PlayerSlots from "./PlayerSlots.js";

interface SidePanelSessionsProps {
  sessions: Session[];
}

function SessionRow({ session }: { session: Session }) {
  const timeLabel = `${session.startTime} \u00B7 ${session.durationMinutes}min`;

  return (
    <div className="py-3 border-b border-[rgba(0,0,0,0.06)] last:border-b-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-[-0.3px] text-[rgba(0,0,0,0.8)]">
            {session.format}
          </span>
          <span className="text-xs text-[rgba(0,0,0,0.4)]">{timeLabel}</span>
        </div>
        <Link
          to={`/checkout/${session.id}`}
          className="px-3 py-1 bg-accent-red text-white text-[11px] font-semibold rounded-lg shadow-[0_2px_8px_rgba(255,59,48,0.25)] hover:shadow-[0_4px_16px_rgba(255,59,48,0.35)] transition-all"
        >
          Join
        </Link>
      </div>
      <PlayerSlots filled={session.players.length} total={session.maxPlayers} size="sm" />
    </div>
  );
}

export default function SidePanelSessions({ sessions }: SidePanelSessionsProps) {
  if (sessions.length === 0) {
    return (
      <p className="text-sm text-[rgba(0,0,0,0.35)] py-4 text-center">
        No open sessions today
      </p>
    );
  }

  return (
    <div>
      {sessions.map((s) => (
        <SessionRow key={s.id} session={s} />
      ))}
    </div>
  );
}
