# 🚀 HireVo — Smart Campus Placement Management Platform

[![Java](https://img.shields.io/badge/Java-17%2B-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Spring Framework](https://img.shields.io/badge/Spring_MVC-6.1-6DB33F?style=for-the-badge&logo=spring&logoColor=white)](https://spring.io/)
[![Spring Security](https://img.shields.io/badge/Spring_Security-6.x-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white)](https://spring.io/projects/spring-security)
[![Hibernate](https://img.shields.io/badge/Hibernate_ORM-6.6-59666C?style=for-the-badge&logo=hibernate&logoColor=white)](https://hibernate.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.4-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)

**HireVo** is an enterprise-grade, high-concurrency placement management and career orchestration platform. Designed for modern universities, HireVo replaces fragmented spreadsheets and manual screening with a unified, real-time ecosystem connecting **Students**, **Corporate Recruiters**, and **Training & Placement (T&P) Officers**.

---

## 🌐 Live Deployments

- **Frontend Client (Vercel)**: [https://hirevo-prasad.vercel.app](https://hirevo-prasad.vercel.app)
- **Backend API (Render)**: [https://smart-placement-management-system-7eh7.onrender.com](https://smart-placement-management-system-7eh7.onrender.com)
- **Local Client**: `http://localhost:5173`
- **Local Server**: `http://localhost:8080/spms`

---

## 🏛️ System Architecture

HireVo is built as a decoupled full-stack architecture optimized for high concurrent traffic during high-stakes campus recruitment drives:

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                           │
│  React 19 + Vite (SPA) • Axios Interceptors • Native SSE    │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON / Text-Event-Stream
┌──────────────────────────────▼──────────────────────────────┐
│                    Security & API Gateway                   │
│   JwtAuthFilter • SecurityFilterChain • GlobalExceptionHandler│
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    Core Business Services                   │
│  • DriveService         • EligibilityService (Rule Engine)  │
│  • AutoShortlistService • NotificationService (Real-Time SSE│
│  • AnalyticsService     • StudentProfileService             │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│               Data Access & Performance Layer               │
│  HikariCP Connection Pool • Spring Data JPA • MySQL 8.x     │
└─────────────────────────────────────────────────────────────┘
```

---

## 👥 Core Modules & User Roles

### 🎓 1. Student Portal
- **Profile & Resume Management**: Update academic credentials, CGPA, branch, backlogs, skills, and upload verified PDF resumes (with in-browser preview via authenticated blob streaming).
- **Drive Discovery & Eligibility**: View active campus drives with automated visual indicators showing real-time eligibility qualification.
- **One-Click Application**: Apply to qualifying drives with transactional duplicate prevention.
- **Application Tracking**: Monitor progress through assessments, technical interviews, and HR rounds.
- **Live Notifications**: Instant push alerts on shortlist status changes via native Server-Sent Events (SSE).

### 🏢 2. Corporate Recruiter Portal
- **Drive & Role Configuration**: Announce recruitment drives specifying job roles, CTC packages (LPA), test dates, venues, and deadlines.
- **Custom Eligibility Criteria**: Define minimum CGPA cutoffs, eligible branches, backlog restrictions, and required skill tags.
- **Applicant Pipeline Management**: Review applicant resumes, filter candidates, and update milestones (`APPLIED` ➔ `SHORTLISTED` ➔ `SELECTED` / `REJECTED`).
- **Real-Time Candidate Review**: Direct access to candidate profiles and verified resumes.

### 🏛️ 3. University T&P Cell (Admin Portal)
- **Executive Analytics Dashboard**: Real-time institutional KPIs including total students placed, overall placement rate (%), highest CTC offered, and pending applicants.
- **Company & Drive Governance**: Approve or reject corporate registration requests and manage active campus recruitment schedules.
- **Automated Shortlisting Engine**: Execute batch eligibility evaluations across thousands of candidates in sub-second transactional queries.
- **Central Student Directory**: Audit student records, verified academic histories, and placement progress.

---

## 🛡️ Security & Hardening Features

| Security Feature | Implementation Detail |
| :--- | :--- |
| **Authentication** | Stateless cryptographic JSON Web Tokens (`jjwt 0.12.6`) signed with HMAC-SHA384/512. |
| **Password Security** | All passwords hashed using `BCryptPasswordEncoder` (strength 10). Zero plaintext storage. |
| **Role-Based Access Control (RBAC)** | Granular Spring Security filter chains enforcing `ROLE_STUDENT`, `ROLE_COMPANY`, and `ROLE_ADMIN`. |
| **IDOR Protection** | Resource ownership validations in controllers ensure students cannot view, modify, or apply on behalf of other student IDs. |
| **Zero Hardcoded Secrets** | Database credentials, JWT signing keys, and admin passwords load dynamically from environment variables (`DB_URL`, `DB_PASSWORD`, `JWT_SECRET`, etc.). |
| **Safe File Uploads** | Strict file type validation (PDF only), size limits (2MB file / 4MB request), sanitized UUID filenames, and traversal-safe storage directories. |
| **CORS Policy** | Scoped origin pattern matching with credential support for secure cross-domain requests between Vercel and Render. |

---

## ⚡ High-Performance Optimizations

1. **HikariCP Connection Pooling**:
   - Upgraded from basic `DriverManagerDataSource` to `HikariDataSource` configured for sub-10ms connection checkouts.
   - MySQL statement cache enabled (`cachePrepStmts=true`, `prepStmtCacheSize=250`, `prepStmtCacheSqlLimit=2048`).
2. **SQL Aggregations (Zero N+1 In-Memory Bottlenecks)**:
   - Replaced in-memory Java Stream filtering with native SQL aggregation queries (`COUNT`, `MAX`, `DISTINCT`) in repositories.
3. **Batch Auto-Shortlisting**:
   - Candidate screening executes in transactional batches (`hibernate.jdbc.batch_size=25`, `order_inserts=true`) with pre-fetched student sets.
4. **Real-Time Server-Sent Events (SSE)**:
   - Asynchronous `SseEmitter` delivers instant updates to connected clients without polling overhead.

---

## 📋 Comprehensive API Specification

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Unified login for Students, Companies, and Admins. Returns JWT token, role, and ID. |

### 🎓 Students & Profiles (`/api/students`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/students/register` | Public | Student registration with academic metrics. |
| `GET` | `/api/students` | `ROLE_ADMIN` | List all registered students (directory restricted). |
| `GET` | `/api/students/{id}` | Student / Staff | Get student details by ID (IDOR protected). |
| `PUT` | `/api/students/{id}` | Student / Admin | Update student profile details. |
| `POST` | `/api/students/{id}/resume` | Student / Admin | Upload verified PDF resume (max 2MB). |
| `GET` | `/api/students/{id}/resume` | Student / Staff | Stream resume PDF inline (supports Bearer token & `?token=`). |
| `PUT` | `/api/students/{id}/profile`| Student / Admin | Update technical skills, internship records, and certifications. |
| `GET` | `/api/students/{id}/profile`| Student / Staff | Retrieve structured student profile. |

### 🏢 Companies (`/api/companies`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/companies/register` | Public | Corporate recruiter registration. |
| `GET` | `/api/companies` | Authenticated | List all registered companies. |
| `GET` | `/api/companies/{id}` | Authenticated | Get company details by ID. |
| `PUT` | `/api/companies/{id}/approve` | `ROLE_ADMIN` | Approve company for campus recruitment. |
| `PUT` | `/api/companies/{id}/reject` | `ROLE_ADMIN` | Reject company registration. |

### 🚀 Placement Drives (`/api/drives`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/drives` | `ROLE_ADMIN` | Schedule a new placement drive. |
| `GET` | `/api/drives` | Authenticated | List all placement drives. |
| `GET` | `/api/drives/upcoming` | Authenticated | List active and upcoming placement drives. |
| `GET` | `/api/drives/{id}` | Authenticated | Get drive details by ID. |
| `PUT` | `/api/drives/{id}/status` | `ROLE_ADMIN` | Update drive status (`UPCOMING`, `ONGOING`, `COMPLETED`, `CANCELLED`). |

### 🎯 Eligibility & Auto-Shortlisting (`/api/eligibility`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/eligibility/check` | Authenticated | Verify single student qualification against company rules. |
| `POST` | `/api/eligibility/shortlist/{driveId}` | `ROLE_ADMIN` | Execute batch auto-shortlist engine for a drive. |
| `GET` | `/api/eligibility/shortlisted/{driveId}` | Authenticated | Retrieve shortlisted candidates for a drive. |

### 📝 Applications (`/api/applications`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/applications/apply` | `ROLE_STUDENT` | Submit drive application (validates eligibility & duplicate check). |
| `GET` | `/api/applications/student/{studentId}` | Student / Staff | Get application history for a student. |
| `GET` | `/api/applications/drive/{driveId}` | Company / Admin | Retrieve all applicant applications for a drive. |
| `PUT` | `/api/applications/{id}/status` | Company / Admin | Advance applicant milestone (`APPLIED`, `SHORTLISTED`, `SELECTED`, `REJECTED`). |

### 🔔 Real-Time Notifications (`/api/notifications`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications/subscribe` | Authenticated | Subscribe to live SSE stream for instant notifications. |

### 📊 Analytics & Health (`/api`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/ping` | Public | System health check and uptime monitor. |
| `GET` | `/api/admin/dashboard` | `ROLE_ADMIN` | Fetch placement statistics (placed count, %, highest CTC, etc.). |

---

## 💻 Local Development Setup

### Prerequisites
- **Java Development Kit (JDK)**: Version 17 or higher
- **Node.js**: Version 18 or higher (with npm)
- **MySQL Server**: Version 8.x
- **Apache Tomcat**: Version 10.1.x (Jakarta EE 10 / Servlet 6.0)
- **Maven**: Version 3.8+

### 1. Database Setup
Launch MySQL and create the database:
```sql
CREATE DATABASE spms_db;
```
Import the schema:
```bash
mysql -u root -p spms_db < src/main/resources/schema.sql
```

### 2. Local Environment Configuration
To keep credentials secure and outside git, configure Tomcat's environment via `setenv.sh` (or `setenv.bat` on Windows) in your Tomcat `bin/` directory:
```bash
# /path/to/tomcat/bin/setenv.sh
export DB_URL="jdbc:mysql://localhost:3306/spms_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true"
export DB_USERNAME="root"
export DB_PASSWORD="your_local_mysql_password"
export JWT_SECRET="your_secure_32_character_jwt_secret_key!"
```
Make executable:
```bash
chmod +x /path/to/tomcat/bin/setenv.sh
```

### 3. Build & Run Backend
Compile and package the WAR file:
```bash
mvn clean package -DskipTests
```
Deploy to Tomcat:
```bash
cp target/spms.war /path/to/tomcat/webapps/spms.war
/path/to/tomcat/bin/catalina.sh run
```
Verify backend health:
```bash
curl http://localhost:8080/spms/api/ping
# Response: "SPMS backend is running!"
```

### 4. Build & Run Frontend
Navigate to the frontend directory:
```bash
cd frontend
npm install
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## ☁️ Production Deployment Guide

### 1. Frontend on Vercel
1. Push your repository to GitHub.
2. Link the repository on [Vercel](https://vercel.com).
3. Set **Root Directory** to `frontend`.
4. Add the following **Environment Variable**:
   - `VITE_API_BASE_URL` = `https://hirevo.onrender.com/spms` (or your backend URL)
5. Vercel automatically detects Vite and applies the single-page application (SPA) rewrite rules from `frontend/vercel.json`.

### 2. Backend on Render
1. Create a **Web Service** on [Render](https://render.com).
2. Connect your GitHub repository.
3. Configure the **Environment Variables** in the Render Dashboard:
   | Variable | Value Description |
   | :--- | :--- |
   | `DB_URL` | JDBC URL for your cloud MySQL (e.g. Aiven, TiDB, Clever Cloud, or Supabase). |
   | `DB_USERNAME` | Cloud MySQL username. |
   | `DB_PASSWORD` | Cloud MySQL password. |
   | `JWT_SECRET` | 32+ character random secret string for JWT cryptographic signing. |
   | `INITIAL_ADMIN_EMAIL` | Admin email (e.g., `admin@yourcollege.edu`). |
   | `INITIAL_ADMIN_PASSWORD` | Secure initial administrator password. |
   | `UPLOAD_DIR` | Optional custom upload path (defaults to user home directory). |
4. Deploy the WAR package using a Tomcat Dockerfile or Render Web Service container.
5. Uptime monitoring: Render ping endpoint is available at `/api/ping` without authentication.

---

## 🔍 Pre-Deployment Safety & Verification Checklist

- [x] **Zero Hardcoded Passwords**: All local passwords removed from `HibernateConfig.java` and `DataInitializer.java`.
- [x] **JWT Statelessness**: Tokens securely parsed from headers and query parameters without server session state.
- [x] **IDOR Protected**: Controllers strictly enforce identity checks against authenticated tokens.
- [x] **Role Authorization**: Endpoints for shortlisting, student directories, company approvals, and drives restricted to `ROLE_ADMIN`.
- [x] **HikariCP Pooled**: Connection limits and prepared statement caching prevent database exhaustion.
- [x] **CORS Safe**: Scoped origin rules permit Vercel and local origins with credentials enabled.
- [x] **Resume Streaming**: Configured `ByteArrayHttpMessageConverter` for PDF and document streaming.
- [x] **SPA Routing**: `vercel.json` rewrite rules eliminate 404 errors on browser page refreshes.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
