import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";

/* ── sub-components ───────────────────────────────────────── */

function BrandHeader() {
  return (
    <div className="flex items-center gap-2.5 mb-8 justify-center">
      <div className="w-[7px] h-[7px] rounded-full bg-accent-red shadow-[0_0_10px_rgba(230,51,40,0.5)] animate-breathe" />
      <span className="text-[15px] font-semibold tracking-[-0.3px]">Lateral Courts</span>
    </div>
  );
}

function FormInput({
  label,
  type,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block mb-4">
      <span className="text-xs font-medium text-text-secondary mb-1.5 block">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-sm focus:border-accent-red transition placeholder:text-text-muted"
      />
    </label>
  );
}

function ErrorMessage({ message }: { message: string }) {
  if (!message) return null;
  return <p className="text-sm text-accent-red mb-4">{message}</p>;
}

function SubmitButton({ label, loading }: { label: string; loading: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full bg-accent-red text-white rounded-lg px-6 py-3 font-medium text-sm hover:shadow-[0_4px_20px_rgba(230,51,40,0.35)] transition-all disabled:opacity-50"
    >
      {loading ? "Signing in..." : label}
    </button>
  );
}

/* ── main page ────────────────────────────────────────────── */

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: string })?.from ?? "/";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-surface border border-border rounded-2xl p-8">
        <BrandHeader />
        <h1 className="text-xl font-semibold tracking-tight text-center mb-6">Sign in to your account</h1>
        <form onSubmit={handleSubmit}>
          <ErrorMessage message={error} />
          <FormInput label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
          <FormInput label="Password" type="password" value={password} onChange={setPassword} placeholder="Your password" />
          <SubmitButton label="Sign in" loading={loading} />
        </form>
        <p className="text-sm text-text-secondary text-center mt-5">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-accent-red font-medium hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
}
