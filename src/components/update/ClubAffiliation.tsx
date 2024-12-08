import React, { useState, useRef, useEffect } from "react";
import { IClubInput, Affiliation } from "@/lib/models/Club";

interface AffiliationsDropdownProps {
  selectedAffiliations: Affiliation[];
  additionalAffiliations?: string[];
  handleChange: (field: keyof IClubInput, value: string | number | Affiliation[] | undefined) => void;
}

const AffiliationsDropdown: React.FC<AffiliationsDropdownProps> = ({
  selectedAffiliations,
  additionalAffiliations = [],
  handleChange,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const allAffiliations = [
    ...Object.values(Affiliation),
    ...additionalAffiliations.filter((cat) => !Object.values(Affiliation).includes(cat as Affiliation)),
  ];

  const toggleAffiliation = (Affiliation: string) => {
    if (selectedAffiliations.includes(Affiliation as Affiliation)) return;
    const updatedAffiliations = [...selectedAffiliations, Affiliation as Affiliation];
    handleChange("affiliations", updatedAffiliations);
  };

  const removeAffiliation = (Affiliation: string) => {
    handleChange(
      "affiliations",
      selectedAffiliations.filter((cat) => cat !== Affiliation),
    );
  };

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
        Affiliations
        <div
          onClick={() => setIsDropdownOpen((prev) => !prev)}
          className="border border-gray-300 rounded-lg px-4 py-2 cursor-pointer bg-white"
        >
          {selectedAffiliations.length > 0 ? (
            <span>{selectedAffiliations.join(", ")}</span>
          ) : (
            <span className="text-gray-400">Select categories</span>
          )}
        </div>
      </label>

      {isDropdownOpen && (
        <div className="absolute mt-1 max-h-60 w-full overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg z-10">
          {allAffiliations.map((Affiliation) => (
            <div
              key={Affiliation}
              className={`cursor-pointer px-4 py-2 ${
                selectedAffiliations.includes(Affiliation as Affiliation)
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "hover:bg-gray-200"
              }`}
              onClick={() => toggleAffiliation(Affiliation)}
            >
              {Affiliation}
            </div>
          ))}
        </div>
      )}
      {/* Selected Affiliations as Cards */}
      <div className="flex gap-2 whitespace-nowrap w-full flex-wrap mt-4">
        {selectedAffiliations.map((Affiliation: Affiliation, index: number) => (
          <div key={index} className="flex items-center bg-gray-200 rounded px-2 py-1 text-sm">
            {Affiliation}
            <button
              onClick={() => removeAffiliation(Affiliation)}
              className="ml-2 text-red-500 font-bold hover:text-red-700"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AffiliationsDropdown;
