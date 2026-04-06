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
      <div className={`flex-1 rounded-md transition-all duration-300 relative ${h} bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)]`} />
    );
  }
  const colorClasses = isOrange
    ? `bg-[rgba(255,255,255,0.18)] border border-[rgba(255,255,255,0.25)] after:bg-[rgba(255,255,255,0.4)]`
    : `bg-[rgba(255,255,255,0.12)] border border-[rgba(255,255,255,0.2)] after:bg-[rgba(255,255,255,0.6)]`;

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
        {filled} <span className="text-[rgba(255,255,255,0.4)] font-normal">/{total}</span>
      </div>
    </div>
  );
}
