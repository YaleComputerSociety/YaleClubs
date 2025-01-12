import React, { useState, useRef, useEffect } from "react";

interface FilterProps {
  selectedItems: string[];
  setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
  allItems: string[];
  label: string;
}

const MAX_TOGGLE_WIDTH = 450; // Maximum width of the filter toggle before showing "+x"
const DROPDOWN_WIDTH = "20rem"; // You can adjust this as needed

const Filter = ({ selectedItems, setSelectedItems, allItems, label }: FilterProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const availableItems = allItems.filter(
    (item) => !selectedItems.includes(item) && item.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAddItem = (item: string) => {
    setSelectedItems((prev) => [...prev, item]);
    setSearchTerm(""); // Clear the search term
  };

  const handleRemoveItem = (item: string) => {
    setSelectedItems((prev) => prev.filter((selected) => selected !== item));
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

  const getToggleSummary = () => {
    const visibleFilters: string[] = [];
    let currentLength = 0;

    for (const item of selectedItems) {
      if (currentLength + item.length <= MAX_TOGGLE_WIDTH / 8) {
        visibleFilters.push(item);
        currentLength += item.length;
      } else {
        break;
      }
    }

    const remaining = selectedItems.length - visibleFilters.length;
    return visibleFilters.join(", ") + (remaining > 0 ? ` +${remaining}` : "");
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Filter Toggle */}
      <div
        className="border px-4 py-2 rounded cursor-pointer min-w-[12rem] max-w-[30rem] flex items-center justify-between h-9 md:h-11"
        onClick={() => setShowDropdown((prev) => !prev)}
      >
        {/* Toggle Summary */}
        <div className="flex items-center overflow-hidden min-w-0 space-x-2">
          {selectedItems.length > 0 ? (
            <span className="truncate text-gray-800">{getToggleSummary()}</span>
          ) : (
            <span className="text-gray-600">{label}</span>
          )}
        </div>
        {/* <span className="ml-2">&#x25BC;</span> */}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className={`absolute mt-2 ${DROPDOWN_WIDTH} max-w-full bg-white border rounded shadow-lg z-10`}>
          {/* Search Input */}
          <div className="p-2 border-b flex flex-wrap items-center gap-1">
            {selectedItems.map((item) => (
              <div
                key={item}
                className="bg-blue-100 text-blue-600 px-2 py-1 rounded-lg flex items-center space-x-1 text-sm"
              >
                <span>{item}</span>
                <button
                  onClick={() => handleRemoveItem(item)}
                  className="text-blue-500 hover:text-blue-700 focus:outline-none"
                >
                  &#x2715;
                </button>
              </div>
            ))}
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${label.toLowerCase()}...`}
              className="flex-1 px-2 py-1 border rounded focus:outline-none focus:ring focus:border-blue-300 text-sm"
            />
          </div>

          {/* Available Items */}
          <div className="flex flex-col p-2 gap-2 max-h-72 overflow-y-auto">
            {availableItems.length > 0 ? (
              availableItems.map((item) => (
                <div
                  key={item}
                  className="cursor-pointer hover:bg-gray-100 px-4 py-2 rounded"
                  onClick={() => handleAddItem(item)}
                >
                  {item}
                </div>
              ))
            ) : (
              <div className="text-gray-600 px-4 py-2">No {label.toLowerCase()} found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Filter;
