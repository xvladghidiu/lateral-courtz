interface ShotClockProps {
  value: number;
  label: string;
  color: "red" | "orange" | "green";
}

const COLOR_MAP = {
  red: {
    text: "text-[rgba(255,255,255,0.85)]",
    shadow: "[text-shadow:0_0_10px_rgba(255,255,255,0.3),0_0_24px_rgba(255,255,255,0.1)]",
    led: "bg-[rgba(255,255,255,0.6)] shadow-[0_0_6px_rgba(255,255,255,0.3)]",
    accent: "from-transparent via-[rgba(255,255,255,0.2)] to-transparent",
  },
  orange: {
    text: "text-[rgba(255,255,255,0.65)]",
    shadow: "[text-shadow:0_0_10px_rgba(255,255,255,0.2),0_0_24px_rgba(255,255,255,0.08)]",
    led: "bg-[rgba(255,255,255,0.45)] shadow-[0_0_6px_rgba(255,255,255,0.2)]",
    accent: "from-transparent via-[rgba(255,255,255,0.15)] to-transparent",
  },
  green: {
    text: "text-[rgba(255,255,255,0.5)]",
    shadow: "[text-shadow:0_0_10px_rgba(255,255,255,0.15),0_0_24px_rgba(255,255,255,0.06)]",
    led: "bg-[rgba(255,255,255,0.35)] shadow-[0_0_6px_rgba(255,255,255,0.15)]",
    accent: "from-transparent via-[rgba(255,255,255,0.1)] to-transparent",
  },
};

function formatValue(value: number): string {
  return value < 10 ? `\u00A0${value}` : `${value}`;
}

export default function ShotClock({ value, label, color }: ShotClockProps) {
  const c = COLOR_MAP[color];

  return (
    <div className="w-[140px] h-[110px] max-sm:w-[110px] max-sm:h-[90px] rounded-xl bg-[rgba(10,10,12,0.75)] backdrop-blur-[24px] backdrop-saturate-[180%] border border-[rgba(255,255,255,0.12)] shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center relative">
      {/* Top accent line */}
      <div className={`absolute top-0 left-3 right-3 h-px bg-linear-to-r ${c.accent}`} />
      {/* LED dot */}
      <div className={`absolute top-1.5 right-1.5 w-1 h-1 rounded-full animate-led-pulse ${c.led}`} />
      {/* Ghost segments */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="font-['DSEG',monospace] font-bold text-[36px] max-sm:text-[28px] tracking-[1px] text-white opacity-5">
          88
        </span>
      </div>
      {/* Value */}
      <span className={`font-['DSEG',monospace] font-bold text-[36px] max-sm:text-[28px] tracking-[1px] leading-none relative ${c.text} ${c.shadow}`}>
        {formatValue(value)}
      </span>
      {/* Label */}
      <span className="font-['Square_Sans_Serif_7',sans-serif] text-[10px] max-sm:text-[8px] uppercase tracking-[2px] text-[rgba(255,255,255,0.7)] mt-2.5 whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}
