import React, { useState } from "react";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

const SearchBar = ({ searchQuery, setSearchQuery }: SearchBarProps) => {
  const [searchType, setSearchType] = useState("clubs"); // New state for dropdown selection

  return (
    <div className="flex items-center border rounded overflow-hidden w-full sm:w-80 lg:w-96 xl:w-[32rem]">
      {/* Dropdown for selecting search type */}
      <select
        value={searchType}
        onChange={(e) => setSearchType(e.target.value)}
        className="px-3 py-2 bg-white border-r text-gray-600 focus:outline-none cursor-pointer"
      >
        <option value="clubs">Clubs</option>
        <option value="people">People</option>
      </select>

      {/* Search Bar */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search..."
        className="px-4 py-2 w-full text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text h-11"
      />
    </div>
  );
};

export default SearchBar;
