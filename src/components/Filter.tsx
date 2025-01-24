import React, { useState, useRef, useEffect } from "react";

interface FilterProps {
  selectedItems: string[];
  setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
  allItems: string[];
  label: string;
  aliasMapping?: Record<string, string[]>; // Optional alias mapping
}

const MAX_TOGGLE_WIDTH = 320;

const Filter = ({ selectedItems, setSelectedItems, allItems, label, aliasMapping = {} }: FilterProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const availableItems = allItems.filter((item) => {
    if (selectedItems.includes(item)) return false;

    const searchTermLower = searchTerm.toLowerCase().trim();

    // Direct match with item name
    if (item.toLowerCase().includes(searchTermLower)) return true;

    // Check aliases
    const matchingAlias = Object.entries(aliasMapping).some(
      ([alias, names]) => alias.toLowerCase().includes(searchTermLower) && names.includes(item),
    );

    return matchingAlias;
  });

  const handleAddItem = (item: string) => {
    setSelectedItems((prev) => [...prev, item]);
    setSearchTerm("");
  };

  const handleRemoveItem = (item: string) => {
    setSelectedItems((prev) => prev.filter((selected) => selected !== item));
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setShowDropdown(false);
    }
  };

  const handleClearAll = () => {
    setSelectedItems([]);
    setSearchTerm("");
  };

  useEffect(() => {
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      searchInputRef.current?.focus();
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
        className=" px-2 py-2 rounded cursor-pointer min-w-[5rem] max-w-[20rem] flex items-center justify-between h-10 md:h-11 hover:bg-gray-200 transition-colors duration-200"
        onClick={() => setShowDropdown((prev) => !prev)}
      >
        <div className="flex items-center overflow-hidden min-w-0 space-x-2">
          {selectedItems.length > 0 ? (
            <span className="truncate text-blue-500">{getToggleSummary()}</span>
          ) : (
            <span className="text-gray-600">{label}</span>
          )}
        </div>
        {selectedItems.length > 0 ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClearAll();
            }}
            className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            &#x2715;
          </button>
        ) : (
          <span className="ml-2 text-xs">&#x25BC;</span>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute mt-2 sm:w-full sm:left-0 lg:w-96 bg-white border rounded shadow-lg z-10">
          {/* Tags Section (Conditional) */}
          {selectedItems.length > 0 && (
            <div className="p-2 border-b flex items-center">
              <div className="flex flex-wrap gap-1 flex-grow">
                {selectedItems.map((item) => (
                  <div
                    key={item}
                    className="bg-gray-200 text-gray-600 px-2 py-1 rounded-lg flex items-center space-x-1 text-sm"
                  >
                    <span>{item}</span>
                    <button
                      onClick={() => handleRemoveItem(item)}
                      className="text-gray-500 hover:text-red-700 focus:outline-none"
                    >
                      &#x2715;
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearAll();
                }}
                className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                &#x2715;
              </button>
            </div>
          )}

          {/* Search Input */}
          <div className="p-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${label.toLowerCase()}...`}
              className="w-full px-2 py-1 border rounded-lg leading-relaxed focus:outline-none focus:ring focus:border-blue-300 text-sm"
              ref={searchInputRef}
            />
          </div>

          {/* Available Items */}
          <div className="flex flex-col max-h-72 overflow-y-auto">
            {availableItems.length > 0 ? (
              availableItems.map((item) => {
                return (
                  <div
                    key={item}
                    className="cursor-pointer hover:bg-gray-100 px-4 py-2 rounded"
                    onClick={() => {
                      handleAddItem(item);
                      searchInputRef.current?.focus();
                    }}
                  >
                    <div>{item}</div>
                  </div>
                );
              })
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
