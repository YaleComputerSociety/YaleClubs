import React, { useState, useRef, useEffect } from "react";
import { IClub } from "@/lib/models/Club";

interface FilterButtonProps {
  setFilteredGroups: React.Dispatch<React.SetStateAction<IClub[]>>;
  allGroups: IClub[];
  selectedCategories: string[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
}

const FilterButton = ({
  setFilteredGroups,
  allGroups,
  selectedCategories,
  setSelectedCategories,
}: FilterButtonProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const categories = [
    "Pre-Professional",
    "Entrepreneurial/Business",
    "Media/Technology",
    "Science/Technology",
    "Cultural",
  ];

  const handleCategoryChange = (category: string) => {
    let updatedCategories = [...selectedCategories];
    if (updatedCategories.includes(category)) {
      updatedCategories = updatedCategories.filter((cat) => cat !== category);
    } else {
      updatedCategories.push(category);
    }
    setSelectedCategories(updatedCategories);

    setShowDropdown(false);
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
        className="border px-4 py-2 rounded cursor-pointer w-72 max-w-full flex items-center justify-between"
        onClick={() => setShowDropdown((prev) => !prev)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center overflow-hidden">
            <div className="truncate">
              {selectedCategories.length > 0 ? (
                selectedCategories.map((category) => (
                  <span key={category} className="bg-gray-200 px-2 py-1 rounded-full text-sm mr-2">
                    {category}
                  </span>
                ))
              ) : (
                <span className="text-gray-600">Categories</span>
              )}
            </div>
          </div>
        </div>
        <span className="ml-2">&#x25BC;</span>
      </div>
      {showDropdown && (
        <div className="absolute mt-2 w-72 max-w-full bg-white border rounded shadow-lg z-10">
          <div className="flex flex-col p-2 gap-2">
            {categories.map((category) => (
              <div
                key={category}
                className="cursor-pointer hover:bg-gray-100 px-4 py-2 rounded"
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterButton;
