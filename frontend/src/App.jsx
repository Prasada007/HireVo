import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./components/Toast";
import ErrorBoundary from "./components/ErrorBoundary";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

// Student pages
import StudentDashboard from "./pages/student/StudentDashboard";
import UpcomingDrives from "./pages/student/UpcomingDrives";
import MyApplications from "./pages/student/MyApplications";
import MyProfile from "./pages/student/MyProfile";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageStudents from "./pages/admin/ManageStudents";
import ManageCompanies from "./pages/admin/ManageCompanies";
import ManageDrives from "./pages/admin/ManageDrives";
import CreateDrive from "./pages/admin/CreateDrive";
import EligibilityRules from "./pages/admin/EligibilityRules";

// Company pages
import CompanyDashboard from "./pages/company/CompanyDashboard";
import CompanyDrives from "./pages/company/CompanyDrives";
import DriveApplicants from "./pages/company/DriveApplicants";

function PrivateRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/login" />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  const getDefaultRoute = () => {
    if (!user) return "/login";
    if (user.role === "ADMIN") return "/admin/dashboard";
    if (user.role === "COMPANY") return "/company/dashboard";
    return "/student/dashboard";
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Student Routes */}
      <Route path="/student/dashboard" element={<PrivateRoute role="STUDENT"><StudentDashboard /></PrivateRoute>} />
      <Route path="/student/drives" element={<PrivateRoute role="STUDENT"><UpcomingDrives /></PrivateRoute>} />
      <Route path="/student/applications" element={<PrivateRoute role="STUDENT"><MyApplications /></PrivateRoute>} />
      <Route path="/student/profile" element={<PrivateRoute role="STUDENT"><MyProfile /></PrivateRoute>} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<PrivateRoute role="ADMIN"><AdminDashboard /></PrivateRoute>} />
      <Route path="/admin/students" element={<PrivateRoute role="ADMIN"><ManageStudents /></PrivateRoute>} />
      <Route path="/admin/companies" element={<PrivateRoute role="ADMIN"><ManageCompanies /></PrivateRoute>} />
      <Route path="/admin/drives" element={<PrivateRoute role="ADMIN"><ManageDrives /></PrivateRoute>} />
      <Route path="/admin/create-drive" element={<PrivateRoute role="ADMIN"><CreateDrive /></PrivateRoute>} />
      <Route path="/admin/eligibility" element={<PrivateRoute role="ADMIN"><EligibilityRules /></PrivateRoute>} />

      {/* Company Routes */}
      <Route path="/company/dashboard" element={<PrivateRoute role="COMPANY"><CompanyDashboard /></PrivateRoute>} />
      <Route path="/company/drives" element={<PrivateRoute role="COMPANY"><CompanyDrives /></PrivateRoute>} />
      <Route path="/company/drives/:driveId/applicants" element={<PrivateRoute role="COMPANY"><DriveApplicants /></PrivateRoute>} />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}