import type { Session, Court } from "@shared/types/index.js";
import PlayerSlots from "./PlayerSlots.js";
import { capitalize } from "./utils.js";
import "./LiveGameCard.css";

interface LiveGameCardProps {
  session: Session;
  court: Court;
  onJoin: () => void;
}

function LiveBadge({ spotsLeft }: { spotsLeft: number }) {
  const isAlmostFull = spotsLeft <= 2;
  const badgeClass = isAlmostFull ? "live-badge live-badge-orange" : "live-badge";
  return (
    <div className={badgeClass}>
      <div className="live-dot" />
      {isAlmostFull ? "Almost full" : "Live"}
    </div>
  );
}

function ClockIcon() {
  return (
    <svg
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

function CardHeader({
  spotsLeft,
  format,
}: {
  spotsLeft: number;
  format: string;
}) {
  return (
    <div className="live-header">
      <LiveBadge spotsLeft={spotsLeft} />
      <div className="live-format">{format}</div>
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
  const joinClass = isLastSpot ? "live-join live-join-last" : "live-join";

  return (
    <div className="live-footer">
      <div className="live-time">
        <ClockIcon />
        {duration}
      </div>
      <div className="live-price">
        ${pricePerPlayer}
        <span className="live-price-unit"> /player</span>
      </div>
      <button className={joinClass} type="button" onClick={onJoin}>
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
    <div className="live-card">
      <CardHeader spotsLeft={spotsLeft} format={session.format} />
      <div className="live-court-name">{court.name}</div>
      <div className="live-court-meta">{meta}</div>
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
