import { Link } from "react-router-dom";
import type { PublicUser } from "@shared/types/index.js";

interface HeaderProps {
  user: PublicUser | null;
  onLogout: () => void;
}

function BrandSection() {
  return (
    <Link to="/" className="flex items-center gap-2.5 text-[15px] font-semibold tracking-[-0.3px] text-text-on-light no-underline">
      <div className="w-[7px] h-[7px] rounded-full bg-accent-red shadow-[0_0_10px_rgba(255,59,48,0.5)] animate-breathe" />
      Lateral Courts
    </Link>
  );
}

function NavLinks() {
  return (
    <nav className="hidden sm:flex items-center gap-5">
      <Link to="/dashboard" className="text-[13px] font-medium text-text-on-light-muted hover:text-text-on-light transition-colors no-underline">
        My Games
      </Link>
      <Link to="/bookings" className="text-[13px] font-medium text-text-on-light-muted hover:text-text-on-light transition-colors no-underline">
        Bookings
      </Link>
    </nav>
  );
}

function UserAvatar({ name, onLogout }: { name: string; onLogout: () => void }) {
  return (
    <button
      type="button"
      onClick={onLogout}
      className="w-7 h-7 rounded-full bg-linear-to-br from-accent-red to-accent-orange flex items-center justify-center text-[10px] font-semibold text-white"
      aria-label="User menu"
    >
      {name.charAt(0).toUpperCase()}
    </button>
  );
}

export default function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-5 h-12 bg-glass-light backdrop-blur-[24px] backdrop-saturate-[180%] border-b border-glass-border-light">
      <BrandSection />
      <div className="flex items-center gap-4">
        <NavLinks />
        {user && <UserAvatar name={user.name} onLogout={onLogout} />}
      </div>
    </header>
  );
}
