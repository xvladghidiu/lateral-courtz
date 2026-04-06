import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useAuth } from "../context/AuthContext.js";

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
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Map background */}
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

      {/* Glass card */}
      <div className="absolute inset-0 z-10 flex items-center justify-center px-4">
        <div className="w-full max-w-[400px] bg-[rgba(255,255,255,0.08)] backdrop-blur-[24px] backdrop-saturate-[180%] border border-[rgba(255,255,255,0.12)] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] px-8 py-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="font-['Lixdu',sans-serif] text-[22px] uppercase tracking-[3px] text-[rgba(255,255,255,0.85)]">
              Lateral Courtz
            </h1>
            <p className="font-['Space_Grotesk',sans-serif] text-[10px] uppercase tracking-[2px] text-[rgba(255,255,255,0.4)] mt-2">
              Sign in to your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="EMAIL"
              className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-[14px] text-white placeholder:font-['Space_Grotesk',sans-serif] placeholder:text-[11px] placeholder:uppercase placeholder:tracking-[1.5px] placeholder:text-[rgba(255,255,255,0.3)] focus:border-[rgba(255,255,255,0.25)] transition-colors outline-none"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="PASSWORD"
              className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-[14px] text-white placeholder:font-['Space_Grotesk',sans-serif] placeholder:text-[11px] placeholder:uppercase placeholder:tracking-[1.5px] placeholder:text-[rgba(255,255,255,0.3)] focus:border-[rgba(255,255,255,0.25)] transition-colors outline-none"
            />

            {error && (
              <p className="text-[#ff3b30] text-[12px] text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white rounded-xl px-6 py-3 font-['Lixdu',sans-serif] text-[14px] uppercase tracking-[3px] hover:shadow-[0_4px_20px_rgba(232,120,23,0.4)] transition-all disabled:opacity-50 mt-1"
              style={{ backgroundImage: "url(/assets/basketball-leather.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="font-['Space_Grotesk',sans-serif] text-[10px] uppercase tracking-[1.5px] text-[rgba(255,255,255,0.4)] text-center mt-6">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-[rgba(255,255,255,0.7)] hover:text-white transition-colors">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
