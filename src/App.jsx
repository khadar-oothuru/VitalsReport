import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./components/DashboardLayout.jsx";
import Tables from "./pages/Tables.jsx";
import ComprehensiveMedicalProfile from "./pages/ComprehensiveMedicalProfile.jsx";
import ConsultationReport from "./pages/ConsultationReport.jsx";
import BusinessInsights from "./pages/BusinessInsights.jsx";
import ProviderAppointmentManagement from "./pages/ProviderAppointmentManagement.jsx";
import ProviderPatientProfile from "./pages/ProviderPatientProfile.jsx";
import ProviderVitalMonitoring from "./pages/ProviderVitalMonitoring.jsx";
import ProviderPatientDashboard from "./pages/ProviderPatientDashboard.jsx";
import DataGeneration from "./pages/DataGeneration.jsx";
import "./App.css";

const App = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-cyan-50 text-slate-900">
      <Routes>
        {/* Redirect root to main tables view */}
        <Route path="/" element={<Navigate to="/tables" replace />} />

        <Route
          path="/tables"
          element={
            <DashboardLayout>
              <Tables />
            </DashboardLayout>
          }
        />
        <Route
          path="/comprehensive-medical-profile"
          element={
            <DashboardLayout>
              <ComprehensiveMedicalProfile />
            </DashboardLayout>
          }
        />
        <Route
          path="/consultation-report"
          element={
            <DashboardLayout>
              <ConsultationReport />
            </DashboardLayout>
          }
        />
        <Route
          path="/business-insights"
          element={
            <DashboardLayout>
              <BusinessInsights />
            </DashboardLayout>
          }
        />
        <Route
          path="/provider-appointment-management"
          element={
            <DashboardLayout>
              <ProviderAppointmentManagement />
            </DashboardLayout>
          }
        />
        <Route
          path="/provider-patient-profile"
          element={
            <DashboardLayout>
              <ProviderPatientProfile />
            </DashboardLayout>
          }
        />
        <Route
          path="/provider-vital-monitoring"
          element={
            <DashboardLayout>
              <ProviderVitalMonitoring />
            </DashboardLayout>
          }
        />
        <Route
          path="/provider-patient-dashboard"
          element={
            <DashboardLayout>
              <ProviderPatientDashboard />
            </DashboardLayout>
          }
        />
        <Route
          path="/data-generation"
          element={
            <DashboardLayout>
              <DataGeneration />
            </DashboardLayout>
          }
        />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/tables" replace />} />
      </Routes>
    </div>
  );
};

export default App;
