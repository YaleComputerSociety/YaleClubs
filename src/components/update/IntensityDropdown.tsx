import React, { useState, useRef, useEffect } from "react";
import { IClubInput, Intensity } from "@/lib/models/Club";

interface IntensityDropdownProps {
  selectedIntensity: Intensity;
  handleChange: (field: keyof IClubInput, value: string | Intensity | undefined) => void;
}

const IntensityDropdown: React.FC<IntensityDropdownProps> = ({ selectedIntensity, handleChange }) => {
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
        Intensity
        <div
          onClick={() => setIsDropdownOpen((prev) => !prev)}
          className="border border-gray-300 rounded-lg px-4 py-2 cursor-pointer bg-white"
        >
          {selectedIntensity ? (
            <span>{selectedIntensity}</span>
          ) : (
            <span className="text-gray-400">Select intensity</span>
          )}
        </div>
      </label>

      {isDropdownOpen && (
        <div className="absolute mt-1 max-h-60 w-full overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg z-10">
          {Object.values(Intensity).map((intensity) => (
            <div
              key={intensity}
              className={`cursor-pointer px-4 py-2 hover:bg-gray-200`}
              onClick={() => {
                handleChange("intensity", intensity);
                setIsDropdownOpen(false);
              }}
            >
              {intensity}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IntensityDropdown;
