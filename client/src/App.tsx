import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext.js";
import Discover from "./pages/Discover.js";

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
            <Route path="/courts/:id" element={<Placeholder name="Court Details" />} />
            <Route path="/sessions/new" element={<Placeholder name="Create Session" />} />
            <Route path="/sessions/:id" element={<Placeholder name="Session Details" />} />
            <Route path="/checkout/:sessionId" element={<Placeholder name="Checkout" />} />
            <Route path="/login" element={<Placeholder name="Login" />} />
            <Route path="/register" element={<Placeholder name="Register" />} />
            <Route path="/dashboard" element={<Placeholder name="Dashboard" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
