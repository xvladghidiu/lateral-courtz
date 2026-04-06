import { Link } from "react-router-dom";
import type { PublicUser } from "@shared/types/index.js";

interface HeaderProps {
  user: PublicUser | null;
  onLogout: () => void;
  dark?: boolean;
}

function BrandSection({ dark }: { dark: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-3 no-underline">
      <span className={`font-['Lixdu',sans-serif] text-[26px] uppercase tracking-[3px] ${
        dark
          ? "text-[rgba(255,255,255,0.85)] [text-shadow:0_1px_4px_rgba(0,0,0,0.4)]"
          : "text-[rgba(0,0,0,0.55)] [text-shadow:0_1px_3px_rgba(0,0,0,0.1)]"
      }`}>
        Lateral Courtz
      </span>
    </Link>
  );
}

function NavLinks({ dark }: { dark: boolean }) {
  const btnClass = dark
    ? "font-['Space_Grotesk',sans-serif] uppercase tracking-[2px] px-5 py-2.5 text-[11px] text-[rgba(255,255,255,0.7)] bg-[rgba(255,255,255,0.1)] backdrop-blur-[16px] border border-[rgba(255,255,255,0.15)] rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.2)] hover:bg-[rgba(255,255,255,0.2)] hover:text-white transition-all no-underline"
    : "font-['Space_Grotesk',sans-serif] uppercase tracking-[2px] px-5 py-2.5 text-[11px] text-[rgba(0,0,0,0.6)] bg-[rgba(255,255,255,0.8)] backdrop-blur-[16px] border border-[rgba(0,0,0,0.08)] rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.1)] hover:bg-[rgba(255,255,255,0.95)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all no-underline";

  return (
    <nav className="hidden sm:flex items-center gap-2">
      <Link to="/dashboard" className={btnClass}>My Games</Link>
      <Link to="/bookings" className={btnClass}>Bookings</Link>
    </nav>
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

export default function Header({ user, onLogout, dark = false }: HeaderProps) {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-5 h-14 pointer-events-none">
      <div className="pointer-events-auto">
        <BrandSection dark={dark} />
      </div>
      <div className="flex items-center gap-5 pointer-events-auto">
        <NavLinks dark={dark} />
        {user && <UserAvatar name={user.name} onLogout={onLogout} />}
      </div>
    </header>
  );
}
