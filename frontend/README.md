# HireVo — Frontend Client (React 19 + Vite)

The modern, responsive web application for **HireVo** built with React 19, Vite, React Router 7, and Axios.

## 🚀 Features

- **Modern Responsive Design**: Glassmorphism navbar, ambient glow effects, high-contrast accessible typography, and tailored micro-animations.
- **Home & Landing Experience**: Interactive hero section, live drive simulator, role-based portal switchers (Students, Companies, University T&P), and interactive FAQs.
- **Role-Based Portals**:
  - **Student**: Dashboard, upcoming drives with auto-qualification tags, application history, profile editor, and authenticated PDF resume viewer.
  - **Company**: Recruitment drive monitor, candidate applicant review cards, status pipeline updater.
  - **Admin**: Executive placement metrics, student directory, company approval panel, drive scheduler, and automated eligibility rule manager.
- **Real-Time SSE Alerts**: Native Server-Sent Events listener in `DashboardLayout.jsx` displaying live toast notifications on shortlists and new drives.
- **Zero 404 Routing**: Configured with `vercel.json` SPA rewrites for seamless client-side routing on Vercel.

---

## 🛠️ Tech Stack

- **Framework**: React 19.2
- **Build Tool**: Vite 8.0
- **Routing**: React Router 7.18
- **HTTP Client**: Axios 1.18 (configured with automatic JWT header attachment & 401 redirect interceptors)
- **Styling**: Vanilla CSS (Custom Design System tokens, glassmorphism, responsive media queries)

---

## 💻 Local Setup & Development

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment (Optional)
By default, the frontend connects to the local Tomcat backend at `http://localhost:8080/spms`. To point to a custom or production API, create a `.env` file in `frontend/`:
```env
VITE_API_BASE_URL=http://localhost:8080/spms
```

### 3. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### 4. Build for Production
```bash
npm run build
```
Production assets are generated in `frontend/dist/`.

---

## ☁️ Deployment on Vercel

1. Link your GitHub repository in the [Vercel Dashboard](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Add the production environment variable:
   - `VITE_API_BASE_URL` = `https://hirevo.onrender.com/spms` (or your Render backend URL)
4. The `vercel.json` configuration will automatically route all SPA requests to `/index.html`.
