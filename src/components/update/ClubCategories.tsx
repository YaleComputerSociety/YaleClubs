import React, { useState, useRef, useEffect } from "react";
import { IClubInput, Category } from "@/lib/models/Club";

// enum Category {
//   SPORTS = "Sports",
//   ARTS = "Arts",
//   TECHNOLOGY = "Technology",
//   MUSIC = "Music",
// }

interface CategoriesDropdownProps {
  selectedCategories: Category[];
  additionalCategories?: string[];
  handleChange: (field: keyof IClubInput, value: string | number | Category[] | undefined) => void;
}

const CategoriesDropdown: React.FC<CategoriesDropdownProps> = ({
  selectedCategories,
  additionalCategories = [],
  handleChange,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const allCategories = [
    ...Object.values(Category),
    ...additionalCategories.filter((cat) => !Object.values(Category).includes(cat as Category)),
  ];

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category as Category)) return;
    const updatedCategories = [...selectedCategories, category as Category];
    handleChange("categories", updatedCategories);
  };

  const removeCategory = (category: string) => {
    handleChange(
      "categories",
      selectedCategories.filter((cat) => cat !== category),
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
        Club Categories
        <div
          onClick={() => setIsDropdownOpen((prev) => !prev)}
          className="border border-gray-300 rounded-lg px-4 py-2 cursor-pointer bg-white"
        >
          {selectedCategories.length > 0 ? (
            <span>{selectedCategories.join(", ")}</span>
          ) : (
            <span className="text-gray-400">Select categories</span>
          )}
        </div>
      </label>

      {isDropdownOpen && (
        <div className="absolute mt-1 max-h-60 w-full overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg z-10">
          {allCategories.map((category) => (
            <div
              key={category}
              className={`cursor-pointer px-4 py-2 ${
                selectedCategories.includes(category as Category)
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "hover:bg-gray-200"
              }`}
              onClick={() => toggleCategory(category)}
            >
              {category}
            </div>
          ))}
        </div>
      )}
      {/* Selected Categories as Cards */}
      <div className="flex gap-2 whitespace-nowrap w-full flex-wrap mt-4">
        {selectedCategories.map((category: Category, index: number) => (
          <div key={index} className="flex items-center bg-gray-200 rounded px-2 py-1 text-sm">
            {category}
            <button onClick={() => removeCategory(category)} className="ml-2 text-red-500 font-bold hover:text-red-700">
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesDropdown;
