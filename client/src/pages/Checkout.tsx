import { useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { useSession, useJoinSession } from "../hooks/useSessions.js";
import { useCourt } from "../hooks/useCourts.js";
import { useAuth } from "../context/AuthContext.js";
import Header from "../components/Header.js";

/* ── sub-components ───────────────────────────────────────── */

function SessionSummary({
  courtName,
  date,
  startTime,
  format,
  duration,
  pricePerPlayer,
}: {
  courtName: string;
  date: string;
  startTime: string;
  format: string;
  duration: number;
  pricePerPlayer: number;
}) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5 mb-6">
      <h2 className="text-sm font-semibold mb-3">Session summary</h2>
      <SummaryRow label="Court" value={courtName} />
      <SummaryRow label="Date" value={date} />
      <SummaryRow label="Time" value={startTime} />
      <SummaryRow label="Format" value={format} />
      <SummaryRow label="Duration" value={`${duration}min`} />
      <div className="flex justify-between pt-3 mt-3 border-t border-border">
        <span className="text-sm font-semibold">Price per player</span>
        <span className="text-sm font-bold">${pricePerPlayer}</span>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between mb-1.5">
      <span className="text-xs text-text-secondary">{label}</span>
      <span className="text-xs font-medium">{value}</span>
    </div>
  );
}

function CardInput({
  label,
  placeholder,
  wide,
}: {
  label: string;
  placeholder: string;
  wide?: boolean;
}) {
  return (
    <label className={`block ${wide ? "col-span-2" : ""}`}>
      <span className="text-xs font-medium text-text-secondary mb-1.5 block">{label}</span>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-sm focus:border-accent-red transition placeholder:text-text-muted"
      />
    </label>
  );
}

function PaymentForm({ price, onSubmit, loading }: { price: number; onSubmit: () => void; loading: boolean }) {
  return (
    <div className="mb-6">
      <h2 className="text-sm font-semibold mb-3">Payment details</h2>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <CardInput label="Card number" placeholder="4242 4242 4242 4242" wide />
        <CardInput label="Expiry" placeholder="MM/YY" />
        <CardInput label="CVV" placeholder="123" />
      </div>
      <button
        type="button"
        onClick={onSubmit}
        disabled={loading}
        className="w-full bg-accent-red text-white rounded-lg px-6 py-3 font-medium text-sm hover:shadow-[0_4px_20px_rgba(230,51,40,0.35)] transition-all disabled:opacity-50"
      >
        {loading ? "Processing..." : `Confirm & Pay $${price}`}
      </button>
    </div>
  );
}

function CheckmarkIcon() {
  return (
    <svg className="w-10 h-10 text-accent-green mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function SuccessCard({ sessionId, courtName, date, startTime }: { sessionId: string; courtName: string; date: string; startTime: string }) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-8 text-center">
      <CheckmarkIcon />
      <h2 className="text-xl font-semibold tracking-tight mb-2">You&apos;re in!</h2>
      <p className="text-sm text-text-secondary mb-1">{courtName}</p>
      <p className="text-sm text-text-secondary mb-6">{date} at {startTime}</p>
      <Link
        to={`/sessions/${sessionId}`}
        className="inline-block bg-accent-red text-white rounded-lg px-6 py-3 font-medium text-sm hover:shadow-[0_4px_20px_rgba(230,51,40,0.35)] transition-all"
      >
        View session
      </Link>
    </div>
  );
}

function ErrorToast({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-accent-red text-white text-sm font-medium px-5 py-3 rounded-lg shadow-lg animate-toast-in z-50">
      {message}
    </div>
  );
}

/* ── main page ────────────────────────────────────────────── */

export default function Checkout() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user, logout } = useAuth();
  const { data: session, isLoading } = useSession(sessionId ?? "");
  const { data: court } = useCourt(session?.courtId ?? "");
  const { mutate, isPending } = useJoinSession();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!user) {
    return <Navigate to="/login" state={{ from: `/checkout/${sessionId}` }} replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header user={user} onLogout={logout} />
        <div className="max-w-lg mx-auto px-8 py-10 text-text-muted">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen">
        <Header user={user} onLogout={logout} />
        <div className="max-w-lg mx-auto px-8 py-10 text-text-muted">Session not found</div>
      </div>
    );
  }

  const pricePerPlayer = court ? court.pricePerPlayerPerHour * (session.durationMinutes / 60) : 0;

  function handlePay() {
    setError("");
    mutate(session!.id, {
      onSuccess: () => setSuccess(true),
      onError: (err: any) => setError(err.message ?? "Payment failed"),
    });
  }

  return (
    <div className="min-h-screen">
      <Header user={user} onLogout={logout} />
      <div className="max-w-lg mx-auto px-8 py-10">
        <h1 className="text-xl font-semibold tracking-tight mb-6">Checkout</h1>
        {success ? (
          <SuccessCard
            sessionId={session.id}
            courtName={court?.name ?? ""}
            date={session.date}
            startTime={session.startTime}
          />
        ) : (
          <>
            <SessionSummary
              courtName={court?.name ?? "Loading..."}
              date={session.date}
              startTime={session.startTime}
              format={session.format}
              duration={session.durationMinutes}
              pricePerPlayer={pricePerPlayer}
            />
            <PaymentForm price={pricePerPlayer} onSubmit={handlePay} loading={isPending} />
          </>
        )}
      </div>
      <ErrorToast message={error} />
    </div>
  );
}
