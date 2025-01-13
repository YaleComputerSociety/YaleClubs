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
      className="px-4 py-2 w-full sm:w-80 lg:w-96 xl:w-[32rem] border rounded text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text h-11"
    />
  );
};

export default SearchBar;
