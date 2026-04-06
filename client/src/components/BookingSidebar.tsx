import { useNavigate } from "react-router-dom";
import type { Court } from "@shared/types/index.js";
import GlassCalendar from "./GlassCalendar.js";

interface BookingSidebarProps {
  court: Court;
  selectedDate: string;
  onDateChange: (date: string) => void;
  selectedSlot: string | null;
  onSlotChange: (slot: string) => void;
  minDate: string;
}

const TIME_SLOTS = ["16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];

function formatSlotLabel(slot: string): string {
  const hour = parseInt(slot.split(":")[0]!, 10);
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
}

export default function BookingSidebar({ court, selectedDate, onDateChange, selectedSlot, onSlotChange, minDate }: BookingSidebarProps) {
  const navigate = useNavigate();

  function handleBook() {
    if (!selectedSlot) return;
    navigate(`/checkout?courtId=${court.id}&date=${selectedDate}&time=${selectedSlot}`);
  }

  return (
    <div className="sticky top-8">
      <div className="bg-[rgba(255,255,255,0.12)] backdrop-blur-[24px] backdrop-saturate-[180%] border border-[rgba(255,255,255,0.15)] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] px-6 py-7">
        <div className="mb-5 flex items-baseline gap-1">
          <span className="font-['DSEG',monospace] text-[28px] text-[rgba(255,255,255,0.9)]">
            ${court.pricePerPlayerPerHour}
          </span>
          <span className="font-['Space_Grotesk',sans-serif] text-[11px] text-[rgba(255,255,255,0.4)] tracking-[1px]">
            /player/hr
          </span>
        </div>

        <GlassCalendar value={selectedDate} onChange={onDateChange} minDate={minDate} />

        <div className="mb-5">
          <span className="font-['Space_Grotesk',sans-serif] text-[10px] uppercase tracking-[2px] text-[rgba(255,255,255,0.5)] mb-2 block">
            Time Slot
          </span>
          <div className="flex gap-1.5 flex-wrap">
            {TIME_SLOTS.map((slot) => {
              const active = selectedSlot === slot;
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => onSlotChange(slot)}
                  className={`rounded-lg px-3 py-1.5 font-['Space_Grotesk',sans-serif] text-[11px] transition-all ${
                    active
                      ? "bg-[rgba(212,160,18,0.15)] border border-[rgba(212,160,18,0.3)] text-[#d4a012]"
                      : "bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] text-[rgba(255,255,255,0.5)] hover:bg-[rgba(255,255,255,0.12)]"
                  }`}
                >
                  {formatSlotLabel(slot)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-[rgba(255,255,255,0.08)] mb-4" />

        {selectedSlot && (
          <div className="flex justify-between mb-5">
            <span className="font-['Space_Grotesk',sans-serif] text-[12px] text-[rgba(255,255,255,0.5)]">
              Full court · {selectedSlot}
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={handleBook}
          disabled={!selectedSlot}
          className="w-full text-white rounded-xl px-6 py-4 font-['Lixdu',sans-serif] text-[14px] uppercase tracking-[2.5px] hover:shadow-[0_4px_20px_rgba(232,120,23,0.4)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
