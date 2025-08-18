import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import vitalsLogoWhite from "../assets/vitalsLogowhite.png";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b border-gray-200 shadow-lg transition-colors duration-300 ${
        scrolled ? "bg-teal-600" : "bg-teal-800"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 py-2 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-3 hover:scale-105 transition-transform duration-200"
        >
          <div className="w-15 h-15">
            <img
              src={vitalsLogoWhite}
              alt="Vitals 7 Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          <NavLink
            to="/tables"
            className={({ isActive }) =>
              `px-6 py-2 mx-1 rounded-full text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-white text-teal-800 shadow-md"
                  : "text-white hover:bg-teal-700 hover:text-white border border-white"
              }`
            }
          >
            Tables
          </NavLink>
          <NavLink
            to="/comprehensive-medical-profile"
            className={({ isActive }) =>
              `px-6 py-2 mx-1 rounded-full text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-white text-teal-800 shadow-md"
                  : "text-white hover:bg-teal-700 hover:text-white border border-white"
              }`
            }
          >
            Comprehensive Medical Profile
          </NavLink>
          <NavLink
            to="/consultation-report"
            className={({ isActive }) =>
              `px-6 py-2 mx-1 rounded-full text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-white text-teal-800 shadow-md"
                  : "text-white hover:bg-teal-700 hover:text-white border border-white"
              }`
            }
          >
            Consultation Report
          </NavLink>
          <NavLink
            to="/business-insights"
            className={({ isActive }) =>
              `px-6 py-2 mx-1 rounded-full text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-white text-teal-800 shadow-md"
                  : "text-white hover:bg-teal-700 hover:text-white border border-white"
              }`
            }
          >
            Business Insights
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
