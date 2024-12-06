import React, { useState, useRef, useEffect } from "react";
import { IClub } from "@/lib/models/Club";
import { Category } from "@/lib/models/Club";

interface CategoryFilterButtonProps {
  setFilteredGroups: React.Dispatch<React.SetStateAction<IClub[]>>;
  selectedCategories: string[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
}

const CategoryFilterButton = ({ selectedCategories, setSelectedCategories }: CategoryFilterButtonProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const categories = Object.values(Category);

  const availableCategories = categories.filter((category) => !selectedCategories.includes(category));

  const handleAddCategory = (category: string) => {
    setSelectedCategories((prev) => [...prev, category]);
  };

  const handleRemoveCategory = (category: string) => {
    setSelectedCategories((prev) => prev.filter((cat) => cat !== category));
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
          {selectedCategories.length > 0 ? (
            selectedCategories.map((category) => (
              <div
                key={category}
                className="bg-gray-200 px-2 py-1 rounded-full text-sm flex items-center space-x-1 min-w-[120px] flex-shrink-0 justify-between"
              >
                <span className="truncate">{category}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveCategory(category);
                  }}
                  className="text-gray-600 hover:text-gray-800 focus:outline-none"
                >
                  &#x2715;
                </button>
              </div>
            ))
          ) : (
            <span className="text-gray-600">Categories</span>
          )}
        </div>
        <span className="ml-2">&#x25BC;</span>
      </div>
      {showDropdown && (
        <div className="absolute mt-2 w-72 max-w-full bg-white border rounded shadow-lg z-10">
          <div className="flex flex-col p-2 gap-2 max-h-72 overflow-y-auto">
            {availableCategories.length > 0 ? (
              availableCategories.map((category) => (
                <div
                  key={category}
                  className="cursor-pointer hover:bg-gray-100 px-4 py-2 rounded"
                  onClick={() => handleAddCategory(category)}
                >
                  {category}
                </div>
              ))
            ) : (
              <div className="text-gray-600 px-4 py-2">No more categories available</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryFilterButton;
