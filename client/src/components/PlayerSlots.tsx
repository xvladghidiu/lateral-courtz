import "./PlayerSlots.css";

interface PlayerSlotsProps {
  filled: number;
  total: number;
  size?: "sm" | "md";
}

function Slot({
  isFilled,
  isOrange,
  size,
}: {
  isFilled: boolean;
  isOrange: boolean;
  size: "sm" | "md";
}) {
  const sizeClass = `player-slot-${size}`;
  if (!isFilled) {
    return <div className={`player-slot ${sizeClass} slot-empty`} />;
  }
  const orangeClass = isOrange ? " slot-orange" : "";
  return <div className={`player-slot ${sizeClass} slot-filled${orangeClass}`} />;
}

export default function PlayerSlots({
  filled,
  total,
  size = "md",
}: PlayerSlotsProps) {
  const isOrange = filled / total > 0.7;

  return (
    <div className="player-row">
      <div className="player-slots">
        {Array.from({ length: total }, (_, i) => (
          <Slot
            key={i}
            isFilled={i < filled}
            isOrange={isOrange}
            size={size}
          />
        ))}
      </div>
      <div className="player-count">
        {filled} <span className="player-count-divider">/{total}</span>
      </div>
    </div>
  );
}
