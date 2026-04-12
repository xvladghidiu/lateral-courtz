import { Link } from "react-router-dom";
import type { PublicUser } from "@shared/types/index.js";
import { type TileStyle, isDarkTile } from "../pages/Discover.js";

interface HeaderProps {
  user: PublicUser | null;
  onLogout: () => void;
  tileStyle: TileStyle;
}

const BRAND_COLORS: Record<TileStyle, string> = {
  dark: "text-[rgba(255,255,255,0.3)]",
  satellite: "text-[rgba(255,255,255,0.25)]",
  voyager: "text-[rgba(60,40,20,0.2)]",
  light: "text-[rgba(0,0,0,0.15)]",
};

function VerticalLabel({ side, text, color }: { side: "left" | "right"; text: string; color: string }) {
  return (
    <div className={`fixed ${side}-0 top-0 bottom-0 z-[1] flex items-center pointer-events-none`}>
      <span className={`font-['Lixdu',sans-serif] text-[80px] uppercase tracking-[12px] ${color} [writing-mode:vertical-rl] ${side === "left" ? "rotate-180" : ""} select-none`}>
        {text}
      </span>
    </div>
  );
}

function NavLink({ dark }: { dark: boolean }) {
  const btnClass = dark
    ? "font-['Space_Grotesk',sans-serif] uppercase tracking-[2px] px-5 py-2.5 text-[11px] text-[rgba(255,255,255,0.7)] bg-[rgba(255,255,255,0.1)] backdrop-blur-[16px] border border-[rgba(255,255,255,0.15)] rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.2)] hover:bg-[rgba(255,255,255,0.2)] hover:text-white transition-all no-underline"
    : "font-['Space_Grotesk',sans-serif] uppercase tracking-[2px] px-5 py-2.5 text-[11px] text-[rgba(0,0,0,0.6)] bg-[rgba(255,255,255,0.8)] backdrop-blur-[16px] border border-[rgba(0,0,0,0.08)] rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.1)] hover:bg-[rgba(255,255,255,0.95)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all no-underline";

  return (
    <Link to="/bookings" className={`hidden sm:block ${btnClass}`}>Bookings</Link>
  );
}

function UserAvatar({ name, onLogout }: { name: string; onLogout: () => void }) {
  return (
    <button
      type="button"
      onClick={onLogout}
      className="w-8 h-8 rounded-full bg-linear-to-br from-accent-red to-accent-orange flex items-center justify-center text-[11px] font-semibold text-white shadow-[0_2px_8px_rgba(255,59,48,0.25)]"
      aria-label="User menu"
    >
      {name.charAt(0).toUpperCase()}
    </button>
  );
}

export default function Header({ user, onLogout, tileStyle }: HeaderProps) {
  const dark = isDarkTile(tileStyle);
  const color = BRAND_COLORS[tileStyle];

  return (
    <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-end px-5 h-14 pointer-events-none">
      <VerticalLabel side="left" text="Lateral" color={color} />
      <VerticalLabel side="right" text="Courtz" color={color} />
      <div className="flex items-center gap-5 pointer-events-auto">
        <NavLink dark={dark} />
        {user && <UserAvatar name={user.name} onLogout={onLogout} />}
      </div>
    </header>
  );
}
