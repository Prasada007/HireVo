import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { BACKEND_URL } from "../../api/axios";
import DashboardLayout from "../../components/DashboardLayout";
import StatusBadge from "../../components/StatusBadge";
import { useToast } from "../../components/Toast";

const STATUS_OPTIONS = ["APPLIED", "SHORTLISTED", "SELECTED", "REJECTED"];

export default function DriveApplicants() {
  const { driveId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, [driveId]);

  const fetchApplications = () => {
    api.get(`/applications/drive/${driveId}`)
      .then((res) => setApplications(res.data.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const updateStatus = async (appId, value) => {
    setUpdatingId(appId);
    try {
      await api.put(`/applications/${appId}/status?value=${value}`);
      addToast(`Status updated to ${value}`, "success");
      fetchApplications();
    } catch (err) {
      addToast(err.response?.data?.message || "Update failed", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <DashboardLayout pageTitle={`Drive #${driveId} Applicants`}>
      <div className="page-header animate-fade-in">
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)", marginBottom: "var(--space-sm)" }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate("/company/drives")}>
            ← Back to Drives
          </button>
        </div>
        <h1 className="page-title">Applicants — Drive #{driveId} 👥</h1>
        <p className="page-subtitle">
          Review and update applicant statuses ({applications.length} total)
        </p>
      </div>

      {loading ? (
        <div className="page-grid grid-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 200, borderRadius: 16 }} />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon">👥</div>
          <p>No applicants for this drive yet.</p>
        </div>
      ) : (
        <div className="page-grid grid-3">
          {applications.map((app, idx) => (
            <div
              key={app.id}
              className={`card animate-fade-in delay-${Math.min(idx + 1, 6)}`}
            >
              <div className="card-header">
                <h3 className="card-title">
                  {app.student?.name || "Student"}
                </h3>
                <StatusBadge status={app.status} />
              </div>

              <div className="applicant-info">
                <ApplicantDetail
                  label="Email"
                  value={app.student?.email || "—"}
                />
                <ApplicantDetail
                  label="Roll No"
                  value={app.student?.rollNumber || "—"}
                />
                <ApplicantDetail
                  label="Branch"
                  value={app.student?.branch || "—"}
                />
                <ApplicantDetail
                  label="CGPA"
                  value={app.student?.cgpa ?? "—"}
                />
                <ApplicantDetail
                  label="Applied"
                  value={
                    app.appliedAt
                      ? new Date(app.appliedAt).toLocaleDateString()
                      : "—"
                  }
                />
              </div>

              <div style={{ marginTop: "12px", display: "flex", justifyContent: "flex-start" }}>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={async () => {
                    try {
                      const res = await api.get(`/students/${app.student?.id}/resume`, { responseType: "blob" });
                      const blob = new Blob([res.data], { type: res.headers["content-type"] || "application/pdf" });
                      const url = window.URL.createObjectURL(blob);
                      window.open(url, "_blank");
                    } catch {
                      const token = localStorage.getItem("token");
                      window.open(`${BACKEND_URL}/api/students/${app.student?.id}/resume?token=${encodeURIComponent(token || "")}`, "_blank");
                    }
                  }}
                >
                  📄 View Resume
                </button>
              </div>

              <div className="applicant-actions mt-md">
                <span className="action-label">Update:</span>
                <div className="action-buttons">
                  {STATUS_OPTIONS.filter((s) => s !== app.status).map((s) => (
                    <button
                      key={s}
                      className={`btn btn-sm ${s === "SELECTED"
                          ? "btn-success"
                          : s === "REJECTED"
                            ? "btn-danger"
                            : "btn-secondary"
                        }`}
                      onClick={() => updateStatus(app.id, s)}
                      disabled={updatingId === app.id}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .applicant-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: var(--space-md);
        }
        .applicant-detail {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .applicant-detail-label {
          font-size: 0.72rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          font-weight: 600;
        }
        .applicant-detail-value {
          font-size: 0.88rem;
          color: var(--text-primary);
          font-weight: 500;
        }
        .applicant-actions {
          border-top: 1px solid var(--border);
          padding-top: var(--space-sm);
        }
        .action-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-bottom: var(--space-sm);
          display: block;
        }
        .action-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
      `}</style>
    </DashboardLayout>
  );
}

function ApplicantDetail({ label, value }) {
  return (
    <div className="applicant-detail">
      <span className="applicant-detail-label">{label}</span>
      <span className="applicant-detail-value">{value}</span>
    </div>
  );
}
