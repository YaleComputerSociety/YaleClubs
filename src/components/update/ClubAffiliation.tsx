import { ClubCategory, ClubLeader, IClubInput } from "@/lib/models/Club";
import React, { useState, useRef, useEffect } from "react";

export enum ClubAffiliation {
  COLLEGE = "Yale College",
  LAW = "Law School",
  DRAMA = "School of Drama",
  MEDICINE = "School of Medicine",
  ENVIRONMENT = "School of the Environment",
  ARCHITECTURE = "School of Architecture",
  MANAGEMENT = "School of Management",
  GSAS_ADMIN = "Graduate School of Arts & Sciences (GSAS) Administration",
  GSAS = "Graduate School of Arts & Sciences (GSAS)",
}

interface AffiliationDropdownProps {
  selectedAffiliation: ClubAffiliation[] | null;
  handleChange: (
    field: keyof IClubInput,
    value: string | number | ClubLeader[] | ClubAffiliation[] | undefined | ClubCategory[],
  ) => void;
}

const AffiliationDropdown: React.FC<AffiliationDropdownProps> = ({ selectedAffiliation, handleChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const allAffiliations = Object.values(ClubAffiliation);

  const handleSelect = (affiliation: string) => {
    if (selectedAffiliation && selectedAffiliation.includes(affiliation as ClubAffiliation)) return;
    handleChange("affiliations", [affiliation as ClubAffiliation]); // "affiliations" matches the IClubInput type
    setIsDropdownOpen(false);
  };

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
        Club Affiliation
        <div
          onClick={() => setIsDropdownOpen((prev) => !prev)}
          className="border border-gray-300 rounded-lg px-4 py-2 cursor-pointer bg-white"
        >
          {selectedAffiliation && selectedAffiliation.length > 0 ? (
            <span className="text-gray-800 truncate">{selectedAffiliation}</span>
          ) : (
            <span className="text-gray-400 truncate">Select an affiliation</span>
          )}
        </div>
      </label>

      {isDropdownOpen && (
        <div className="absolute mt-1 max-h-60 w-full overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg z-10">
          {allAffiliations.map((affiliation: ClubAffiliation) => (
            <div
              key={affiliation}
              className={`cursor-pointer px-4 py-2 ${
                selectedAffiliation?.includes(affiliation as ClubAffiliation)
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "hover:bg-gray-200"
              }`}
              onClick={() => handleSelect(affiliation)}
            >
              {affiliation}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AffiliationDropdown;
