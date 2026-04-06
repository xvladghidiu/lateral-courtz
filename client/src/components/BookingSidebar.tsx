import { useNavigate } from "react-router-dom";
import type { Court } from "@shared/types/index.js";

interface BookingSidebarProps {
  court: Court;
}

export default function BookingSidebar({ court }: BookingSidebarProps) {
  const navigate = useNavigate();

  function handleBook() {
    navigate(`/sessions/new?courtId=${court.id}&mode=private`);
  }

  return (
    <div className="sticky top-8">
      <div className="bg-[rgba(255,255,255,0.12)] backdrop-blur-[24px] backdrop-saturate-[180%] border border-[rgba(255,255,255,0.15)] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] px-6 py-7">
        <div className="mb-6 flex items-end gap-1.5">
          <span className="font-['DSEG',monospace] text-[28px] leading-none text-[rgba(255,255,255,0.9)]">
            ${court.pricePerPlayerPerHour}
          </span>
          <span className="font-['Space_Grotesk',sans-serif] text-[11px] text-[rgba(255,255,255,0.4)] tracking-[1px] pb-1">
            /player/hr
          </span>
        </div>

        <button
          type="button"
          onClick={handleBook}
          className="w-full text-white rounded-xl px-6 py-4 font-['Lixdu',sans-serif] text-[14px] uppercase tracking-[2.5px] hover:shadow-[0_4px_20px_rgba(232,120,23,0.4)] transition-all"
          style={{
            backgroundImage: "url(/assets/basketball-leather.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          Book Full Court
        </button>
      </div>
    </div>
  );
}
