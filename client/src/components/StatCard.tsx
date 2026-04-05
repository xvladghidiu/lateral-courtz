type StatColor = "red" | "orange" | "green" | "white";

interface StatCardProps {
  value: string | number;
  label: string;
  icon: string;
  color: StatColor;
}

const VALUE_COLORS: Record<StatColor, string> = {
  red: "text-[#ff6b6b]",
  orange: "text-[#ffb340]",
  green: "text-[#4ade80]",
  white: "text-text-primary",
};

export default function StatCard({ value, label, icon, color }: StatCardProps) {
  return (
    <div className="bg-surface border border-border rounded-[14px] p-[18px] relative overflow-hidden after:content-[''] after:absolute after:top-0 after:left-0 after:right-0 after:h-px after:bg-linear-to-r after:from-transparent after:via-[rgba(255,255,255,0.05)] after:to-transparent">
      <div className={`text-[28px] font-bold tracking-[-1px] leading-none ${VALUE_COLORS[color]}`}>{value}</div>
      <div className="text-xs text-text-muted mt-1.5 font-normal">{label}</div>
      <div className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-[rgba(255,255,255,0.02)] border border-border flex items-center justify-center text-[13px]">
        {icon}
      </div>
    </div>
  );
}
