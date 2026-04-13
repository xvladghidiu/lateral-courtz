import { Link } from "react-router-dom";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function NotFound() {
  return (
    <div className="fixed inset-0 text-white z-10">
      <div className="fixed inset-0 z-0">
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
      <div className="fixed inset-0 z-[1] bg-[rgba(10,10,12,0.85)]" />

      <div className="relative z-[2] h-full flex flex-col items-center justify-center px-6">
        <span className="text-[80px] animate-ball-spin mb-6">🏀</span>

        <h1 className="font-['Lixdu',sans-serif] text-[48px] uppercase tracking-[6px] text-white mb-3">
          404
        </h1>
        <p className="font-['Space_Grotesk',sans-serif] text-[13px] text-[rgba(255,255,255,0.4)] tracking-[1px] mb-10">
          This court doesn't exist... yet.
        </p>

        <Link
          to="/"
          className="text-white rounded-xl px-8 py-4 font-['Lixdu',sans-serif] text-[14px] uppercase tracking-[2.5px] hover:shadow-[0_4px_20px_rgba(232,120,23,0.4)] transition-all no-underline"
          style={{ backgroundImage: "url(/assets/basketball-leather.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}
        >
          Back to Courts
        </Link>
      </div>
    </div>
  );
}
