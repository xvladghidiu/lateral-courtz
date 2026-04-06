import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

interface TabDef {
  to: string;
  label: string;
  icon: ReactNode;
}

function DiscoverIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" />
    </svg>
  );
}

function BookingsIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="8" r="4" />
      <path d="M20 21a8 8 0 1 0-16 0" />
    </svg>
  );
}

const TABS: TabDef[] = [
  { to: "/", label: "Discover", icon: <DiscoverIcon /> },
  { to: "/dashboard", label: "Bookings", icon: <BookingsIcon /> },
  { to: "/login", label: "Profile", icon: <ProfileIcon /> },
];

function TabItem({ tab }: { tab: TabDef }) {
  return (
    <NavLink
      to={tab.to}
      end={tab.to === "/"}
      className={({ isActive }) =>
        `flex-1 flex flex-col items-center gap-0.5 py-1.5 text-[10px] font-medium no-underline transition-colors duration-200 ${
          isActive ? "text-text-primary" : "text-text-muted"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {tab.icon}
          <span>{tab.label}</span>
          {isActive && <div className="w-1 h-1 rounded-full bg-accent-red -mt-px" />}
        </>
      )}
    </NavLink>
  );
}

function HomeIndicator() {
  return (
    <div className="flex justify-center px-0 pt-1.5 pb-2">
      <div className="w-[134px] h-[5px] bg-[rgba(255,255,255,0.15)] rounded-full" />
    </div>
  );
}

export default function BottomTabs() {
  return (
    <div className="hidden max-md:flex max-md:flex-col max-md:fixed max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:z-100 max-md:bg-[rgba(5,5,5,0.8)] max-md:backdrop-blur-[20px] max-md:border-t max-md:border-border">
      <div className="flex px-2 pt-1.5 pb-0.5">
        {TABS.map((tab) => (
          <TabItem key={tab.to} tab={tab} />
        ))}
      </div>
      <HomeIndicator />
    </div>
  );
}
