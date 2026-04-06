import { useState, useCallback } from "react";
import { useSearchParams, useNavigate, Navigate, Link } from "react-router-dom";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { SessionFormat, SessionMode, CreateSessionInput } from "@shared/types/index.js";
import { MAX_PLAYERS } from "@shared/types/session.js";
import { useCourt } from "../hooks/useCourts.js";
import { useCreateSession } from "../hooks/useSessions.js";
import { useAuth } from "../context/AuthContext.js";
import GlassCalendar from "../components/GlassCalendar.js";
import { todayDate } from "../components/utils.js";

const DURATIONS = [30, 60, 90, 120] as const;
const STEPS = ["date", "options", "confirm", "success"] as const;
type Step = typeof STEPS[number];

/* ── Step indicator ──────────────────────────────────────── */

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === current
              ? "w-8 bg-[rgba(255,255,255,0.7)]"
              : i < current
                ? "w-4 bg-[rgba(255,255,255,0.3)]"
                : "w-4 bg-[rgba(255,255,255,0.1)]"
          }`}
        />
      ))}
    </div>
  );
}

/* ── Step 1: Date & Time ─────────────────────────────────── */

function StepDate({
  date,
  time,
  onDateChange,
  onTimeChange,
  onNext,
}: {
  date: string;
  time: string;
  onDateChange: (d: string) => void;
  onTimeChange: (t: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="animate-fade-in-up" style={{ animationDuration: "0.3s", animationFillMode: "forwards" }}>
      <h2 className="font-['Lixdu',sans-serif] text-[36px] uppercase tracking-[4px] text-white mb-2 text-center">
        When?
      </h2>
      <p className="font-['Space_Grotesk',sans-serif] text-[11px] text-[rgba(255,255,255,0.35)] text-center mb-6">
        Pick a date and time for your game
      </p>
      <GlassCalendar
        value={date}
        onChange={onDateChange}
        minDate={todayDate()}
        time={time}
        onTimeChange={onTimeChange}
      />
      <button
        type="button"
        onClick={onNext}
        className="w-full text-white rounded-xl px-6 py-3.5 font-['Lixdu',sans-serif] text-[14px] uppercase tracking-[3px] hover:shadow-[0_4px_20px_rgba(232,120,23,0.4)] transition-all mt-2"
        style={{ backgroundImage: "url(/assets/basketball-leather.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        Next →
      </button>
    </div>
  );
}

/* ── Step 2: Options ─────────────────────────────────────── */

function OptionCard({
  label,
  options,
  value,
  onChange,
  renderLabel,
  renderSub,
}: {
  label: string;
  options: readonly (string | number)[];
  value: string | number;
  onChange: (v: any) => void;
  renderLabel: (v: any) => string;
  renderSub?: (v: any) => string;
}) {
  return (
    <div className="mb-5">
      <span className="font-['Space_Grotesk',sans-serif] text-[10px] uppercase tracking-[1.5px] text-[rgba(255,255,255,0.4)] mb-2 block">
        {label}
      </span>
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={String(opt)}
              type="button"
              onClick={() => onChange(opt)}
              className={`py-4 rounded-xl font-['Lixdu',sans-serif] text-center transition-all ${
                active
                  ? "text-white border-2 border-transparent"
                  : "text-[rgba(255,255,255,0.5)] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.08)] hover:text-white"
              }`}
              style={active ? {
                backgroundImage: "url(/assets/basketball-leather.jpg)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              } : undefined}
            >
              <div className="text-[15px] font-semibold tracking-[1px] uppercase">{renderLabel(opt)}</div>
              {renderSub && (
                <div className={`text-[9px] mt-1 uppercase tracking-[1px] ${active ? "text-[rgba(255,255,255,0.7)]" : "text-[rgba(255,255,255,0.3)]"}`}>
                  {renderSub(opt)}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepOptions({
  duration,
  format,
  mode,
  onDuration,
  onFormat,
  onMode,
  onNext,
  onBack,
}: {
  duration: number;
  format: SessionFormat;
  mode: SessionMode;
  onDuration: (d: number) => void;
  onFormat: (f: SessionFormat) => void;
  onMode: (m: SessionMode) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="animate-fade-in-up" style={{ animationDuration: "0.3s", animationFillMode: "forwards" }}>
      <h2 className="font-['Lixdu',sans-serif] text-[36px] uppercase tracking-[4px] text-white mb-2 text-center">
        How?
      </h2>
      <p className="font-['Space_Grotesk',sans-serif] text-[11px] text-[rgba(255,255,255,0.35)] text-center mb-6">
        Set up your game format
      </p>

      <OptionCard
        label="Duration"
        options={DURATIONS}
        value={duration}
        onChange={onDuration}
        renderLabel={(d: number) => `${d} min`}
        renderSub={(d: number) => d <= 30 ? "Quick run" : d <= 60 ? "Standard" : d <= 90 ? "Extended" : "Full session"}
      />
      <OptionCard
        label="Format"
        options={["5v5", "3v3"]}
        value={format}
        onChange={onFormat}
        renderLabel={(f: string) => f}
        renderSub={(f: string) => f === "5v5" ? "10 players" : "6 players"}
      />
      <OptionCard
        label="Game Type"
        options={["open", "private"]}
        value={mode}
        onChange={onMode}
        renderLabel={(m: string) => m === "open" ? "Open Game" : "Full Court"}
        renderSub={(m: string) => m === "open" ? "Anyone can join" : "Private booking"}
      />

      <div className="flex gap-3 mt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3.5 rounded-xl font-['Lixdu',sans-serif] text-[14px] uppercase tracking-[3px] bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.12)] hover:text-white transition-all"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-[2] py-3.5 rounded-xl font-['Lixdu',sans-serif] text-[14px] uppercase tracking-[3px] text-white hover:shadow-[0_4px_20px_rgba(232,120,23,0.4)] transition-all"
          style={{ backgroundImage: "url(/assets/basketball-leather.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

/* ── Step 3: Confirm ─────────────────────────────────────── */

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-3 border-b border-[rgba(255,255,255,0.06)] last:border-b-0">
      <span className="font-['Space_Grotesk',sans-serif] text-[10px] uppercase tracking-[1.5px] text-[rgba(255,255,255,0.35)]">{label}</span>
      <span className="font-['Space_Grotesk',sans-serif] text-[12px] text-[rgba(255,255,255,0.85)] font-medium">{value}</span>
    </div>
  );
}

function formatDisplayDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatTime(time: string): string {
  const [h] = time.split(":");
  const hour = parseInt(h!, 10);
  if (hour === 0) return "12:00 AM";
  if (hour < 12) return `${hour}:00 AM`;
  if (hour === 12) return "12:00 PM";
  return `${hour - 12}:00 PM`;
}

function StepConfirm({
  courtName,
  date,
  time,
  duration,
  format,
  mode,
  pricePerHour,
  isPending,
  onSubmit,
  onBack,
}: {
  courtName: string;
  date: string;
  time: string;
  duration: number;
  format: SessionFormat;
  mode: SessionMode;
  pricePerHour: number;
  isPending: boolean;
  onSubmit: () => void;
  onBack: () => void;
}) {
  const pricePerPlayer = pricePerHour * (duration / 60);
  const totalPlayers = MAX_PLAYERS[format];

  return (
    <div className="animate-fade-in-up" style={{ animationDuration: "0.3s", animationFillMode: "forwards" }}>
      <h2 className="font-['Lixdu',sans-serif] text-[36px] uppercase tracking-[4px] text-white mb-2 text-center">
        Confirm
      </h2>
      <p className="font-['Space_Grotesk',sans-serif] text-[11px] text-[rgba(255,255,255,0.35)] text-center mb-6">
        Review your booking details
      </p>

      {/* Summary card */}
      <div className="bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] rounded-xl px-5 py-2 mb-4">
        <SummaryRow label="Court" value={courtName} />
        <SummaryRow label="Date" value={formatDisplayDate(date)} />
        <SummaryRow label="Time" value={formatTime(time)} />
        <SummaryRow label="Duration" value={`${duration} min`} />
        <SummaryRow label="Format" value={format} />
        <SummaryRow label="Type" value={mode === "open" ? "Open Game" : "Full Court"} />
        <SummaryRow label="Players" value={`${totalPlayers}`} />
      </div>

      {/* Price */}
      <div className="text-center mb-6">
        <span className="font-['DSEG',monospace] text-[36px] text-[rgba(255,255,255,0.9)]">${pricePerPlayer}</span>
        <span className="font-['Space_Grotesk',sans-serif] text-[11px] text-[rgba(255,255,255,0.35)] ml-2">/ player</span>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3.5 rounded-xl font-['Lixdu',sans-serif] text-[14px] uppercase tracking-[3px] bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.12)] hover:text-white transition-all"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isPending}
          className="flex-[2] py-3.5 rounded-xl font-['Lixdu',sans-serif] text-[14px] uppercase tracking-[3px] text-white hover:shadow-[0_4px_20px_rgba(232,120,23,0.4)] transition-all disabled:opacity-50"
          style={{ backgroundImage: "url(/assets/basketball-leather.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}
        >
          {isPending ? "Booking..." : "🏀 Book It"}
        </button>
      </div>
    </div>
  );
}

/* ── Step 4: Success Celebration ──────────────────────────── */

function StepSuccess({
  courtName,
  date,
  time,
}: {
  courtName: string;
  date: string;
  time: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      {/* Spinning basketball */}
      <div className="text-[80px] animate-spin-slow mb-8">🏀</div>

      {/* Title */}
      <h2
        className="font-['Lixdu',sans-serif] text-[42px] uppercase tracking-[5px] text-white animate-fade-in-up"
        style={{ animationDelay: "1.5s" }}
      >
        BOOKED!
      </h2>

      {/* Subtitle */}
      <p
        className="font-['Space_Grotesk',sans-serif] text-[14px] text-[rgba(255,255,255,0.5)] mt-4 animate-fade-in-up"
        style={{ animationDelay: "2s" }}
      >
        {courtName}
      </p>
      <p
        className="font-['Space_Grotesk',sans-serif] text-[12px] text-[rgba(255,255,255,0.35)] mt-1 animate-fade-in-up"
        style={{ animationDelay: "2.2s" }}
      >
        {formatDisplayDate(date)} · {formatTime(time)}
      </p>

      {/* CTA */}
      <div className="animate-fade-in-up mt-10 w-full max-w-[300px]" style={{ animationDelay: "2.8s" }}>
        <a
          href="/"
          className="block w-full text-center text-white rounded-xl px-6 py-4 font-['Lixdu',sans-serif] text-[15px] uppercase tracking-[3px] hover:shadow-[0_4px_20px_rgba(232,120,23,0.4)] transition-all no-underline"
          style={{ backgroundImage: "url(/assets/basketball-leather.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}
        >
          Explore Courts
        </a>
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────── */

export default function CreateSession() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const courtId = searchParams.get("courtId") ?? "";
  const initialMode = (searchParams.get("mode") as SessionMode) ?? "open";

  const { data: court } = useCourt(courtId);
  const { mutate, isPending } = useCreateSession();

  const [step, setStep] = useState<Step>("date");
  const [date, setDate] = useState(todayDate);
  const [startTime, setStartTime] = useState("18:00");
  const [duration, setDuration] = useState<number>(60);
  const [format, setFormat] = useState<SessionFormat>("5v5");
  const [mode, setMode] = useState<SessionMode>(initialMode);

  const stepIndex = STEPS.indexOf(step);

  const handleSubmit = useCallback(() => {
    const input: CreateSessionInput = {
      courtId,
      date,
      startTime,
      durationMinutes: duration,
      format,
      mode,
    };
    mutate(input, {
      onSuccess: () => setStep("success"),
    });
  }, [courtId, date, startTime, duration, format, mode, mutate, navigate]);

  if (!user) {
    return <Navigate to="/login" state={{ from: `/sessions/new?courtId=${courtId}&mode=${initialMode}` }} replace />;
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={[40.73, -73.99]}
          zoom={13}
          zoomControl={false}
          attributionControl={false}
          dragging={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          touchZoom={false}
          keyboard={false}
          className="w-full h-full"
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        </MapContainer>
      </div>
      {/* Full-page overlay */}
      <div className="absolute inset-0 z-10 flex flex-col">
        {step !== "success" && (
          <>
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 py-4">
              <Link
                to="/"
                className="font-['Space_Grotesk',sans-serif] text-[10px] uppercase tracking-[1.5px] text-[rgba(255,255,255,0.4)] hover:text-white transition-colors"
              >
                ← Back
              </Link>
              {court && (
                <span className="font-['Space_Grotesk',sans-serif] text-[10px] uppercase tracking-[1.5px] text-[rgba(255,255,255,0.3)]">
                  {court.name}
                </span>
              )}
              <div className="w-10" />
            </div>

            <StepDots current={stepIndex} total={3} />
          </>
        )}

        {/* Step content — centered */}
        <div className="flex-1 flex items-center justify-center px-6 pb-10 overflow-y-auto">
          <div className="w-full max-w-[540px]">
            {step === "date" && (
              <StepDate
                date={date}
                time={startTime}
                onDateChange={setDate}
                onTimeChange={setStartTime}
                onNext={() => setStep("options")}
              />
            )}

            {step === "options" && (
              <StepOptions
                duration={duration}
                format={format}
                mode={mode}
                onDuration={setDuration}
                onFormat={(f) => setFormat(f as SessionFormat)}
                onMode={(m) => setMode(m as SessionMode)}
                onNext={() => setStep("confirm")}
                onBack={() => setStep("date")}
              />
            )}

            {step === "confirm" && court && (
              <StepConfirm
                courtName={court.name}
                date={date}
                time={startTime}
                duration={duration}
                format={format}
                mode={mode}
                pricePerHour={court.pricePerPlayerPerHour}
                isPending={isPending}
                onSubmit={handleSubmit}
                onBack={() => setStep("options")}
              />
            )}

            {step === "success" && court && (
              <StepSuccess
                courtName={court.name}
                date={date}
                time={startTime}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
