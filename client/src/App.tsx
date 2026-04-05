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
import Dashboard from "./pages/Dashboard.js";
import BottomTabs from "./components/BottomTabs.js";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Discover />} />
            <Route path="/courts/:id" element={<CourtDetails />} />
            <Route path="/sessions/new" element={<CreateSession />} />
            <Route path="/sessions/:id" element={<SessionDetails />} />
            <Route path="/checkout/:sessionId" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
          <BottomTabs />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
