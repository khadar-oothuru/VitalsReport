import React, { useState, useRef, useEffect } from "react";
import { HiChevronDown } from "react-icons/hi2";

export default function SmartDropdown({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  className = "",
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState("bottom");
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Calculate dropdown position - always open downward
  const calculatePosition = () => {
    if (!buttonRef.current) return;

    // Always position dropdown below the button
    setDropdownPosition("bottom");
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      calculatePosition();
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, options.length]);

  // Handle scroll to recalculate position
  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) {
        calculatePosition();
      }
    };

    if (isOpen) {
      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleScroll);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleOptionClick = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div
      ref={dropdownRef}
      className={`relative ${className}`}
      style={{ zIndex: isOpen ? 9999 : "auto" }}
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          w-full rounded-lg border border-blue-200 px-3 py-2.5 text-sm text-left
          focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors 
          bg-white text-teal-700 flex items-center justify-between
          ${
            disabled
              ? "opacity-50 cursor-not-allowed"
              : "hover:border-blue-300 cursor-pointer"
          }
          ${isOpen ? "ring-2 ring-teal-500 border-transparent" : ""}
        `}
      >
        <span className={selectedOption ? "" : "text-slate-400"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <HiChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute left-0 right-0 mt-1 bg-white border border-blue-200 rounded-lg shadow-lg max-h-60 overflow-y-auto top-full"
          style={{ zIndex: 9999 }}
        >
          <div className="py-2">
            {options.map((option, index) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleOptionClick(option)}
                className={`
                  w-full text-left px-4 py-2 text-sm transition-colors
                  hover:bg-blue-50 hover:text-teal-700
                  ${
                    option.value === value
                      ? "bg-teal-50 text-teal-700 font-medium"
                      : "text-slate-700"
                  }
                  ${index === 0 ? "rounded-t-md" : ""}
                  ${index === options.length - 1 ? "rounded-b-md" : ""}
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
