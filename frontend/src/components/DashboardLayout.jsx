import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import "./DashboardLayout.css";
import { useAuth } from "../context/AuthContext";
import { useToast } from "./Toast";
import { BACKEND_URL } from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function DashboardLayout({ children, pageTitle }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !user) return;

    let eventSource;
    try {
      eventSource = new EventSource(`${BACKEND_URL}/api/notifications/subscribe?token=${encodeURIComponent(token)}`);

      eventSource.addEventListener("NEW_DRIVE", (e) => {
        try {
          const data = JSON.parse(e.data);
          addToast(data.message || "New placement drive announced!", "info", 5000);
        } catch {
          addToast("New placement drive announced!", "info", 5000);
        }
      });

      eventSource.addEventListener("SHORTLISTED", (e) => {
        try {
          const data = JSON.parse(e.data);
          addToast(data.message || "You have been shortlisted!", "success", 6000);
        } catch {
          addToast("You have been shortlisted!", "success", 6000);
        }
      });

      eventSource.addEventListener("NEW_APPLICANT", (e) => {
        try {
          const data = JSON.parse(e.data);
          addToast(data.message || "New applicant applied to your drive", "info", 4500);
        } catch {
          addToast("New applicant applied to your drive", "info", 4500);
        }
      });

      eventSource.onerror = () => {
        // Handled automatically by browser retry backoff
      };
    } catch (err) {
      console.warn("Real-time notification subscription failed:", err);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [user, addToast]);

  const roleLabel =
    user?.role === "ADMIN"
      ? "Admin"
      : user?.role === "COMPANY"
      ? "Company"
      : "Student";

  const roleColor =
    user?.role === "ADMIN"
      ? "var(--warning)"
      : user?.role === "COMPANY"
      ? "var(--info)"
      : "var(--accent)";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initial = user?.email?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="dashboard-content">
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <button
              className="topbar-hamburger"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              ☰
            </button>
            <div className="topbar-breadcrumb">
              HireVo / <span>{pageTitle || "Dashboard"}</span>
            </div>
          </div>

          <div className="topbar-right">
            <span
              className="topbar-role-badge"
              style={{ background: `${roleColor}1a`, color: roleColor }}
            >
              {roleLabel}
            </span>
            <div className="topbar-user">
              <div className="topbar-avatar">{initial}</div>
              <span className="topbar-email">{user?.email}</span>
            </div>
            <button
              className="topbar-logout-btn"
              onClick={handleLogout}
              title="Logout"
            >
              ⏻
            </button>
          </div>
        </header>

        <main className="dashboard-main">{children}</main>
      </div>
    </div>
  );
}

