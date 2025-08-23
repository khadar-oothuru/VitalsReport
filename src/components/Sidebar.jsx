import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  FiUsers,
  FiFileText,
  FiTrendingUp,
  FiDatabase,
  FiMenu,
  FiX,
} from "react-icons/fi";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Navigation items based on user role
  const getNavigationItems = () => {
    if (!user) return [];

    if (user.role === "admin") {
      // Admin sees everything except Home
      return [
        { to: "/tables", label: "Tables", icon: FiDatabase },
        {
          to: "/comprehensive-medical-profile",
          label: "Medical Profile",
          icon: FiUsers,
        },
        {
          to: "/consultation-report",
          label: "Consultation Report",
          icon: FiFileText,
        },
        {
          to: "/business-insights",
          label: "Business Insights",
          icon: FiTrendingUp,
        },
      ];
    } else if (user.role === "provider") {
      // Provider sees limited options except Home
      return [
        {
          to: "/comprehensive-medical-profile",
          label: "Medical Profile",
          icon: FiUsers,
        },
        {
          to: "/business-insights",
          label: "Business Insights",
          icon: FiTrendingUp,
        },
      ];
    }

    return [];
  };

  const navigationItems = getNavigationItems();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-20 left-4 z-50 p-2 bg-teal-700 text-white rounded-md md:hidden"
      >
        {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-teal-700 text-white z-30 transition-transform duration-300 ease-in-out overflow-hidden border-t border-white border-b border-white ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:relative md:top-0 md:h-full md:z-auto md:overflow-hidden`}
      >
        <div className="flex flex-col h-full w-64">
          {/* Navigation items - fixed height, no scroll, no overflow */}
          <div className="flex-1 p-4 overflow-y-auto">
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-white text-teal-700 shadow-lg"
                          : "text-white hover:bg-white hover:text-teal-700"
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* User info at bottom - always visible, no scroll */}
          {user && (
            <div className="p-4 border-t border-teal-600 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-teal-700">
                    {user.username?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user.role === "admin" ? "Admin" : "Dr."} {user.username}
                  </p>
                  <p className="text-xs text-teal-200 capitalize">
                    {user.role}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
