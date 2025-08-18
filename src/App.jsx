import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Tables from "./pages/Tables.jsx";
import ComprehensiveMedicalProfile from "./pages/ComprehensiveMedicalProfile.jsx";
import ConsultationReport from "./pages/ConsultationReport.jsx";
import BusinessInsights from "./pages/BusinessInsights.jsx";
import "./App.css";

const App = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1 pt-20">
        <Routes>
          <Route path="/" element={<Tables />} />
          <Route path="/tables" element={<Tables />} />
          <Route
            path="/comprehensive-medical-profile"
            element={<ComprehensiveMedicalProfile />}
          />
          <Route path="/consultation-report" element={<ConsultationReport />} />
          <Route path="/business-insights" element={<BusinessInsights />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
