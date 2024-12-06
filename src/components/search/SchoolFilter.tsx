import React, { useState, useRef, useEffect } from "react";
import { School } from "@/lib/models/Club";

interface SchoolFilterButtonProps {
  selectedSchools: string[];
  setSelectedSchools: React.Dispatch<React.SetStateAction<string[]>>;
}

const SchoolFilterButton = ({ selectedSchools, setSelectedSchools }: SchoolFilterButtonProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const schools = Object.values(School);

  const availableSchools = schools.filter((school) => !selectedSchools.includes(school));

  const handleAddSchool = (school: string) => {
    setSelectedSchools((prev) => [...prev, school]);
  };

  const handleRemoveSchool = (school: string) => {
    setSelectedSchools((prev) => prev.filter((cat) => cat !== school));
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div ref={dropdownRef} className="relative">
      <div
        className="border px-4 py-2 rounded cursor-pointer w-80 md:w-60 max-w-full flex items-center justify-between h-9 md:h-11"
        onClick={() => setShowDropdown((prev) => !prev)}
      >
        <div className="flex items-center overflow-x-auto min-w-0 space-x-2">
          {selectedSchools.length > 0 ? (
            selectedSchools.map((school) => (
              <div
                key={school}
                className="bg-gray-200 px-2 py-1 rounded-full text-sm flex items-center space-x-1 min-w-[120px] flex-shrink-0 justify-between"
              >
                <span className="truncate">{school}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveSchool(school);
                  }}
                  className="text-gray-600 hover:text-gray-800 focus:outline-none"
                >
                  &#x2715;
                </button>
              </div>
            ))
          ) : (
            <span className="text-gray-600">Schools</span>
          )}
        </div>
        <span className="ml-2">&#x25BC;</span>
      </div>
      {showDropdown && (
        <div className="absolute mt-2 w-72 max-w-full bg-white border rounded shadow-lg z-10">
          <div className="flex flex-col p-2 gap-2 max-h-72 overflow-y-auto">
            {availableSchools.length > 0 ? (
              availableSchools.map((school) => (
                <div
                  key={school}
                  className="cursor-pointer hover:bg-gray-100 px-4 py-2 rounded"
                  onClick={() => handleAddSchool(school)}
                >
                  {school}
                </div>
              ))
            ) : (
              <div className="text-gray-600 px-4 py-2">No more schools available</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolFilterButton;
