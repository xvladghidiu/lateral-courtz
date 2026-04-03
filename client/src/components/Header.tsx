import { NavLink } from "react-router-dom";
import type { PublicUser } from "@shared/types/index.js";
import "./Header.css";

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
    <div className="brand">
      <div className="brand-dot" />
      Lateral Courts
    </div>
  );
}

function NavCenter() {
  return (
    <nav className="nav-center">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/"}
          className={({ isActive }) =>
            `nav-item${isActive ? " active" : ""}`
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
    <button className="h-btn" type="button" aria-label="Notifications">
      <svg
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
  return <div className="h-avatar">{initial}</div>;
}

export default function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="header">
      <BrandSection />
      <NavCenter />
      <div className="h-right">
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
