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
  const h = size === "sm" ? "h-[22px]" : "h-[28px]";
  const insetClass = size === "sm" ? "after:inset-[3px] after:rounded-sm" : "after:inset-1 after:rounded-[3px]";
  if (!isFilled) {
    return (
      <div className={`flex-1 rounded-md transition-all duration-300 relative ${h} bg-[rgba(255,255,255,0.02)] border border-border`} />
    );
  }
  const colorClasses = isOrange
    ? `bg-[rgba(232,114,13,0.15)] border border-[rgba(232,114,13,0.2)] after:bg-accent-orange`
    : `bg-[rgba(230,51,40,0.15)] border border-[rgba(230,51,40,0.2)] after:bg-accent-red`;

  return (
    <div className={`flex-1 rounded-md transition-all duration-300 relative ${h} ${colorClasses} after:content-[''] after:absolute ${insetClass} after:opacity-60`} />
  );
}

export default function PlayerSlots({
  filled,
  total,
  size = "md",
}: PlayerSlotsProps) {
  const isOrange = filled / total > 0.7;

  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-[3px] flex-1">
        {Array.from({ length: total }, (_, i) => (
          <Slot
            key={i}
            isFilled={i < filled}
            isOrange={isOrange}
            size={size}
          />
        ))}
      </div>
      <div className="text-sm font-bold tracking-[-0.5px] whitespace-nowrap min-w-[42px] text-right">
        {filled} <span className="text-text-muted font-normal">/{total}</span>
      </div>
    </div>
  );
}
