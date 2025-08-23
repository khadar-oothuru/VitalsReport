import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import vitalsLogoWhite from "../assets/vitalsLogowhite.png";
import { FiLogOut, FiLogIn, FiUser } from "react-icons/fi";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  // Get current page name for display
  const getCurrentPageName = () => {
    const path = location.pathname;
    switch (path) {
      case "/":
        if (user && user.role) {
          if (user.role === "admin") {
            return "Admin Dashboard";
          } else if (user.role === "provider") {
            return "Provider Dashboard";
          } else if (user.role === "user") {
            return "User Dashboard";
          }
        }
        return "Dashboard";
      case "/tables":
        return "Tables";
      case "/comprehensive-medical-profile":
        return "Medical Profile";
      case "/consultation-report":
        return "Consultation Report";
      case "/business-insights":
        return "Business Insights";
      default:
        if (user && user.role) {
          if (user.role === "admin") {
            return "Admin Dashboard";
          } else if (user.role === "provider") {
            return "Provider Dashboard";
          } else if (user.role === "user") {
            return "User Dashboard";
          }
        }
        return "Dashboard";
    }
  };

  // Get role-specific dashboard title
  const getDashboardTitle = () => {
    if (user && user.role) {
      if (user.role === "admin") {
        return "Admin Dashboard";
      } else if (user.role === "provider") {
        return "Provider Dashboard";
      } else if (user.role === "user") {
        return "User Dashboard";
      }
    }
    return "Dashboard";
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-teal-700">
      <div className="mx-auto max-w-7xl px-2 py-2 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="w-12 h-12">
              <img
                src={vitalsLogoWhite}
                alt="Vitals 7 Logo"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Brand and Page Info */}
            <div className="flex flex-col">
              <Link
                to="/"
                className="text-white text-xl font-bold hover:scale-105 transition-transform duration-200"
              >
                Vitals 7
              </Link>
              {user && (
                <span className="text-teal-200 text-sm font-medium">
                  {getDashboardTitle()}
                </span>
              )}
            </div>
          </div>

          {/* Current Page Name */}
          {user && (
            <div className="hidden md:block ml-4">
              <span className="text-white text-lg font-semibold">
                {getCurrentPageName()}
              </span>
            </div>
          )}
        </div>

        {/* Authentication Section */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-white text-sm flex items-center gap-2 px-3 py-2 border border-white rounded-md">
                <FiUser className="w-4 h-4" />
                {user.role === "admin" ? "Admin" : "Dr."} {user.username}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-semibold text-teal-800 bg-white rounded-md hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors duration-200 flex items-center gap-2 border border-transparent"
              >
                <FiLogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="px-4 py-2 text-sm font-semibold text-teal-800 bg-white rounded-md hover:bg-gray-100 transition-colors duration-200 flex items-center gap-2"
            >
              <FiLogIn className="w-4 h-4" />
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
