import { useEffect, useState } from "react";
import api, { BACKEND_URL } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/DashboardLayout";
import { useToast } from "../../components/Toast";

export default function MyProfile() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/students/${user.id}`);
        let data = res.data?.data || res.data;
        if (Array.isArray(data)) {
          data = data.find((s) => s.id === user.id) || data[0];
        }
        setStudent(data);
        setForm({
          phone: data?.phone || "",
          skills: data?.profile?.skills || "",
          internshipDetails: data?.profile?.internshipDetails || "",
          certificationScore: data?.profile?.certificationScore || 0,
        });
      } catch (err) {
        console.error("Failed to load student:", err);
        addToast("Failed to load profile data", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Update basic student details
      await api.put(`/students/${user.id}`, { ...student, phone: form.phone });

      // 2. Update profile details via query params
      const params = new URLSearchParams();
      params.set("skills", form.skills);
      if (form.internshipDetails) params.set("internshipDetails", form.internshipDetails);
      params.set("certificationScore", form.certificationScore);

      const profileRes = await api.put(`/students/${user.id}/profile?${params.toString()}`);
      setStudent((prev) => ({ ...prev, phone: form.phone, profile: profileRes.data.data }));
      setEditing(false);
      addToast("Profile updated successfully!", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Update failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post(`/students/${user.id}/resume`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setStudent((prev) => ({ ...prev, profile: { ...prev?.profile, resumePath: res.data.data } }));
      addToast("Resume uploaded successfully!", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <DashboardLayout pageTitle="My Profile">
        <div className="page-grid grid-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 320, borderRadius: 16 }} />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  const academicFields = [
    { label: "Name", value: student?.name },
    { label: "Email", value: student?.email },
    { label: "Roll Number", value: student?.rollNumber },
    { label: "Branch", value: student?.branch },
    { label: "CGPA", value: student?.cgpa },
    { label: "Year of Passing", value: student?.yearOfPassing },
    { label: "Phone", value: student?.phone || "—" },
    { label: "Backlog", value: student?.hasBacklog ? "Yes" : "No" },
  ];

  const profileFields = [
    { label: "Skills", value: student?.profile?.skills || "Not set" },
    { label: "Internship Details", value: student?.profile?.internshipDetails || "Not set" },
    { label: "Certification Score", value: student?.profile?.certificationScore ?? "Not set" },
    { label: "Resume", value: student?.profile?.resumePath ? "✅ Uploaded" : "Not uploaded" },
  ];

  return (
    <DashboardLayout pageTitle="My Profile">
      <div className="page-header animate-fade-in">
        {/* Profile Hero */}
        <div className="profile-hero">
          <div className="profile-hero-avatar">
            {student?.name?.charAt(0)?.toUpperCase() || "S"}
          </div>
          <div className="profile-hero-info">
            <h1 className="page-title">{student?.name || user.email}</h1>
            <p className="page-subtitle">
              {student?.rollNumber} · {student?.branch} · {student?.yearOfPassing}
            </p>
          </div>
          <div className="profile-hero-cgpa">
            <span className="profile-cgpa-value">{student?.cgpa ?? "—"}</span>
            <span className="profile-cgpa-label">CGPA</span>
          </div>
        </div>
      </div>

      <div className="page-grid grid-2 mb-lg">
        {/* Academic Info Card */}
        <div className="card animate-fade-in delay-1">
          <div className="card-header">
            <h3 className="card-title">🎓 Academic Info</h3>
          </div>
          <div className="profile-info-grid">
            {academicFields.map((f) => (
              <InfoItem key={f.label} label={f.label} value={f.value ?? "—"} />
            ))}
          </div>
        </div>

        {/* Additional Details / Edit Card */}
        <div className="card animate-fade-in delay-2">
          <div className="card-header">
            <h3 className="card-title">💼 Additional Details</h3>
            {!editing && (
              <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
                ✎ Edit
              </button>
            )}
          </div>

          {editing ? (
            <div className="flex flex-col gap-md">
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input type="text" name="phone" className="form-input" value={form.phone} onChange={handleChange} placeholder="Your phone number" />
              </div>
              <div className="form-group">
                <label className="form-label">Skills</label>
                <input type="text" name="skills" className="form-input" value={form.skills} onChange={handleChange} placeholder="Java, React, Python..." />
              </div>
              <div className="form-group">
                <label className="form-label">Internship Details</label>
                <textarea name="internshipDetails" className="form-textarea" value={form.internshipDetails} onChange={handleChange} placeholder="Describe your internships..." />
              </div>
              <div className="form-group">
                <label className="form-label">Certification Score</label>
                <input type="number" name="certificationScore" className="form-input" value={form.certificationScore} onChange={handleChange} min={0} />
              </div>
              <div className="flex gap-sm">
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button className="btn btn-secondary" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-info-grid">
              {profileFields.map((f) => (
                <InfoItem key={f.label} label={f.label} value={f.value} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Resume Upload */}
      <div className="card animate-fade-in delay-3">
        <div className="card-header">
          <h3 className="card-title">📄 Resume</h3>
          {student?.profile?.resumePath && (
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <span className="badge badge-success">Uploaded</span>
              <button
                type="button"
                className="btn btn-sm btn-secondary"
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
              >
                👁️ View Resume
              </button>
            </div>
          )}
        </div>
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "var(--space-md)" }}>
          Upload your latest resume (PDF, DOC, or DOCX). Max 5 MB.
        </p>
        <label className="resume-upload-area">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleResumeUpload}
            style={{ display: "none" }}
            disabled={uploading}
          />
          <div className="resume-upload-content">
            <span className="resume-upload-icon">{uploading ? "⏳" : "📎"}</span>
            <span className="resume-upload-text">
              {uploading ? "Uploading..." : "Click to upload or drag & drop"}
            </span>
            <span className="resume-upload-hint">PDF, DOC, DOCX</span>
          </div>
        </label>
      </div>

      <style>{`
        .profile-hero {
          display: flex;
          align-items: center;
          gap: var(--space-lg);
          margin-bottom: var(--space-lg);
          padding: var(--space-lg);
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          backdrop-filter: blur(var(--glass-blur));
        }
        .profile-hero-avatar {
          width: 64px; height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent), #a78bfa);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.8rem; font-weight: 700; color: #fff;
          flex-shrink: 0;
          box-shadow: 0 4px 16px var(--accent-glow);
        }
        .profile-hero-info { flex: 1; }
        .profile-hero-info .page-title { font-size: 1.4rem; margin-bottom: 4px; }
        .profile-hero-info .page-subtitle { margin: 0; }
        .profile-hero-cgpa {
          display: flex; flex-direction: column; align-items: center;
          padding: var(--space-md) var(--space-lg);
          border-left: 1px solid var(--border);
        }
        .profile-cgpa-value { font-size: 2rem; font-weight: 800; color: var(--accent); line-height: 1; }
        .profile-cgpa-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); font-weight: 600; }
        .profile-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .info-item { display: flex; flex-direction: column; gap: 2px; }
        .info-item-label { font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
        .info-item-value { font-size: 0.92rem; color: var(--text-primary); font-weight: 500; word-break: break-word; }
        .resume-upload-area {
          display: block;
          border: 2px dashed var(--border-hover);
          border-radius: var(--radius-lg);
          padding: var(--space-xl);
          cursor: pointer;
          transition: all var(--transition-base);
          text-align: center;
        }
        .resume-upload-area:hover {
          border-color: var(--accent);
          background: var(--accent-subtle);
        }
        .resume-upload-content { display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .resume-upload-icon { font-size: 2rem; }
        .resume-upload-text { font-size: 0.9rem; color: var(--text-primary); font-weight: 500; }
        .resume-upload-hint { font-size: 0.78rem; color: var(--text-muted); }
        @media (max-width: 640px) {
          .profile-info-grid { grid-template-columns: 1fr; }
          .profile-hero { flex-wrap: wrap; }
          .profile-hero-cgpa { border-left: none; border-top: 1px solid var(--border); padding-top: var(--space-md); width: 100%; flex-direction: row; gap: var(--space-sm); align-items: baseline; }
        }
      `}</style>
    </DashboardLayout>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="info-item">
      <span className="info-item-label">{label}</span>
      <span className="info-item-value">{String(value)}</span>
    </div>
  );
}
