import React, { useState, useRef, useEffect } from "react";
import { IClub } from "@/lib/models/Club";
import { Affiliation } from "@/lib/models/Club";

interface AffiliationFilterButtonProps {
  setFilteredGroups: React.Dispatch<React.SetStateAction<IClub[]>>;
  selectedAffiliations: string[];
  setSelectedAffiliations: React.Dispatch<React.SetStateAction<string[]>>;
}

const AffiliationFilterButton = ({ selectedAffiliations, setSelectedAffiliations }: AffiliationFilterButtonProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const affiliations = Object.values(Affiliation);
  // const affiliations = [
  //   "Pre-Professional",
  //   "Entrepreneurial/Business",
  //   "Media/Technology",
  //   "Science/Technology",
  //   "Cultural",
  // ];

  const availableAffiliations = affiliations.filter((affiliation) => !selectedAffiliations.includes(affiliation));

  const handleAddAffiliation = (affiliation: string) => {
    setSelectedAffiliations((prev) => [...prev, affiliation]);
  };

  const handleRemoveAffiliation = (affiliation: string) => {
    setSelectedAffiliations((prev) => prev.filter((cat) => cat !== affiliation));
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
        className="border px-4 py-2 rounded cursor-pointer w-60 max-w-full flex items-center justify-between"
        onClick={() => setShowDropdown((prev) => !prev)}
      >
        <div className="flex items-center overflow-x-auto min-w-0 space-x-2">
          {selectedAffiliations.length > 0 ? (
            selectedAffiliations.map((affiliation) => (
              <div
                key={affiliation}
                className="bg-gray-200 px-2 py-1 rounded-full text-sm flex items-center space-x-1 min-w-[120px] flex-shrink-0 justify-between"
              >
                <span className="truncate">{affiliation}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveAffiliation(affiliation);
                  }}
                  className="text-gray-600 hover:text-gray-800 focus:outline-none"
                >
                  &#x2715;
                </button>
              </div>
            ))
          ) : (
            <span className="text-gray-600">Affiliations</span>
          )}
        </div>
        <span className="ml-2">&#x25BC;</span>
      </div>
      {showDropdown && (
        <div className="absolute mt-2 w-72 max-w-full bg-white border rounded shadow-lg z-10">
          <div className="flex flex-col p-2 gap-2">
            {availableAffiliations.length > 0 ? (
              availableAffiliations.map((affiliation) => (
                <div
                  key={affiliation}
                  className="cursor-pointer hover:bg-gray-100 px-4 py-2 rounded"
                  onClick={() => handleAddAffiliation(affiliation)}
                >
                  {affiliation}
                </div>
              ))
            ) : (
              <div className="text-gray-600 px-4 py-2">No more affiliations available</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AffiliationFilterButton;
