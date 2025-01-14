import React, { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from "react";
import { IClubInput } from "@/lib/models/Club";

interface AliasesDropdownProps {
  selectedAliases: string[];
  handleChange: (field: keyof IClubInput, value: string[] | undefined) => void;
}

const AliasesDropdown: React.FC<AliasesDropdownProps> = ({ selectedAliases, handleChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [aliasInput, setAliasInput] = useState("");
  const [error, setError] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown/input area when clicking outside
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

  const addAlias = () => {
    // Trim the input
    const trimmedAlias = aliasInput.trim();

    // Validate alias length and max count
    if (!trimmedAlias) {
      setError("Alias cannot be empty.");
      return;
    }
    if (trimmedAlias.length > 50) {
      setError("Alias must be under 50 characters.");
      return;
    }
    if (selectedAliases.length >= 2) {
      setError("You can only add up to 2 aliases.");
      return;
    }
    if (selectedAliases.includes(trimmedAlias)) {
      setError("Alias already added.");
      return;
    }

    // Add alias and clear input and error
    const updatedAliases = [...selectedAliases, trimmedAlias];
    handleChange("aliases", updatedAliases);
    setAliasInput("");
    setError("");
  };

  const removeAlias = (alias: string) => {
    const updatedAliases = selectedAliases.filter((item) => item !== alias);
    handleChange("aliases", updatedAliases);
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addAlias();
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAliasInput(e.target.value);
    if (error) setError("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">Club Aliases</label>
      <div
        onClick={() => setIsDropdownOpen((prev) => !prev)}
        className="border border-gray-300 rounded-lg px-4 py-2 cursor-pointer bg-white"
      >
        {selectedAliases.length > 0 ? (
          <span>{selectedAliases.join(", ")}</span>
        ) : (
          <span className="text-gray-400">Enter club aliases</span>
        )}
      </div>

      {isDropdownOpen && (
        <div className="absolute mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10 p-4">
          <input
            type="text"
            value={aliasInput}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            placeholder="Type alias and press Enter"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addAlias}
            className="mt-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            disabled={selectedAliases.length >= 5}
          >
            Add Alias
          </button>
          {error && <div className="mt-2 text-red-500 text-sm">{error}</div>}
          <div className="flex gap-2 whitespace-nowrap w-full flex-wrap mt-4">
            {selectedAliases.map((alias, index) => (
              <div key={index} className="flex items-center bg-gray-200 rounded px-2 py-1 text-sm">
                {alias}
                <button onClick={() => removeAlias(alias)} className="ml-2 text-red-500 font-bold hover:text-red-700">
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Display selected aliases when dropdown is closed */}
      {!isDropdownOpen && selectedAliases.length > 0 && (
        <div className="flex gap-2 whitespace-nowrap w-full flex-wrap mt-4">
          {selectedAliases.map((alias, index) => (
            <div key={index} className="flex items-center bg-gray-200 rounded px-2 py-1 text-sm">
              {alias}
              <button onClick={() => removeAlias(alias)} className="ml-2 text-red-500 font-bold hover:text-red-700">
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AliasesDropdown;
