import type { Session, Court } from "@shared/types/index.js";
import ShotClock from "./ShotClock.js";

interface ShotClockRowProps {
  sessions: Session[];
  courts: Court[];
}

function almostFullCount(sessions: Session[]): number {
  return sessions.filter(
    (s) => s.players.length / s.maxPlayers > 0.7,
  ).length;
}

function currentlyPlaying(sessions: Session[]): number {
  return sessions.reduce((sum, s) => sum + s.players.length, 0);
}

export default function ShotClockRow({ sessions, courts }: ShotClockRowProps) {
  return (
    <div className="absolute top-1/2 left-5 -translate-y-1/2 z-10 flex flex-col gap-5">
      <ShotClock value={currentlyPlaying(sessions)} label="Playing Now" color="red" />
      <ShotClock value={sessions.length} label="Active" color="red" />
      <ShotClock value={almostFullCount(sessions)} label="Filling" color="orange" />
      <ShotClock value={courts.length} label="Nearby Courts" color="green" />
    </div>
  );
}
