import { useState } from "react";
import { useSearchParams, useNavigate, Navigate } from "react-router-dom";
import type { SessionFormat, SessionMode, CreateSessionInput } from "@shared/types/index.js";
import { MAX_PLAYERS } from "@shared/types/session.js";
import { useCourt } from "../hooks/useCourts.js";
import { useCreateSession } from "../hooks/useSessions.js";
import { useAuth } from "../context/AuthContext.js";
import Header from "../components/Header.js";

/* ── helpers ──────────────────────────────────────────────── */

function todayDate(): string {
  return new Date().toISOString().split("T")[0]!;
}

const DURATIONS = [30, 60, 90, 120] as const;

/* ── sub-components ───────────────────────────────────────── */

function FormInput({
  label,
  type,
  value,
  onChange,
  min,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  min?: string;
}) {
  return (
    <label className="block mb-5">
      <span className="text-xs font-medium text-text-secondary mb-1.5 block">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-sm focus:border-accent-red transition"
      />
    </label>
  );
}

function SegmentedControl<T extends string | number>({
  label,
  options,
  value,
  onChange,
  renderLabel,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  renderLabel: (v: T) => string;
}) {
  return (
    <div className="mb-5">
      <span className="text-xs font-medium text-text-secondary mb-1.5 block">{label}</span>
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            key={String(opt)}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition ${
              value === opt
                ? "bg-accent-red text-white"
                : "bg-surface border border-border text-text-secondary hover:border-border-hover"
            }`}
          >
            {renderLabel(opt)}
          </button>
        ))}
      </div>
    </div>
  );
}

function PriceSummary({
  pricePerHour,
  duration,
  format,
}: {
  pricePerHour: number;
  duration: number;
  format: SessionFormat;
}) {
  const pricePerPlayer = pricePerHour * (duration / 60);
  const totalPlayers = MAX_PLAYERS[format];

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 mb-6">
      <div className="flex justify-between mb-2">
        <span className="text-sm text-text-secondary">Price per player</span>
        <span className="text-sm font-bold">${pricePerPlayer}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-text-secondary">Total players needed</span>
        <span className="text-sm font-bold">{totalPlayers}</span>
      </div>
    </div>
  );
}

/* ── main page ────────────────────────────────────────────── */

export default function CreateSession() {
  const { user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const courtId = searchParams.get("courtId") ?? "";
  const initialMode = (searchParams.get("mode") as SessionMode) ?? "open";

  const { data: court } = useCourt(courtId);
  const { mutate, isPending } = useCreateSession();

  const [date, setDate] = useState(todayDate);
  const [startTime, setStartTime] = useState("18:00");
  const [duration, setDuration] = useState<number>(60);
  const [format, setFormat] = useState<SessionFormat>("5v5");
  const [mode, setMode] = useState<SessionMode>(initialMode);

  if (!user) {
    return <Navigate to="/login" state={{ from: `/sessions/new?courtId=${courtId}&mode=${initialMode}` }} replace />;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const input: CreateSessionInput = {
      courtId,
      date,
      startTime,
      durationMinutes: duration,
      format,
      mode,
    };
    mutate(input, {
      onSuccess: (session) => navigate(`/sessions/${session.id}`),
    });
  }

  return (
    <div className="min-h-screen">
      <Header user={user} onLogout={logout} />
      <div className="max-w-lg mx-auto px-8 py-10">
        <h1 className="text-xl font-semibold tracking-tight mb-1">Create a Session</h1>
        {court && <p className="text-sm text-text-secondary mb-6">{court.name}</p>}
        <form onSubmit={handleSubmit}>
          <FormInput label="Date" type="date" value={date} onChange={setDate} min={todayDate()} />
          <FormInput label="Start time" type="time" value={startTime} onChange={setStartTime} />
          <SegmentedControl
            label="Duration"
            options={DURATIONS}
            value={duration}
            onChange={setDuration}
            renderLabel={(d) => `${d}min`}
          />
          <SegmentedControl
            label="Format"
            options={["5v5", "3v3"] as const}
            value={format}
            onChange={(v) => setFormat(v as SessionFormat)}
            renderLabel={(f) => f}
          />
          <SegmentedControl
            label="Mode"
            options={["open", "private"] as const}
            value={mode}
            onChange={(v) => setMode(v as SessionMode)}
            renderLabel={(m) => (m === "open" ? "Open Game" : "Full Court")}
          />
          {court && <PriceSummary pricePerHour={court.pricePerPlayerPerHour} duration={duration} format={format} />}
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-accent-red text-white rounded-lg px-6 py-3 font-medium text-sm hover:shadow-[0_4px_20px_rgba(230,51,40,0.35)] transition-all disabled:opacity-50"
          >
            {isPending ? "Creating..." : "Create Session"}
          </button>
        </form>
      </div>
    </div>
  );
}
