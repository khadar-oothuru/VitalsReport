import React from "react";
import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <Navbar />

      {/* Main layout with fixed sidebar and scrollable content */}
      <div className="flex pt-16">
        {/* Sidebar - fixed width, completely non-scrollable */}
        <div className="hidden md:block w-64 flex-shrink-0 sticky top-16 h-[calc(100vh-4rem)]">
          <Sidebar />
        </div>

        {/* Main content area - only this scrolls */}
        <div className="flex-1 min-w-0">
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
