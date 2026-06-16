import { useState, useEffect } from "react";
import { isLoggedIn, logout, getRole } from "./api.js";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import Layout from "./components/Layout.jsx";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [activePage, setActivePage] = useState("dashboard");

  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, []);

  function handleLogin() {
    setLoggedIn(true);
    const role = getRole();
    setActivePage(role === "operador" ? "search" : "dashboard");
  }

  function handleLogout() {
    logout();
    setLoggedIn(false);
    setActivePage("dashboard");
  }

  function handleNavigate(page) {
    setActivePage(page);
  }

  if (!loggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const role = getRole();

  return (
    <Layout role={role} activePage={activePage} onNavigate={handleNavigate} onLogout={handleLogout}>
      {activePage === "dashboard" && role === "admin" && <DashboardPage />}
      {activePage === "search" && <SearchPage />}
      {activePage === "admin" && role === "admin" && <AdminPage />}
    </Layout>
  );
}
