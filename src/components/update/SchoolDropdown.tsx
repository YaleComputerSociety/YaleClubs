import React, { useState, useRef, useEffect } from "react";
import { IClubInput, School } from "@/lib/models/Club";

interface SchoolDropdownProps {
  selectedSchool: School;
  handleChange: (field: keyof IClubInput, value: string | School | undefined) => void;
}

const SchoolDropdown: React.FC<SchoolDropdownProps> = ({ selectedSchool, handleChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        School
        <div
          onClick={() => setIsDropdownOpen((prev) => !prev)}
          className="border border-gray-300 rounded-lg px-4 py-2 cursor-pointer bg-white"
        >
          {selectedSchool ? <span>{selectedSchool}</span> : <span className="text-gray-400">Select school</span>}
        </div>
      </label>

      {isDropdownOpen && (
        <div className="absolute mt-1 max-h-60 w-full overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg z-10">
          {Object.values(School).map((school) => (
            <div
              key={school}
              className={`cursor-pointer px-4 py-2 hover:bg-gray-200`}
              onClick={() => {
                handleChange("school", school);
                setIsDropdownOpen(false);
              }}
            >
              {school}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchoolDropdown;
