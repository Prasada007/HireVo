import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Home.css";

export default function Home() {
  const { user } = useAuth();
  const [activeRole, setActiveRole] = useState("student");
  const [openFaq, setOpenFaq] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "ADMIN") return "/admin/dashboard";
    if (user.role === "COMPANY") return "/company/dashboard";
    return "/student/dashboard";
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const roleData = {
    student: {
      title: "Built for Ambitious Students",
      desc: "Never miss a campus recruitment deadline again. Get algorithmically matched with companies, submit verified applications with one click, and receive instant interview notifications.",
      ctaText: "Explore Student Portal",
      ctaLink: user ? "/student/dashboard" : "/register",
      points: [
        "Smart Eligibility Filter: Only see drives where your CGPA, branch, and backlog criteria qualify 100%.",
        "Instant One-Click Apply: Zero manual paperwork or repetitive PDF submissions.",
        "Real-Time SSE Alerts: Get live notifications on your phone & laptop the second you get shortlisted.",
        "Verified Academic Profile: Digital portfolio showcasing your projects, ATS resume, and credentials."
      ],
      previewStats: [
        { label: "Active Campus Drives", val: "18 Drives Open" },
        { label: "Eligibility Rate", val: "94% Match" },
        { label: "Average CTC", val: "₹12.4 LPA" }
      ]
    },
    company: {
      title: "Engineered for Agile Recruiters",
      desc: "Source, screen, and interview top university engineers without tedious manual spreadsheet filtering. Define precise eligibility constraints and let our engine handle the rest.",
      ctaText: "Recruiter Access",
      ctaLink: user ? "/company/dashboard" : "/login",
      points: [
        "Instant Drive Setup: Launch campus hiring drives with customized job roles, stipends, and compensation in minutes.",
        "Transactional Auto-Shortlist: Automatically filter and batch-insert 500+ matching applicants in milliseconds.",
        "Live Candidate Pipeline: Track applicants through Online Assessments, Technical Interviews, and HR rounds.",
        "Direct Offer Dispatch: Update candidate statuses in real time with automated notification triggers."
      ],
      previewStats: [
        { label: "Candidate Sourcing Speed", val: "75% Faster" },
        { label: "Manual Effort Saved", val: "100% Automated" },
        { label: "Applicant Quality", val: "Pre-screened" }
      ]
    },
    admin: {
      title: "Command Center for Universities",
      desc: "Empower Training & Placement Officers (TPOs) with complete institutional visibility, automated policy enforcement, and live multi-department analytics.",
      ctaText: "Admin Portal",
      ctaLink: user ? "/admin/dashboard" : "/login",
      points: [
        "Unified Placement Analytics: Live charts showing placement rates, highest/median packages, and department breakdowns.",
        "Configurable Eligibility Policies: Define department rules, maximum offer caps, and backlog restrictions centrally.",
        "Recruiter & Student Governance: Approve recruiter requests and manage verified student databases securely.",
        "Auditable Zero-Trust Architecture: Role-based authorization eliminates unauthorized data tampering."
      ],
      previewStats: [
        { label: "Institutional Placement", val: "98.4% Rate" },
        { label: "Partner Companies", val: "450+ Verified" },
        { label: "Reporting", val: "1-Click PDF/Excel" }
      ]
    }
  };

  const faqs = [
    {
      q: "How does the automated eligibility matching work?",
      a: "When a company announces a placement drive, our backend rule engine evaluates student metrics (current CGPA, branch, graduation year, and active backlogs) in high-speed transactional SQL queries. Only qualified students can apply, preventing ineligible submissions."
    },
    {
      q: "How do students receive real-time notifications?",
      a: "HireVo utilizes modern Server-Sent Events (SSE). Unlike old systems that require manually refreshing the page, your browser maintains a lightweight real-time stream. You get instant toast notifications the moment a drive drops or your application is shortlisted."
    },
    {
      q: "Can recruiters host multi-round drives?",
      a: "Yes. Recruiters and placement admins can structure drives across online assessments, technical rounds, group discussions, and final interviews, updating individual candidate milestones with live status badges."
    },
    {
      q: "Is candidate and university data secure?",
      a: "Absolutely. HireVo utilizes stateless cryptographic JWT authentication, BCrypt password hashing, HikariCP database connection pooling, and strict role-based access control to prevent unauthorized cross-tenant data access."
    }
  ];

  return (
    <div className="home-wrapper">
      {/* Decorative ambient background lights */}
      <div className="home-blob home-blob-1" />
      <div className="home-blob home-blob-2" />
      <div className="home-blob home-blob-3" />

      {/* ═══════════════════════════════════════════════════════════════════
          Header / Navbar
          ═══════════════════════════════════════════════════════════════════ */}
      <header className="home-header">
        <div className="home-container">
          <nav className="home-nav" aria-label="Main Navigation">
            {/* Logo */}
            <Link to="/" className="home-brand">
              <img
                src="/logo_clean.png"
                alt="HireVo Logo"
                className="home-brand-logo"
              />
              <div className="home-brand-text">
                <span className="home-brand-title">HireVo</span>
                <span className="home-brand-tag">Smart Placement System</span>
              </div>
            </Link>

            {/* Nav Links */}
            <ul className="home-nav-links">
              <li><a href="#features" className="home-nav-link">Features</a></li>
              <li><a href="#roles" className="home-nav-link">Portals</a></li>
              <li><a href="#how-it-works" className="home-nav-link">How It Works</a></li>
              <li><a href="#impact" className="home-nav-link">Impact</a></li>
              <li><a href="#faqs" className="home-nav-link">FAQs</a></li>
            </ul>

            {/* Action Buttons */}
            <div className="home-nav-actions">
              {user ? (
                <Link to={getDashboardLink()} className="btn-home-primary">
                  <span>Dashboard ({user.role})</span>
                  <span>→</span>
                </Link>
              ) : (
                <>
                  <Link to="/login" className="btn-home-outline">
                    Sign In
                  </Link>
                  <Link to="/register" className="btn-home-primary">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════════
          Hero Section
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="home-hero">
        <div className="home-container">
          <div className="home-hero-grid">
            <div className="home-hero-content">
              {/* Badge */}
              <div className="home-pill-badge">
                <span className="home-pill-dot" />
                <span>Next-Gen Placement Ecosystem • Live 2026</span>
              </div>

              {/* Title */}
              <h1 className="home-hero-title">
                Bridging Campus Ambition to <span className="home-hero-gradient">Career Opportunity.</span>
              </h1>

              {/* Description */}
              <p className="home-hero-desc">
                HireVo is the unified, intelligent campus placement management platform.
                Streamline corporate recruitment drives, automate student eligibility checks,
                and broadcast real-time interview updates in one unified hub.
              </p>

              {/* CTA Buttons */}
              <div className="home-hero-cta-group">
                {user ? (
                  <Link to={getDashboardLink()} className="btn-hero-primary">
                    <span>Enter Your Dashboard</span>
                    <span>→</span>
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn-hero-primary">
                      <span>Get Started as Student</span>
                      <span>→</span>
                    </Link>
                    <Link to="/login" className="btn-hero-secondary">
                      <span>Recruiter / Admin Sign In</span>
                    </Link>
                  </>
                )}
              </div>

              {/* Live Trust Metrics */}
              <div className="home-hero-trust">
                <div className="home-trust-item">
                  <span className="home-trust-number">98.4%</span>
                  <span className="home-trust-label">Placement Rate</span>
                </div>
                <div className="home-trust-item">
                  <span className="home-trust-number">450+</span>
                  <span className="home-trust-label">Partner Companies</span>
                </div>
                <div className="home-trust-item">
                  <span className="home-trust-number">₹45 LPA</span>
                  <span className="home-trust-label">Highest Package</span>
                </div>
                <div className="home-trust-item">
                  <span className="home-trust-number">&lt;10ms</span>
                  <span className="home-trust-label">Shortlist Engine</span>
                </div>
              </div>
            </div>

            {/* Visual Interactive Mockup Card */}
            <div className="home-hero-visual">
              {/* Floating Pill 1 */}
              <div className="home-float-badge home-float-badge-1">
                <div className="home-float-icon">🎯</div>
                <div className="home-float-text">
                  <h5>Auto-Shortlisted!</h5>
                  <p>Candidate matched Google criteria</p>
                </div>
              </div>

              {/* Floating Pill 2 */}
              <div className="home-float-badge home-float-badge-2">
                <div className="home-float-icon">🔔</div>
                <div className="home-float-text">
                  <h5>Live SSE Alert</h5>
                  <p>Interview scheduled for 2:00 PM</p>
                </div>
              </div>

              {/* Main Interactive Card */}
              <div className="home-mockup-card">
                <div className="home-mockup-header">
                  <div className="home-mockup-company">
                    <div className="home-mockup-icon">G</div>
                    <div className="home-mockup-company-info">
                      <h4>Google Cloud</h4>
                      <p>Software Engineer • On Campus</p>
                    </div>
                  </div>
                  <span className="home-mockup-status-badge">
                    <span className="home-pill-dot" /> Live Active
                  </span>
                </div>

                <div className="home-mockup-details">
                  <div className="home-mockup-metric">
                    <span>Package (CTC)</span>
                    <span>₹28.50 LPA</span>
                  </div>
                  <div className="home-mockup-metric">
                    <span>Target Batch</span>
                    <span>Class of 2026</span>
                  </div>
                  <div className="home-mockup-metric">
                    <span>Min CGPA</span>
                    <span>7.50 / 10.0</span>
                  </div>
                  <div className="home-mockup-metric">
                    <span>Eligible Branches</span>
                    <span>CSE / IT / ECE</span>
                  </div>
                </div>

                <div className="home-mockup-progress-box">
                  <div className="home-mockup-progress-header">
                    <span>Automated Eligibility Match</span>
                    <span style={{ color: "#10b981" }}>94% Qualified</span>
                  </div>
                  <div className="home-mockup-bar">
                    <div className="home-mockup-bar-fill" />
                  </div>
                </div>

                <div className="home-mockup-features">
                  <span className="home-mockup-tag">⚡ 0 Backlog Policy</span>
                  <span className="home-mockup-tag">📄 ATS Resume Verified</span>
                  <span className="home-mockup-tag">🔒 JWT Encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          Interactive Role Portals
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="home-section" id="roles">
        <div className="home-container">
          <div className="home-section-header">
            <span className="home-section-tag">Role-Based Experiences</span>
            <h2 className="home-section-title">Built Purposefully for Every Stakeholder</h2>
            <p className="home-section-desc">
              Whether you are a student preparing for interviews, a recruiter screening thousands of resumes,
              or a university placement dean managing logistics, HireVo gives you superpowers.
            </p>
          </div>

          {/* Role Tabs */}
          <div className="home-role-tabs">
            <button
              className={`home-role-tab ${activeRole === "student" ? "active" : ""}`}
              onClick={() => setActiveRole("student")}
            >
              <span>🎓</span> Students
            </button>
            <button
              className={`home-role-tab ${activeRole === "company" ? "active" : ""}`}
              onClick={() => setActiveRole("company")}
            >
              <span>🏢</span> Recruiters & Companies
            </button>
            <button
              className={`home-role-tab ${activeRole === "admin" ? "active" : ""}`}
              onClick={() => setActiveRole("admin")}
            >
              <span>🏛️</span> University T&P Cell
            </button>
          </div>

          {/* Role Dynamic Content */}
          <div className="home-role-content-box animate-fade-in">
            <div className="home-role-info">
              <h3>{roleData[activeRole].title}</h3>
              <p>{roleData[activeRole].desc}</p>
              <ul className="home-role-list">
                {roleData[activeRole].points.map((pt, idx) => (
                  <li key={idx} className="home-role-list-item">
                    <span className="home-check-icon">✓</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
              <Link to={roleData[activeRole].ctaLink} className="btn-hero-primary" style={{ padding: "12px 24px", fontSize: "0.95rem" }}>
                <span>{roleData[activeRole].ctaText}</span>
                <span>→</span>
              </Link>
            </div>

            <div className="home-role-preview-card">
              <h4 style={{ fontSize: "1.05rem", color: "#1e293b", fontWeight: 700 }}>
                Live Workflow Metrics
              </h4>
              {roleData[activeRole].previewStats.map((item, idx) => (
                <div key={idx} className="home-role-preview-item">
                  <span style={{ fontSize: "0.88rem", color: "#64748b", fontWeight: 500 }}>
                    {item.label}
                  </span>
                  <span style={{ fontSize: "0.95rem", color: "#7c3aed", fontWeight: 700 }}>
                    {item.val}
                  </span>
                </div>
              ))}
              <div style={{ marginTop: "8px", padding: "12px", background: "rgba(124, 58, 237, 0.06)", borderRadius: "10px", fontSize: "0.82rem", color: "#6d28d9" }}>
                💡 <strong>HireVo ProTip:</strong> Real-time synchronization guarantees 0% application drops during high-traffic drive openings.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          Core Features Bento Grid
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="home-section" id="features">
        <div className="home-container">
          <div className="home-section-header">
            <span className="home-section-tag">Key Features</span>
            <h2 className="home-section-title">Engineered for Reliability & Scale</h2>
            <p className="home-section-desc">
              Discover how HireVo eliminates the chaos of campus hiring with cutting-edge architecture.
            </p>
          </div>

          <div className="home-bento-grid">
            <div className="home-bento-card">
              <div className="home-bento-icon-wrap">⚡</div>
              <h4>Automated Shortlisting</h4>
              <p>
                Eliminate hours of manual spreadsheet sorting. Our transactional rule engine cross-references
                department, CGPA, and backlog rules to shortlist eligible candidates in milliseconds.
              </p>
            </div>

            <div className="home-bento-card">
              <div className="home-bento-icon-wrap">🔔</div>
              <h4>Real-Time SSE Alerts</h4>
              <p>
                Native Server-Sent Events push instant notifications to candidates and recruiters
                without manual page refreshes when drive statuses change or shortlists publish.
              </p>
            </div>

            <div className="home-bento-card">
              <div className="home-bento-icon-wrap">🔒</div>
              <h4>Role-Based Zero-Trust Security</h4>
              <p>
                Stateless cryptographic JWT authentication with scoped authorization for Students,
                Companies, and Admins to ensure strict data privacy and eliminate IDOR risks.
              </p>
            </div>

            <div className="home-bento-card">
              <div className="home-bento-icon-wrap">📊</div>
              <h4>Live Placement Intelligence</h4>
              <p>
                Gain immediate insights into average CTC trends, department-wise placement ratios,
                and top hiring companies with optimized database aggregations.
              </p>
            </div>

            <div className="home-bento-card">
              <div className="home-bento-icon-wrap">🚀</div>
              <h4>High-Concurrency HikariCP</h4>
              <p>
                High-performance connection pooling with prepared-statement caching handles
                thousands of concurrent student clicks on high-stakes drive mornings.
              </p>
            </div>

            <div className="home-bento-card">
              <div className="home-bento-icon-wrap">📱</div>
              <h4>Cross-Device Experience</h4>
              <p>
                Carefully crafted responsive layouts ensure students can view shortlists and schedule
                interviews seamlessly whether on desktop, tablet, or smartphone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          How It Works
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="home-section" id="how-it-works">
        <div className="home-container">
          <div className="home-section-header">
            <span className="home-section-tag">Simple 4-Step Journey</span>
            <h2 className="home-section-title">How HireVo Drives Campus Success</h2>
            <p className="home-section-desc">
              From onboarding to offer letter, here is how the ecosystem synchronizes effortlessly.
            </p>
          </div>

          <div className="home-process-grid">
            <div className="home-process-card">
              <span className="home-process-step">1</span>
              <h4>Create Profile</h4>
              <p>
                Students register with verified academic credentials, branch data, CGPA, and resume documents.
              </p>
            </div>

            <div className="home-process-card">
              <span className="home-process-step">2</span>
              <h4>Publish Drives</h4>
              <p>
                Recruiters configure upcoming drives with CTC packages, test dates, venues, and eligibility criteria.
              </p>
            </div>

            <div className="home-process-card">
              <span className="home-process-step">3</span>
              <h4>Automated Match</h4>
              <p>
                The rule engine evaluates applications instantly. Only eligible candidates advance, saving recruiter time.
              </p>
            </div>

            <div className="home-process-card">
              <span className="home-process-step">4</span>
              <h4>Live Selection</h4>
              <p>
                Interviews are conducted, statuses update in real time, and offer notifications land directly in student inboxes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          Impact Strip
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="home-container" id="impact">
        <div className="home-impact-banner">
          <div className="home-impact-metric">
            <h3>15,000+</h3>
            <p>Students Empowered</p>
          </div>
          <div className="home-impact-metric">
            <h3>450+</h3>
            <p>Top Hiring Partners</p>
          </div>
          <div className="home-impact-metric">
            <h3>100%</h3>
            <p>Zero Paperwork Elimination</p>
          </div>
          <div className="home-impact-metric">
            <h3>&lt; 500ms</h3>
            <p>Instant Real-time Dispatch</p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FAQ Accordion
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="home-section" id="faqs">
        <div className="home-container">
          <div className="home-section-header">
            <span className="home-section-tag">Common Questions</span>
            <h2 className="home-section-title">Frequently Asked Questions</h2>
            <p className="home-section-desc">
              Everything you need to know about navigating the HireVo placement platform.
            </p>
          </div>

          <div className="home-faq-list">
            {faqs.map((faq, idx) => (
              <div key={idx} className="home-faq-item">
                <button
                  className="home-faq-question"
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={openFaq === idx}
                >
                  <span>{faq.q}</span>
                  <span style={{ fontSize: "1.2rem", color: "#7c3aed" }}>
                    {openFaq === idx ? "−" : "+"}
                  </span>
                </button>
                {openFaq === idx && (
                  <div className="home-faq-answer animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          Call to Action Banner
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="home-container">
        <div className="home-cta-banner">
          <h2 className="home-cta-title">Ready to Transform Your Campus Hiring?</h2>
          <p className="home-cta-desc">
            Join students, recruiters, and placement officers unlocking modern, stress-free campus recruitments today.
          </p>
          <div className="home-cta-actions">
            {user ? (
              <Link to={getDashboardLink()} className="btn-cta-white">
                Go to Dashboard ({user.role}) →
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-cta-white">
                  Join as Student →
                </Link>
                <Link to="/login" className="btn-cta-ghost">
                  Company / Admin Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          Footer
          ═══════════════════════════════════════════════════════════════════ */}
      <footer className="home-footer">
        <div className="home-container">
          <div className="home-footer-grid">
            <div className="home-footer-brand">
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <img src="/logo_clean.png" alt="HireVo" style={{ height: "46px", width: "auto", objectFit: "contain" }} />
                <span style={{ fontSize: "1.45rem", fontWeight: 850, color: "#1e1b4b" }}>HireVo</span>
              </div>
              <p>
                Intelligent, real-time campus placement management platform connecting students,
                colleges, and top global recruiters seamlessly.
              </p>
              <div className="home-status-pill">
                <span className="home-pill-dot" />
                <span>All Systems Operational (Spring EE + React)</span>
              </div>
            </div>

            <div className="home-footer-col">
              <h5>Students</h5>
              <ul>
                <li><Link to="/login">Student Sign In</Link></li>
                <li><Link to="/register">Student Registration</Link></li>
                <li><a href="#how-it-works">Eligibility Rules</a></li>
                <li><a href="#features">Live Notifications</a></li>
              </ul>
            </div>

            <div className="home-footer-col">
              <h5>Recruiters</h5>
              <ul>
                <li><Link to="/login">Recruiter Portal</Link></li>
                <li><a href="#roles">Post Placement Drives</a></li>
                <li><a href="#features">Auto-Shortlist Engine</a></li>
                <li><a href="#impact">Hiring Metrics</a></li>
              </ul>
            </div>

            <div className="home-footer-col">
              <h5>Platform</h5>
              <ul>
                <li><a href="#features">Core Features</a></li>
                <li><a href="#faqs">Frequently Asked Questions</a></li>
                <li><Link to="/login">Admin Access</Link></li>
                <li><a href="#impact">Placement Analytics</a></li>
              </ul>
            </div>
          </div>

          <div className="home-footer-bottom">
            <span>© {new Date().getFullYear()} HireVo Placement Management System. All rights reserved.</span>
            <span>Empowering Campus Careers Worldwide</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
