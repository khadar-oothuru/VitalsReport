import React from "react";

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 bg-teal-800 shadow-lg mt-auto">
      <div className="mx-auto max-w-7xl px-6 py-6 text-sm text-white flex items-center justify-between">
        <p>&copy; {new Date().getFullYear()} Vitals 7. All rights reserved.</p>
        <div className="flex gap-6">
          <button
            className="hover:text-teal-200 transition-colors duration-200 font-medium text-white bg-transparent border-none cursor-pointer"
            onClick={() => console.log("Privacy Policy clicked")}
          >
            Privacy Policy
          </button>
          <button
            className="hover:text-teal-200 transition-colors duration-200 font-medium text-white bg-transparent border-none cursor-pointer"
            onClick={() => console.log("Terms of Service clicked")}
          >
            Terms of Service
          </button>
          <button
            className="hover:text-teal-200 transition-colors duration-200 font-medium text-white bg-transparent border-none cursor-pointer"
            onClick={() => console.log("Contact Us clicked")}
          >
            Contact Us
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
