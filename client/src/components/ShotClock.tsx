interface ShotClockProps {
  value: number;
  label: string;
  color: "red" | "orange" | "green";
}

const COLOR_MAP = {
  red: {
    text: "text-[#ff3b30]",
    shadow: "[text-shadow:0_0_10px_rgba(255,59,48,0.5),0_0_24px_rgba(255,59,48,0.2)]",
    led: "bg-[#ff3b30] shadow-[0_0_6px_rgba(255,59,48,0.6)]",
    accent: "from-transparent via-[rgba(255,59,48,0.4)] to-transparent",
  },
  orange: {
    text: "text-[#ff9500]",
    shadow: "[text-shadow:0_0_10px_rgba(255,149,0,0.5),0_0_24px_rgba(255,149,0,0.2)]",
    led: "bg-[#ff9500] shadow-[0_0_6px_rgba(255,149,0,0.6)]",
    accent: "from-transparent via-[rgba(255,149,0,0.4)] to-transparent",
  },
  green: {
    text: "text-[#34c759]",
    shadow: "[text-shadow:0_0_10px_rgba(52,199,89,0.4),0_0_24px_rgba(52,199,89,0.15)]",
    led: "bg-[#34c759] shadow-[0_0_6px_rgba(52,199,89,0.5)]",
    accent: "from-transparent via-[rgba(52,199,89,0.35)] to-transparent",
  },
};

function formatTime(value: number): string {
  return value < 10 ? `\u00A0${value}:00` : `${value}:00`;
}

export default function ShotClock({ value, label, color }: ShotClockProps) {
  const c = COLOR_MAP[color];

  return (
    <div className="w-[88px] h-[88px] max-sm:w-[72px] max-sm:h-[72px] rounded-xl bg-glass-dark backdrop-blur-[24px] backdrop-saturate-[180%] border border-glass-border-dark shadow-[0_8px_32px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center relative">
      {/* Top accent line */}
      <div className={`absolute top-0 left-3 right-3 h-px bg-linear-to-r ${c.accent}`} />
      {/* LED dot */}
      <div className={`absolute top-1.5 right-1.5 w-1 h-1 rounded-full animate-led-pulse ${c.led}`} />
      {/* Ghost segments */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="font-['DSEG',monospace] font-bold text-[26px] max-sm:text-[20px] tracking-[1px] text-white opacity-5">
          88:88
        </span>
      </div>
      {/* Time value */}
      <span className={`font-['DSEG',monospace] font-bold text-[26px] max-sm:text-[20px] tracking-[1px] leading-none relative ${c.text} ${c.shadow}`}>
        {formatTime(value)}
      </span>
      {/* Label */}
      <span className="font-[Inter] text-[7px] font-bold uppercase tracking-[1.5px] text-text-on-dark-muted mt-1.5">
        {label}
      </span>
    </div>
  );
}
