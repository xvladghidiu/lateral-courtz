import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext.js";
import Discover from "./pages/Discover.js";
import Login from "./pages/Login.js";
import Register from "./pages/Register.js";
import CourtDetails from "./pages/CourtDetails.js";
import CreateSession from "./pages/CreateSession.js";
import SessionDetails from "./pages/SessionDetails.js";
import Checkout from "./pages/Checkout.js";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function Placeholder({ name }: { name: string }) {
  return <div style={{ padding: 40, color: "var(--text-2)" }}>{name} — coming soon</div>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Discover />} />
            <Route path="/map" element={<Placeholder name="Full Map" />} />
            <Route path="/courts/:id" element={<CourtDetails />} />
            <Route path="/sessions/new" element={<CreateSession />} />
            <Route path="/sessions/:id" element={<SessionDetails />} />
            <Route path="/checkout/:sessionId" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Placeholder name="Dashboard" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
