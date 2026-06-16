import { useState } from "react";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";

const pageTitles = {
  dashboard: "Dashboard",
  search: "Consulta de Pagos",
  admin: "Panel Administrativo",
};

export default function Layout({ role, activePage, onNavigate, onLogout, children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        role={role}
        activePage={activePage}
        onNavigate={onNavigate}
        onLogout={onLogout}
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 md:ml-64 flex flex-col">
        <Header
          title={pageTitles[activePage] || ""}
          onMenuToggle={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-3 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
