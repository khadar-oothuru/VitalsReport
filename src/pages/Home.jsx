import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Get user from localStorage
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    // Redirect based on user role
    if (user.role === "admin") {
      navigate("/tables");
    } else if (user.role === "provider") {
      navigate("/comprehensive-medical-profile");
    }
  }, [navigate]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
};

export default Home;
