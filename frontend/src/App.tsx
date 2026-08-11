import { useState } from "react";
import { Dashboard } from "./pages/Dashboard";
import { Clients } from "./pages/Clients";
import type { PageKey } from "./components/Header";

export default function App() {
  const [page, setPage] = useState<PageKey>("dashboard");

  if (page === "clients") {
    return <Clients activePage={page} onNavigate={setPage} />;
  }

  return <Dashboard activePage={page} onNavigate={setPage} />;
}