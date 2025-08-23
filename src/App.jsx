import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Login from "./components/Login.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import DashboardLayout from "./components/DashboardLayout.jsx";
import Home from "./pages/Home.jsx";
import Tables from "./pages/Tables.jsx";
import ComprehensiveMedicalProfile from "./pages/ComprehensiveMedicalProfile.jsx";
import ConsultationReport from "./pages/ConsultationReport.jsx";
import BusinessInsights from "./pages/BusinessInsights.jsx";
import "./App.css";

// Component to check if user has admin role
const AdminOnly = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (user.role !== "admin") {
    return <Navigate to="/comprehensive-medical-profile" replace />;
  }
  return children;
};

const App = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-cyan-50 text-slate-900">
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes with navbar and footer */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <main className="flex-1 pt-20">
                  <Home />
                </main>
                <Footer />
              </>
            </ProtectedRoute>
          }
        />

        {/* Dashboard routes with sidebar layout */}
        <Route
          path="/tables"
          element={
            <ProtectedRoute>
              <AdminOnly>
                <DashboardLayout>
                  <Tables />
                </DashboardLayout>
              </AdminOnly>
            </ProtectedRoute>
          }
        />

        <Route
          path="/comprehensive-medical-profile"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ComprehensiveMedicalProfile />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/consultation-report"
          element={
            <ProtectedRoute>
              <AdminOnly>
                <DashboardLayout>
                  <ConsultationReport />
                </DashboardLayout>
              </AdminOnly>
            </ProtectedRoute>
          }
        />

        <Route
          path="/business-insights"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <BusinessInsights />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
};

export default App;
