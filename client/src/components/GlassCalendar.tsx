import { useState, useMemo } from "react";

interface GlassCalendarProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  minDate?: string; // YYYY-MM-DD
  /** When provided, shows time slot picker below the calendar */
  time?: string; // HH:MM
  onTimeChange?: (time: string) => void;
}

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00", "22:00",
];

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function toKey(y: number, m: number, d: number): string {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

function formatSlot(slot: string): string {
  const [h] = slot.split(":");
  const hour = parseInt(h!, 10);
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
}

function isPastSlot(date: string, slot: string): boolean {
  const now = new Date();
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  if (date > today) return false;
  if (date < today) return true;
  const [h] = slot.split(":");
  return parseInt(h!, 10) <= now.getHours();
}

export default function GlassCalendar({ value, onChange, minDate, time, onTimeChange }: GlassCalendarProps) {
  const selected = useMemo(() => new Date(value + "T00:00:00"), [value]);
  const [viewYear, setViewYear] = useState(selected.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected.getMonth());

  const minD = minDate ? new Date(minDate + "T00:00:00") : null;

  const days = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [viewYear, viewMonth]);

  function prev() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }

  function next() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }

  function isDayDisabled(day: number): boolean {
    if (!minD) return false;
    const d = new Date(viewYear, viewMonth, day);
    return d < minD;
  }

  function isDaySelected(day: number): boolean {
    return toKey(viewYear, viewMonth, day) === value;
  }

  function isToday(day: number): boolean {
    const now = new Date();
    return viewYear === now.getFullYear() && viewMonth === now.getMonth() && day === now.getDate();
  }

  return (
    <div className="mb-5">
      <span className="font-['Space_Grotesk',sans-serif] text-[13px] uppercase tracking-[2px] text-[rgba(255,255,255,0.8)] mb-4 block">
        {onTimeChange ? "Date & Time" : "Date"}
      </span>
      <div className="bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={prev}
            className="w-12 h-12 rounded-xl bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.12)] text-[rgba(255,255,255,0.5)] hover:text-white transition-all flex items-center justify-center text-[22px]"
          >
            ‹
          </button>
          <div className="text-center">
            <span className="font-['Space_Grotesk',sans-serif] text-[20px] font-semibold text-[rgba(255,255,255,0.85)] tracking-[3px] uppercase">
              {MONTHS[viewMonth]}
            </span>
            <span className="font-['DSEG',monospace] text-[20px] text-[rgba(255,255,255,0.4)] ml-3">
              {viewYear}
            </span>
          </div>
          <button
            type="button"
            onClick={next}
            className="w-12 h-12 rounded-xl bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.12)] text-[rgba(255,255,255,0.5)] hover:text-white transition-all flex items-center justify-center text-[22px]"
          >
            ›
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {DAYS.map((d, i) => (
            <div
              key={i}
              className="text-center font-['Space_Grotesk',sans-serif] text-[13px] uppercase tracking-[2px] text-[rgba(255,255,255,0.3)] py-1"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, i) => {
            if (day === null) {
              return <div key={`empty-${i}`} className="h-14" />;
            }
            const disabled = isDayDisabled(day);
            const sel = isDaySelected(day);
            const today = isToday(day);

            return (
              <button
                key={day}
                type="button"
                disabled={disabled}
                onClick={() => onChange(toKey(viewYear, viewMonth, day))}
                className={`h-14 rounded-xl font-['Space_Grotesk',sans-serif] text-[16px] font-medium transition-all relative ${
                  disabled
                    ? "text-[rgba(255,255,255,0.12)] cursor-not-allowed"
                    : sel
                      ? "text-white"
                      : "text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.08)] hover:text-white"
                }`}
                style={sel ? {
                  backgroundImage: "url(/assets/basketball-leather.jpg)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                } : undefined}
              >
                {day}
                {today && !sel && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[rgba(255,255,255,0.4)]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Time slots */}
        {onTimeChange && (
          <>
            <div className="border-t border-[rgba(255,255,255,0.06)] mt-6 pt-6">
              <span className="font-['Space_Grotesk',sans-serif] text-[13px] uppercase tracking-[2px] text-[rgba(255,255,255,0.75)] mb-4 block">
                Available Times
              </span>
              <div className="grid grid-cols-5 gap-2.5">
                {TIME_SLOTS.map((slot) => {
                  const past = isPastSlot(value, slot);
                  const active = time === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={past}
                      onClick={() => onTimeChange(slot)}
                      className={`py-3.5 rounded-xl font-['DSEG',monospace] text-[15px] transition-all ${
                        past
                          ? "text-[rgba(255,255,255,0.1)] cursor-not-allowed"
                          : active
                            ? "text-white font-bold"
                            : "text-[rgba(255,255,255,0.5)] hover:bg-[rgba(255,255,255,0.08)] hover:text-white"
                      }`}
                      style={active ? {
                        backgroundImage: "url(/assets/basketball-leather.jpg)",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      } : undefined}
                    >
                      {formatSlot(slot)}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
