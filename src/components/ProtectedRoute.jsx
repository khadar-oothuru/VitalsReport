import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, requiredRole }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const userData = localStorage.getItem("user");
      if (!userData) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const user = JSON.parse(userData);
        if (requiredRole && user.role !== requiredRole) {
          // Redirect to appropriate page based on role
          if (user.role === "admin") {
            navigate("/tables", { replace: true });
          } else if (user.role === "provider") {
            navigate("/comprehensive-medical-profile", { replace: true });
          } else {
            navigate("/login", { replace: true });
          }
          return;
        }
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, requiredRole, location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : null;
};

export default ProtectedRoute;
