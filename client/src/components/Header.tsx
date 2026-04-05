import { NavLink } from "react-router-dom";
import type { PublicUser } from "@shared/types/index.js";

interface HeaderProps {
  user: PublicUser | null;
  onLogout: () => void;
}

const NAV_ITEMS = [
  { to: "/", label: "Discover" },
  { to: "/dashboard", label: "My Games" },
  { to: "/bookings", label: "Bookings" },
];

function BrandSection() {
  return (
    <div className="flex items-center gap-2.5 text-[15px] font-semibold tracking-[-0.3px]">
      <div className="w-[7px] h-[7px] rounded-full bg-accent-red shadow-[0_0_10px_rgba(230,51,40,0.5)] animate-breathe" />
      Lateral Courts
    </div>
  );
}

function NavCenter() {
  return (
    <nav className="hidden sm:flex absolute left-1/2 -translate-x-1/2 gap-px bg-[rgba(255,255,255,0.02)] rounded-[10px] p-[3px] border border-border">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/"}
          className={({ isActive }) =>
            `px-[18px] py-[5px] text-[12.5px] font-medium rounded-[7px] transition-all duration-200 no-underline ${
              isActive
                ? "text-text-primary bg-[rgba(255,255,255,0.05)] shadow-[0_1px_3px_rgba(0,0,0,0.3)]"
                : "text-text-muted hover:text-text-secondary"
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

function NotificationButton() {
  return (
    <button
      className="w-8 h-8 rounded-[9px] flex items-center justify-center text-text-muted transition-all duration-200 hover:bg-[rgba(255,255,255,0.03)] hover:text-text-secondary"
      type="button"
      aria-label="Notifications"
    >
      <svg
        className="w-[15px] h-[15px]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    </button>
  );
}

function UserAvatar({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <div className="w-7 h-7 rounded-full bg-linear-to-br from-accent-red to-accent-orange flex items-center justify-center text-[10px] font-semibold ml-1.5">
      {initial}
    </div>
  );
}

export default function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-7 h-[54px] bg-[rgba(5,5,5,0.7)] backdrop-blur-[40px] border-b border-border sticky top-0 z-100">
      <BrandSection />
      <NavCenter />
      <div className="flex items-center gap-1">
        <NotificationButton />
        {user && (
          <button type="button" onClick={onLogout} aria-label="User menu">
            <UserAvatar name={user.name} />
          </button>
        )}
      </div>
    </header>
  );
}
