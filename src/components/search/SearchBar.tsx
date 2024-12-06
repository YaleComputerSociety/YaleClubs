import React from "react";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

const SearchBar = ({ searchQuery, setSearchQuery }: SearchBarProps) => {
  return (
    <input
      type="text"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Search..."
      className="px-4 py-2 w-full md:w-auto border rounded-full text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer h-9 md:h-11"
    />
  );
};

export default SearchBar;
