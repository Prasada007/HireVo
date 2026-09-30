import { useEffect, useState } from "react";
import api, { BACKEND_URL } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/DashboardLayout";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [applications, setApplications] = useState([]);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentRes, appsRes, drivesRes] = await Promise.all([
          api.get(`/students/${user.id}`),
          api.get(`/applications/student/${user.id}`),
          api.get("/drives/upcoming"),
        ]);
        setStudent(studentRes.data.data);
        setApplications(appsRes.data.data || []);
        setDrives(drivesRes.data.data || []);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.id]);

  const selected = applications.filter((a) => a.status === "SELECTED").length;
  const pending = applications.filter((a) => a.status === "APPLIED").length;

  if (loading) {
    return (
        <DashboardLayout pageTitle="Dashboard">
          <div className="page-header">
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Loading your data...</p>
          </div>
          <div className="page-grid grid-4">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton" style={{ height: 110, borderRadius: 16 }} />
            ))}
          </div>
        </DashboardLayout>
    );
  }

  return (
      <DashboardLayout pageTitle="Dashboard">
        <div className="page-header animate-fade-in">
          <h1 className="page-title">
            Welcome back, {student?.name || user.email} 👋
          </h1>
          <p className="page-subtitle">
            Here&apos;s your placement overview for today
          </p>
        </div>

        <div className="page-grid grid-4 mb-lg">
          <StatCard icon="🚀" label="Upcoming Drives" value={drives.length} color="info" delay={1} />
          <StatCard icon="📋" label="Applications" value={applications.length} color="accent" delay={2} />
          <StatCard icon="⏳" label="Pending" value={pending} color="warning" delay={3} />
          <StatCard icon="✅" label="Selected" value={selected} color="success" delay={4} />
        </div>

        <div className="page-grid grid-2">
          {/* Profile Card */}
          <div className="card animate-fade-in delay-5">
            <div className="card-header">
              <h3 className="card-title">📌 Profile Summary</h3>
            </div>
            {student ? (
                <>
                  <div className="profile-grid">
                    <ProfileRow label="Roll No" value={student.rollNumber} />
                    <ProfileRow label="Branch" value={student.branch} />
                    <ProfileRow label="CGPA" value={student.cgpa} />
                    <ProfileRow label="Year of Passing" value={student.yearOfPassing} />
                    <ProfileRow label="Phone" value={student.phone || "—"} />
                    <ProfileRow
                        label="Backlog"
                        value={student.hasBacklog ? "Yes" : "No"}
                    />
                  </div>
                  <div className="resume-row">
                    <button
                        type="button"
                        onClick={async () => {
                          try {
                            const res = await api.get(`/students/${user.id}/resume`, { responseType: "blob" });
                            const blob = new Blob([res.data], { type: res.headers["content-type"] || "application/pdf" });
                            const url = window.URL.createObjectURL(blob);
                            window.open(url, "_blank");
                          } catch {
                            const token = localStorage.getItem("token");
                            window.open(`${BACKEND_URL}/api/students/${user.id}/resume?token=${encodeURIComponent(token || "")}`, "_blank");
                          }
                        }}
                        className="resume-link"
                        style={{ background: "none", border: "none", cursor: "pointer", font: "inherit", padding: 0 }}
                    >
                      📄 View Resume
                    </button>
                  </div>
                </>
            ) : (
                <p className="text-muted">Profile not found</p>
            )}
          </div>

          {/* Recent Applications */}
          <div className="card animate-fade-in delay-6">
            <div className="card-header">
              <h3 className="card-title">📋 Recent Applications</h3>
            </div>
            {applications.length === 0 ? (
                <p className="text-muted" style={{ fontSize: "0.9rem" }}>
                  You haven&apos;t applied to any drives yet.
                </p>
            ) : (
                <div className="recent-apps">
                  {applications.slice(0, 5).map((app) => (
                      <div key={app.id} className="recent-app-item">
                        <div className="recent-app-info">
                    <span className="recent-app-company">
                      {app.drive?.company?.name || "Drive #" + app.drive?.id}
                    </span>
                          <span className="recent-app-date">
                      {app.appliedAt
                          ? new Date(app.appliedAt).toLocaleDateString()
                          : "—"}
                    </span>
                        </div>
                        <StatusBadge status={app.status} />
                      </div>
                  ))}
                </div>
            )}
          </div>
        </div>

        <style>{`
        .profile-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .profile-row {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .profile-row-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }
        .profile-row-value {
          font-size: 0.95rem;
          color: var(--text-primary);
          font-weight: 500;
        }
        .resume-row {
          margin-top: 16px;
          padding-top: 14px;
          border-top: 1px solid var(--border-color, rgba(0,0,0,0.08));
        }
        .resume-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: var(--bg-input);
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-primary);
          text-decoration: none;
          transition: background var(--transition-fast);
        }
        .resume-link:hover {
          background: var(--bg-card-hover);
        }
        .recent-apps {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .recent-app-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          background: var(--bg-input);
          border-radius: var(--radius-md);
          transition: background var(--transition-fast);
        }
        .recent-app-item:hover {
          background: var(--bg-card-hover);
        }
        .recent-app-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .recent-app-company {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-primary);
        }
        .recent-app-date {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        @media (max-width: 640px) {
          .profile-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      </DashboardLayout>
  );
}

function ProfileRow({ label, value }) {
  return (
      <div className="profile-row">
        <span className="profile-row-label">{label}</span>
        <span className="profile-row-value">{value}</span>
      </div>
  );
}