import React from "react";
import { Link, useLocation } from "react-router-dom";
import vitalsLogoWhite from "../assets/vitalsLogowhite.png";

const Navbar = () => {
  const location = useLocation();

  // Get current page name for display
  const getCurrentPageName = () => {
    const path = location.pathname;
    switch (path) {
      case "/":
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
        return "Dashboard";
    }
  };

  // Get role-specific dashboard title
  const getDashboardTitle = () => "Dashboard";

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
              <span className="text-teal-200 text-sm font-medium">
                {getDashboardTitle()}
              </span>
            </div>
          </div>

          {/* Current Page Name */}
          <div className="hidden md:block ml-4">
            <span className="text-white text-lg font-semibold">
              {getCurrentPageName()}
            </span>
          </div>
        </div>

        {/* Authentication Section */}
        {/* Placeholder right section (removed auth controls) */}
        <div className="flex items-center gap-3" />
      </div>
    </header>
  );
};

export default Navbar;
