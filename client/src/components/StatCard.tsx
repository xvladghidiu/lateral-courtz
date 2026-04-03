import "./StatCard.css";

type StatColor = "red" | "orange" | "green" | "white";

interface StatCardProps {
  value: string | number;
  label: string;
  icon: string;
  color: StatColor;
}

export default function StatCard({ value, label, icon, color }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className={`stat-value stat-value-${color}`}>{value}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-icon">{icon}</div>
    </div>
  );
}
