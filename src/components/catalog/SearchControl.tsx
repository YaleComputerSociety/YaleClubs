import React from "react";
import SearchBar from "./SearchBar";
import FilterButton from "./FilterButton";
import { IClub } from "@/lib/models/Club";

interface SearchControlProps {
  allGroups: IClub[];
  setFilteredGroups: React.Dispatch<React.SetStateAction<IClub[]>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  selectedCategories: string[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
}

const SearchControl = ({
  allGroups,
  setFilteredGroups,
  searchQuery,
  setSearchQuery,
  selectedCategories,
  setSelectedCategories,
}: SearchControlProps) => {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-8">
      <div className="w-full md:w-[600px]">
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </div>
      <div className="md:w-auto w-full">
        <FilterButton
          allGroups={allGroups}
          setFilteredGroups={setFilteredGroups}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
        />
      </div>
    </div>
  );
};

export default SearchControl;
