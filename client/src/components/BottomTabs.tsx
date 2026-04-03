import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import "./BottomTabs.css";

interface TabDef {
  to: string;
  label: string;
  icon: ReactNode;
}

function DiscoverIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" />
    </svg>
  );
}

function GamesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function BookingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="8" r="4" />
      <path d="M20 21a8 8 0 1 0-16 0" />
    </svg>
  );
}

const TABS: TabDef[] = [
  { to: "/", label: "Discover", icon: <DiscoverIcon /> },
  { to: "/dashboard", label: "Games", icon: <GamesIcon /> },
  { to: "/bookings", label: "Bookings", icon: <BookingsIcon /> },
  { to: "/profile", label: "Profile", icon: <ProfileIcon /> },
];

function TabItem({ tab }: { tab: TabDef }) {
  return (
    <NavLink
      to={tab.to}
      end={tab.to === "/"}
      className={({ isActive }) =>
        `bottom-tab${isActive ? " active" : ""}`
      }
    >
      {({ isActive }) => (
        <>
          {tab.icon}
          <span>{tab.label}</span>
          {isActive && <div className="bottom-tab-dot" />}
        </>
      )}
    </NavLink>
  );
}

function HomeIndicator() {
  return (
    <div className="bottom-home-indicator">
      <div className="bottom-home-bar" />
    </div>
  );
}

export default function BottomTabs() {
  return (
    <div className="bottom-tabs">
      <div className="bottom-tabs-row">
        {TABS.map((tab) => (
          <TabItem key={tab.to} tab={tab} />
        ))}
      </div>
      <HomeIndicator />
    </div>
  );
}
