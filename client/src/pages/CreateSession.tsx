import { useState, useCallback, useRef, useEffect } from "react";
import { useSearchParams, Navigate, Link } from "react-router-dom";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { SessionFormat, SessionMode, CreateSessionInput } from "@shared/types/index.js";
import { MAX_PLAYERS } from "@shared/types/session.js";
import { useCourt } from "../hooks/useCourts.js";
import { useCreateSession } from "../hooks/useSessions.js";
import { useAuth } from "../context/AuthContext.js";
import GlassCalendar from "../components/GlassCalendar.js";
import { todayDate, formatTime } from "../components/utils.js";
import {
  formatCardNumber,
  detectBrand,
  luhnCheck,
  formatExpiry,
  isExpiryValid,
  isCvvValid,
} from "../lib/cardUtils.js";

const DURATIONS = [30, 60, 90, 120] as const;
const STEPS = ["date", "options", "payment", "success"] as const;
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


function StepPayment({
  courtName,
  date,
  time,
  duration,
  format,
  mode,
  pricePerHour,
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
  onSubmit: () => void;
  onBack: () => void;
}) {
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [processing, setProcessing] = useState(false);

  const pricePerPlayer = pricePerHour * (duration / 60);
  const totalPlayers = MAX_PLAYERS[format];
  const brand = detectBrand(cardNumber);

  const cardNumberValid = luhnCheck(cardNumber);
  const expiryValid = isExpiryValid(expiry);
  const cvvValid = isCvvValid(cvv);
  const nameValid = cardName.trim().length > 0;
  const allValid = nameValid && cardNumberValid && expiryValid && cvvValid;

  function handleBlur(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  function inputClass(valid: boolean, field: string): string {
    const base = "w-full bg-[rgba(255,255,255,0.06)] rounded-xl px-4 py-3.5 text-[16px] font-bold text-white font-['Space_Grotesk',sans-serif] outline-none transition-colors placeholder:text-[rgba(255,255,255,0.2)] placeholder:font-normal placeholder:text-[14px]";
    if (touched[field] && !valid) return `${base} border border-[rgba(255,59,48,0.5)]`;
    return `${base} border border-[rgba(255,255,255,0.1)] focus:border-[rgba(255,255,255,0.25)]`;
  }

  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  function handlePay() {
    if (!allValid || processing) return;
    setProcessing(true);
    timerRef.current = setTimeout(() => {
      onSubmit();
    }, 1500);
  }

  return (
    <div className="animate-fade-in-up" style={{ animationDuration: "0.3s", animationFillMode: "forwards" }}>
      <h2 className="font-['Lixdu',sans-serif] text-[36px] uppercase tracking-[4px] text-white mb-2 text-center">
        Payment
      </h2>
      <p className="font-['Space_Grotesk',sans-serif] text-[11px] text-[rgba(255,255,255,0.35)] text-center mb-6">
        Complete your booking
      </p>

      {/* Two-column layout */}
      <div className="flex flex-col md:flex-row md:items-stretch gap-4">
        {/* Left: Booking Summary */}
        <div className="hidden md:flex md:flex-col flex-1 bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] rounded-xl px-5 py-2">
          <SummaryRow label="Court" value={courtName} />
          <SummaryRow label="Date" value={formatDisplayDate(date)} />
          <SummaryRow label="Time" value={formatTime(time)} />
          <SummaryRow label="Duration" value={`${duration} min`} />
          <SummaryRow label="Format" value={format} />
          <SummaryRow label="Type" value={mode === "open" ? "Open Game" : "Full Court"} />
          <SummaryRow label="Players" value={`${totalPlayers}`} />
          <div className="border-t border-[rgba(255,255,255,0.1)] mt-auto pt-3 pb-2 text-center">
            <span className="font-['DSEG',monospace] text-[28px] text-[rgba(255,255,255,0.9)]">${pricePerPlayer}</span>
            <span className="font-['Space_Grotesk',sans-serif] text-[11px] text-[rgba(255,255,255,0.35)] ml-2">/ player</span>
          </div>
        </div>

        {/* Mobile: compact summary */}
        <div className="md:hidden text-center mb-2">
          <div className="font-['Space_Grotesk',sans-serif] text-[11px] text-[rgba(255,255,255,0.4)]">
            {courtName} · {formatDisplayDate(date)} · {formatTime(time)} · {format}
          </div>
          <span className="font-['DSEG',monospace] text-[28px] text-[rgba(255,255,255,0.9)]">${pricePerPlayer}</span>
          <span className="font-['Space_Grotesk',sans-serif] text-[11px] text-[rgba(255,255,255,0.35)] ml-2">/ player</span>
        </div>

        {/* Right: Card Form */}
        <div className="flex-1 flex flex-col gap-3 bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] rounded-xl px-5 py-4">
          {/* Cardholder Name */}
          <div>
            <span className="font-['Space_Grotesk',sans-serif] text-[11px] font-semibold uppercase tracking-[1.5px] text-[rgba(255,255,255,0.45)] mb-1.5 block">
              Cardholder Name
            </span>
            <input
              type="text"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              onBlur={() => handleBlur("name")}
              placeholder="Full name on card"
              className={inputClass(nameValid, "name")}
            />
          </div>

          {/* Card Number */}
          <div>
            <span className="font-['Space_Grotesk',sans-serif] text-[11px] font-semibold uppercase tracking-[1.5px] text-[rgba(255,255,255,0.45)] mb-1.5 block">
              Card Number
            </span>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={formatCardNumber(cardNumber)}
                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                onBlur={() => handleBlur("card")}
                placeholder="4242 4242 4242 4242"
                maxLength={19}
                className={inputClass(cardNumberValid, "card")}
              />
              {brand && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-['Space_Grotesk',sans-serif] text-[10px] uppercase tracking-[1px] text-[rgba(255,255,255,0.3)]">
                  {brand}
                </span>
              )}
            </div>
          </div>

          {/* Expiry + CVV */}
          <div className="flex gap-2.5">
            <div className="flex-1">
              <span className="font-['Space_Grotesk',sans-serif] text-[11px] font-semibold uppercase tracking-[1.5px] text-[rgba(255,255,255,0.45)] mb-1.5 block">
                Expiry
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                onBlur={() => handleBlur("expiry")}
                placeholder="MM/YY"
                maxLength={5}
                className={inputClass(expiryValid, "expiry")}
              />
            </div>
            <div className="flex-1">
              <span className="font-['Space_Grotesk',sans-serif] text-[11px] font-semibold uppercase tracking-[1.5px] text-[rgba(255,255,255,0.45)] mb-1.5 block">
                CVV
              </span>
              <input
                type="password"
                inputMode="numeric"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                onBlur={() => handleBlur("cvv")}
                placeholder="···"
                maxLength={3}
                className={inputClass(cvvValid, "cvv")}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Buttons — full width below both sections */}
      <div className="flex gap-3 mt-5">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-5 px-8 rounded-xl font-['Lixdu',sans-serif] text-[16px] uppercase tracking-[1.5px] whitespace-nowrap bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.12)] hover:text-white transition-all"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handlePay}
          disabled={!allValid || processing}
          className="flex-[2] py-5 rounded-xl font-['Lixdu',sans-serif] text-[16px] uppercase tracking-[2px] whitespace-nowrap text-white hover:shadow-[0_4px_20px_rgba(232,120,23,0.4)] transition-all disabled:opacity-50"
          style={{ backgroundImage: "url(/assets/basketball-leather.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}
        >
          {processing ? "Processing..." : `🏀 Pay $${pricePerPlayer}`}
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
  const courtId = searchParams.get("courtId") ?? "";
  const initialMode = (searchParams.get("mode") as SessionMode) ?? "open";

  const { data: court } = useCourt(courtId);
  const { mutate } = useCreateSession();

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
  }, [courtId, date, startTime, duration, format, mode, mutate]);

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
          <div className={`w-full ${step === "payment" ? "max-w-[720px]" : "max-w-[540px]"}`}>
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
                onNext={() => setStep("payment")}
                onBack={() => setStep("date")}
              />
            )}

            {step === "payment" && court && (
              <StepPayment
                courtName={court.name}
                date={date}
                time={startTime}
                duration={duration}
                format={format}
                mode={mode}
                pricePerHour={court.pricePerPlayerPerHour}
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
